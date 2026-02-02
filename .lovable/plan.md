

# ZIVO P2P Car Rental - Stripe Payments, Commission & Payouts Implementation Plan

## Executive Summary

This plan implements a complete Stripe-based payment system for the ZIVO P2P Car Rental Marketplace where ZIVO acts as the merchant of record. The system will handle renter payments, automatic commission calculation, and owner payouts via Stripe Connect Express accounts.

---

## Current State Analysis

The codebase already has significant P2P payment infrastructure:

**Existing Components:**
- `create-p2p-checkout` edge function - Creates Stripe Checkout sessions for bookings
- `process-p2p-payout` edge function - Creates payout records (but doesn't transfer via Stripe)
- `process-p2p-refund` edge function - Processes refunds via Stripe
- `stripe-webhook` - Handles checkout completion and updates booking status
- `useP2PPayment.ts` - Frontend hooks for checkout, payouts, refunds
- Admin modules for P2P Payouts, Owners, Bookings, Disputes
- Owner dashboard with earnings/payouts view

**Database Tables Ready:**
- `p2p_bookings` - Has `owner_payout`, `platform_fee`, `stripe_payment_intent_id`
- `p2p_payouts` - Has `stripe_transfer_id`, `stripe_payout_id`, status tracking
- `car_owner_profiles` - Has `stripe_account_id`, `payout_enabled`
- `p2p_commission_settings` - Has `owner_commission_pct`, `renter_service_fee_pct`

**What's Missing:**
1. **Stripe Connect Onboarding** - No edge function to create/link Express accounts
2. **Actual Stripe Transfers** - Payouts create records but don't execute Stripe transfers
3. **Commission Admin UI** - No interface to configure commission rates
4. **Account Status Verification** - No checking if owner can receive payouts
5. **Payout Eligibility Logic** - 24-48 hour hold after trip completion
6. **Dispute Payout Hold** - Automated pause when disputes exist
7. **Renter Receipt Component** - No dedicated receipt/confirmation UI

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ZIVO P2P PAYMENT FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RENTER BOOKING FLOW                                                        │
│  ┌──────────┐    ┌─────────────────────┐    ┌───────────────────────┐      │
│  │  Renter  │───>│ create-p2p-checkout │───>│ Stripe Checkout       │      │
│  │  Books   │    │ Edge Function       │    │ (Payment captured)    │      │
│  └──────────┘    └─────────────────────┘    └───────────────────────┘      │
│                           │                            │                    │
│                           ▼                            ▼                    │
│              ┌─────────────────────┐      ┌───────────────────────────┐    │
│              │ p2p_bookings table  │      │ stripe-webhook updates    │    │
│              │ payment_status=paid │<─────│ booking to 'confirmed'    │    │
│              └─────────────────────┘      └───────────────────────────┘    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OWNER STRIPE CONNECT ONBOARDING                                            │
│  ┌──────────┐    ┌──────────────────────────┐    ┌────────────────────┐    │
│  │  Owner   │───>│ create-stripe-connect    │───>│ Stripe Express     │    │
│  │  Clicks  │    │ Edge Function            │    │ Onboarding Flow    │    │
│  │ "Connect"│    └──────────────────────────┘    └────────────────────┘    │
│  └──────────┘                                             │                 │
│                                                           ▼                 │
│                                      ┌────────────────────────────────┐    │
│                                      │ car_owner_profiles updated     │    │
│                                      │ stripe_account_id = acct_xxx   │    │
│                                      │ payout_enabled = true          │    │
│                                      └────────────────────────────────┘    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PAYOUT EXECUTION FLOW                                                      │
│  ┌───────────────┐    ┌──────────────────────────┐    ┌────────────────┐   │
│  │ Trip Complete │───>│ Check eligibility:       │───>│ execute-p2p-   │   │
│  │ + 24-48 hours │    │ • No disputes            │    │ payout         │   │
│  │               │    │ • Owner has Stripe acct  │    │ Edge Function  │   │
│  └───────────────┘    │ • Hold period passed     │    └────────────────┘   │
│                       └──────────────────────────┘             │            │
│                                                                ▼            │
│                                               ┌────────────────────────┐   │
│                                               │ stripe.transfers.create│   │
│                                               │ from ZIVO → Owner      │   │
│                                               │ Amount = owner_payout  │   │
│                                               └────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Stripe Connect Owner Onboarding

Create the edge function and frontend flow for owners to connect their Stripe Express accounts.

**Edge Function: `create-stripe-connect-link`**
- Creates a Stripe Express account for the owner
- Returns an onboarding link (Account Link)
- Updates `car_owner_profiles.stripe_account_id`

**Edge Function: `check-stripe-connect-status`**
- Verifies the owner's account status
- Updates `payout_enabled` based on account state
- Returns whether charges and payouts are enabled

**Frontend Changes:**
- Update `OwnerPayouts.tsx` with working "Connect Stripe" button
- Add onboarding return page to handle redirect from Stripe
- Show account status (pending verification, active, disabled)

---

### Phase 2: Execute Real Stripe Transfers

Upgrade the payout system to actually transfer funds via Stripe Connect.

**Edge Function: `execute-p2p-payout`** (new)
- Validate payout eligibility
- Check for active disputes on the booking
- Verify owner has connected Stripe account with payouts enabled
- Create Stripe Transfer to owner's connected account
- Update `p2p_payouts` with `stripe_transfer_id`
- Handle partial payouts for dispute resolutions

**Payout Eligibility Rules:**
- Trip status = `completed`
- Payment status = `captured` or `paid`
- 24 hours minimum since trip completion
- No active disputes on the booking (or dispute resolved)
- Owner has connected Stripe account with `payouts_enabled = true`

---

### Phase 3: Commission Configuration Admin UI

Create an admin interface to manage P2P commission settings.

**New Admin Module: Commission Settings**
- View current commission rates
- Edit `owner_commission_pct` (15-30% range)
- Edit `renter_service_fee_pct`
- Edit `insurance_daily_fee`
- Toggle settings active/inactive
- Show preview of how fees affect a sample booking

**Database Updates:**
- Ensure `p2p_commission_settings` has default row
- Add validation that percentages are within 15-30% range

---

### Phase 4: Enhanced Payout Admin Controls

Upgrade the Admin Payouts module for full control.

**Admin Features:**
- View all pending payouts with eligibility status
- "Process Payout" button that calls `execute-p2p-payout`
- "Hold Payout" button with reason field
- Bulk process eligible payouts
- Filter by: status, date range, owner, booking
- Show Stripe Transfer ID and status
- View dispute status that blocks payout

**Payout Hold Logic:**
- Admin can manually hold any payout
- Automatic hold when dispute exists on booking
- Hold is released when dispute is resolved
- Show hold reason in payout details

---

### Phase 5: Owner Earnings Dashboard Enhancement

Improve the owner dashboard with Stripe Connect integration.

**Owner Dashboard Updates:**
- Real "Connect Stripe" button that initiates onboarding
- Account status indicator (not connected, pending, verified)
- Balance breakdown: available, pending, held
- Weekly/monthly earnings charts
- Trip-by-trip earnings breakdown
- Direct link to Stripe Express dashboard

**Payout History Enhancements:**
- Show estimated payout date for pending items
- Show Stripe Transfer ID for completed payouts
- Show hold status with reason if applicable

---

### Phase 6: Renter Receipt & Confirmation

Create a proper receipt view for renters after payment.

**Receipt Component:**
- Booking confirmation number
- Vehicle details (make, model, year, image)
- Rental dates and duration
- Price breakdown (daily rate, subtotal, service fee, insurance, taxes)
- Total paid amount
- Payment method (last 4 digits if available)
- Owner contact info
- Cancellation policy reminder
- Link to manage booking

**Email Receipt (optional future):**
- Trigger email on successful payment
- Include same details as web receipt
- PDF attachment option

---

## Technical Implementation Details

### New Edge Functions

| Function | Purpose | JWT Verified |
|----------|---------|--------------|
| `create-stripe-connect-link` | Create Stripe Express account and return onboarding URL | Yes |
| `check-stripe-connect-status` | Check owner's Stripe account status | Yes |
| `execute-p2p-payout` | Transfer funds to owner via Stripe Connect | Yes (Admin) |

### New Frontend Hooks

```text
useCreateStripeConnectLink()   - Initiate owner Stripe onboarding
useCheckStripeConnectStatus()  - Check owner's account status
useExecutePayout()             - Admin: execute a specific payout
useP2PCommissionSettings()     - Fetch commission settings
useUpdateCommissionSettings()  - Admin: update commission rates
```

### New Components

```text
src/components/p2p/
├── StripeConnectButton.tsx       - Owner onboarding button
├── StripeAccountStatus.tsx       - Show connected account status
├── RenterReceipt.tsx             - Booking receipt view
└── PayoutEligibilityBadge.tsx    - Show payout eligibility status

src/pages/owner/
└── StripeConnectReturn.tsx       - Handle Stripe onboarding return

src/pages/admin/modules/
└── AdminP2PCommissionModule.tsx  - Commission settings admin
```

### Database Migration

```text
-- Add payout eligibility tracking
ALTER TABLE p2p_bookings ADD COLUMN IF NOT EXISTS payout_eligible_at timestamptz;
ALTER TABLE p2p_bookings ADD COLUMN IF NOT EXISTS payout_hold_reason text;

-- Add hold tracking to payouts
ALTER TABLE p2p_payouts ADD COLUMN IF NOT EXISTS is_held boolean DEFAULT false;
ALTER TABLE p2p_payouts ADD COLUMN IF NOT EXISTS held_reason text;
ALTER TABLE p2p_payouts ADD COLUMN IF NOT EXISTS held_at timestamptz;
ALTER TABLE p2p_payouts ADD COLUMN IF NOT EXISTS held_by uuid;

-- Add Stripe Connect currency field
ALTER TABLE car_owner_profiles ADD COLUMN IF NOT EXISTS stripe_account_currency text DEFAULT 'usd';
ALTER TABLE car_owner_profiles ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false;
ALTER TABLE car_owner_profiles ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean DEFAULT false;

-- Ensure commission settings has default row
INSERT INTO p2p_commission_settings (name, owner_commission_pct, renter_service_fee_pct, insurance_daily_fee, is_active)
VALUES ('default', 20, 10, 15, true)
ON CONFLICT DO NOTHING;
```

### Stripe Connect Implementation Notes

**Express Account Setup:**
```text
1. Call stripe.accounts.create({ type: 'express', country: 'US', ... })
2. Generate Account Link with return_url and refresh_url
3. Redirect owner to Stripe-hosted onboarding
4. On return, verify account status
5. Store account ID and capability status
```

**Transfer Execution:**
```text
1. stripe.transfers.create({
     amount: ownerPayoutCents,
     currency: 'usd',
     destination: owner.stripe_account_id,
     transfer_group: bookingId,
     metadata: { booking_id, payout_id }
   })
2. Store transfer.id in p2p_payouts.stripe_transfer_id
3. Update payout status to 'completed'
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/create-stripe-connect-link/index.ts` | Create | Stripe Express onboarding |
| `supabase/functions/check-stripe-connect-status/index.ts` | Create | Verify owner account status |
| `supabase/functions/execute-p2p-payout/index.ts` | Create | Execute actual Stripe transfer |
| `supabase/config.toml` | Update | Register new edge functions |
| `src/hooks/useStripeConnect.ts` | Create | Stripe Connect hooks |
| `src/hooks/useP2PPayment.ts` | Update | Add payout execution hooks |
| `src/hooks/useP2PCommission.ts` | Create | Commission settings hooks |
| `src/components/p2p/StripeConnectButton.tsx` | Create | Owner onboarding UI |
| `src/components/p2p/RenterReceipt.tsx` | Create | Booking receipt component |
| `src/pages/owner/OwnerPayouts.tsx` | Update | Add real Stripe Connect flow |
| `src/pages/owner/StripeConnectReturn.tsx` | Create | Handle onboarding return |
| `src/pages/p2p/P2PBookingConfirmation.tsx` | Update | Show receipt after payment |
| `src/pages/admin/modules/AdminP2PPayoutsModule.tsx` | Update | Add execute/hold buttons |
| `src/pages/admin/modules/AdminP2PCommissionModule.tsx` | Create | Commission settings UI |
| `src/pages/admin/AdminPanel.tsx` | Update | Add Commission nav item |
| SQL Migration | Create | Add payout tracking columns |

---

## Security Considerations

1. **Stripe Keys**: Never expose secret keys; all Stripe operations in edge functions
2. **Authorization**: Verify booking/payout ownership before any action
3. **Admin Validation**: Check `user_roles` for admin access on sensitive operations
4. **Amount Validation**: Server-side calculation of commission/payout amounts
5. **Idempotency**: Use Stripe idempotency keys to prevent duplicate transfers
6. **Webhook Verification**: Validate Stripe webhook signatures

---

## Testing Plan

1. **Owner Onboarding**: Create test Stripe Express account flow
2. **Payment Flow**: Complete booking payment end-to-end
3. **Payout Execution**: Transfer funds to test connected account
4. **Commission Calculation**: Verify 20% default and custom rates
5. **Dispute Hold**: Confirm payouts are blocked when disputes exist
6. **Admin Controls**: Test hold/release/process actions
7. **Error Handling**: Test failure scenarios (invalid account, insufficient funds)

---

## Environment Variables Required

The following Stripe secrets should already be configured:
- `STRIPE_SECRET_KEY` (confirmed present)

No additional secrets required - Stripe Connect uses the same API key.

