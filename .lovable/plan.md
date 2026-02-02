

# ZIVO Flights: Non-Affiliate Merchant-of-Record Implementation Plan

## Executive Summary

Transform ZIVO Flights from a referral/affiliate model to a full Merchant-of-Record (MoR) model where ZIVO collects payment directly from customers, with ticketing issued by licensed partners under a sub-agent agreement. This is a significant architectural change requiring new database tables, Edge Functions, checkout flows, and compliance updates.

---

## Current State Analysis

### What Exists (to Reuse/Modify)
- **Duffel API Integration**: `supabase/functions/duffel-flights/` - real flight search, offers, order creation
- **Duffel Hooks**: `src/hooks/useDuffelFlights.ts` - search, offer retrieval
- **Flight Search Flow**: `FlightSearch.tsx` -> `FlightResults.tsx` -> `FlightDetails.tsx` -> `FlightTravelerInfo.tsx`
- **`flight_bookings` table**: Already exists with `booking_reference`, `total_amount`, `payment_status`, etc.
- **Passenger Form**: `FlightTravelerInfo.tsx` already collects passenger details
- **Admin Flight Management**: `AdminFlightManagement.tsx` with bookings table
- **Stripe Integration**: Existing patterns in `create-p2p-checkout`, `stripe-webhook`
- **MyTripsDashboard**: Existing UI for trip management

### What Must Change
- Remove all affiliate language ("Redirects to partner", "indicative pricing")
- Add Stripe payment processing for flights (ZIVO = MoR)
- Create flight order with ticketing partner after payment
- Store PNR, e-ticket numbers from ticketing partner
- Update compliance text (ZIVO is seller, tickets via licensed partners)
- Add Flight Terms legal page
- Enhance admin panel for ticket status, refunds, schedule changes

---

## Database Schema Changes

### 1. Enhance `flight_bookings` Table

```sql
ALTER TABLE flight_bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS pnr TEXT,                        -- Partner booking reference (PNR)
ADD COLUMN IF NOT EXISTS ticket_numbers JSONB,            -- Array of e-ticket numbers per passenger
ADD COLUMN IF NOT EXISTS ticketing_status TEXT DEFAULT 'pending' 
    CHECK (ticketing_status IN ('pending', 'processing', 'issued', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS ticketing_partner TEXT,          -- 'duffel', 'amadeus', etc.
ADD COLUMN IF NOT EXISTS ticketing_partner_order_id TEXT, -- Partner's order ID
ADD COLUMN IF NOT EXISTS ticketing_error TEXT,
ADD COLUMN IF NOT EXISTS ticketed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS baggage_allowance JSONB,
ADD COLUMN IF NOT EXISTS fare_rules JSONB,               -- Cancellation/change policies
ADD COLUMN IF NOT EXISTS itinerary_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_status TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ;
```

### 2. New Table: `flight_passengers`

```sql
CREATE TABLE flight_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES flight_bookings(id) ON DELETE CASCADE,
  passenger_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  given_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('m', 'f')),
  born_on DATE NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  passport_country TEXT,
  nationality TEXT,
  ticket_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id, passenger_index)
);

ALTER TABLE flight_passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own passengers"
  ON flight_passengers FOR SELECT TO authenticated
  USING (booking_id IN (SELECT id FROM flight_bookings WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert their own passengers"
  ON flight_passengers FOR INSERT TO authenticated
  WITH CHECK (booking_id IN (SELECT id FROM flight_bookings WHERE customer_id = auth.uid()));
```

### 3. New Table: `flight_ticketing_logs`

```sql
CREATE TABLE flight_ticketing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES flight_bookings(id),
  action TEXT NOT NULL, -- 'create_order', 'issue_ticket', 'cancel', 'refund', 'schedule_change'
  partner TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL, -- 'success', 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE flight_ticketing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ticketing logs"
  ON flight_ticketing_logs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));
```

---

## Files to Create

### Edge Functions

| File | Purpose |
|------|---------|
| `supabase/functions/create-flight-checkout/index.ts` | Create Stripe Checkout session for flight booking |
| `supabase/functions/issue-flight-ticket/index.ts` | After payment success, create order with ticketing partner |
| `supabase/functions/process-flight-refund/index.ts` | Handle refund requests via Stripe + partner API |
| `supabase/functions/send-flight-confirmation/index.ts` | Send itinerary email with PNR and e-tickets |

### Frontend Pages

| File | Purpose |
|------|---------|
| `src/pages/FlightCheckout.tsx` | Payment page with price breakdown, T&C checkbox, Stripe redirect |
| `src/pages/FlightConfirmation.tsx` | Post-payment confirmation with PNR, itinerary, next steps |
| `src/pages/legal/FlightTerms.tsx` | Flight-specific booking terms |

### Frontend Components

| File | Purpose |
|------|---------|
| `src/components/flight/FlightPriceBreakdown.tsx` | Clear fare + taxes + fees breakdown |
| `src/components/flight/FlightCheckoutForm.tsx` | Terms checkbox, payment button |
| `src/components/flight/FlightTicketCard.tsx` | Display e-ticket with ticket number |
| `src/components/flight/FlightChangeRequest.tsx` | Request change/cancellation form |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useFlightBooking.ts` | Create booking, handle payment, poll ticketing status |
| `src/hooks/useFlightTicket.ts` | Fetch ticket status, download itinerary |

### Config

| File | Purpose |
|------|---------|
| `src/config/flightMoRCompliance.ts` | New MoR compliance text (replaces affiliate language) |

---

## Files to Modify

### Major Changes

| File | Changes |
|------|---------|
| `src/config/flightCompliance.ts` | Replace affiliate text with MoR seller language |
| `src/pages/FlightTravelerInfo.tsx` | Remove partner handoff, navigate to FlightCheckout |
| `src/pages/FlightDetails.tsx` | Remove redirect CTA, add "Book Now" to checkout |
| `src/components/flight/FlightBookingSidebar.tsx` | Remove affiliate disclosure, show final price |
| `src/components/flight/TopSearchCTA.tsx` | Change to internal booking flow |
| `src/components/flight/StickyBookingCTA.tsx` | Change to internal checkout |
| `src/components/admin/AdminFlightManagement.tsx` | Add ticket status, refund actions, ticketing logs tab |
| `supabase/functions/duffel-flights/index.ts` | Enhance createOrder for real ticketing |
| `supabase/functions/stripe-webhook/index.ts` | Handle flight checkout sessions, trigger ticketing |
| `src/components/flight/MyTripsDashboard.tsx` | Show real bookings from DB with ticket numbers |

### Remove/Update Affiliate Components

| File | Action |
|------|--------|
| `src/components/flight/AffiliatePartnerSelector.tsx` | Delete or repurpose |
| `src/components/shared/CTAAffiliateNotice.tsx` | Hide for flights |
| `src/components/shared/RedirectDisclaimer.tsx` | Hide for flights |
| `src/components/results/AffiliateNotice.tsx` | Hide for flights |
| `src/lib/affiliateTracking.ts` | Not used for flights (keep for hotels/cars) |

---

## New Booking Flow

```text
1. Search Flights (/flights)
   └─> User enters origin, destination, dates, passengers

2. View Results (/flights/results)
   └─> Real-time prices from Duffel API
   └─> "Book Now" button (not "Compare Prices")

3. Flight Details (/flights/details/:id)
   └─> Full itinerary, baggage, fare rules
   └─> Price: $X (fare) + $Y (taxes) = $Z (total)
   └─> "Continue to Booking" button

4. Passenger Info (/flights/traveler-info)
   └─> Collect: Name, DOB, Gender, Email, Phone
   └─> International: Passport number, expiry, nationality
   └─> "Continue to Payment" button

5. Checkout (/flights/checkout)
   └─> Price breakdown (fare + taxes + fees = total)
   └─> Terms checkbox: "I agree to Terms and Airline Rules"
   └─> Stripe Checkout (card payment)
   └─> Creates flight_bookings record with status='pending_payment'

6. Stripe Checkout
   └─> Customer pays on Stripe-hosted page
   └─> ZIVO is merchant of record

7. Payment Success (Stripe Webhook)
   └─> Update flight_bookings.payment_status = 'paid'
   └─> Call issue-flight-ticket Edge Function
   └─> Create order with Duffel API
   └─> Store PNR, e-ticket numbers
   └─> Send confirmation email

8. Confirmation (/flights/confirmation/:bookingId)
   └─> Show PNR, itinerary, ticket numbers
   └─> Download PDF option
   └─> "View in My Trips" link

9. My Trips (/trips or dashboard)
   └─> View booking status, ticket numbers
   └─> Request change/cancellation (subject to fare rules)
```

---

## Key Edge Function: `create-flight-checkout`

```typescript
// Pseudocode structure
serve(async (req) => {
  // 1. Verify authenticated user
  // 2. Validate offer ID and passenger data
  // 3. Fetch offer from Duffel to confirm price
  // 4. Create flight_bookings record (pending_payment)
  // 5. Insert flight_passengers records
  // 6. Create Stripe Checkout session:
  //    - mode: "payment"
  //    - line_items: [{ base_fare, taxes_fees }]
  //    - metadata: { type: "flight", booking_id, offer_id }
  //    - success_url: /flights/confirmation/{booking_id}
  //    - cancel_url: /flights/checkout?offer={offer_id}
  // 7. Update booking with stripe_checkout_session_id
  // 8. Return { url: session.url }
});
```

---

## Stripe Webhook Enhancement

Add handler for flight checkout sessions:

```typescript
case "checkout.session.completed": {
  if (metadata.type === "flight") {
    // 1. Update flight_bookings payment_status = 'paid'
    // 2. Call issue-flight-ticket function
    // 3. If ticketing successful:
    //    - Update ticketing_status = 'issued'
    //    - Store PNR, ticket_numbers
    // 4. If ticketing fails:
    //    - Update ticketing_status = 'failed'
    //    - Alert admin for manual intervention
    // 5. Send confirmation email
  }
}
```

---

## Updated Compliance Text

### New `flightMoRCompliance.ts`

```typescript
export const FLIGHT_MOR_DISCLAIMERS = {
  /** Main seller disclaimer - REQUIRED on checkout */
  seller: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.",
  
  /** Ticketing partner notice */
  ticketing: "Tickets are issued by authorized partners under applicable airline rules.",
  
  /** Price display - no "indicative" language */
  price: "All prices include taxes and fees. Final total shown at checkout.",
  
  /** Terms checkbox */
  termsCheckbox: "I agree to the Terms and Conditions and Airline Rules.",
  
  /** Refund policy */
  refund: "Refunds are subject to airline fare rules. Cancellation fees may apply.",
  
  /** Support */
  support: "For booking changes or cancellations, contact ZIVO Support.",
};

export const FLIGHT_MOR_CTA = {
  primary: "Book Now",
  checkout: "Pay Securely",
  confirm: "Complete Booking",
};
```

---

## Flight Terms Legal Page

Create `/legal/flight-terms` with:

1. **ZIVO as Seller of Travel**
   - ZIVO processes payments and issues booking confirmations
   - Tickets issued by licensed ticketing partners (sub-agent model)

2. **Airline Rules Apply**
   - Baggage policies set by airline
   - Schedule changes at airline discretion
   - Cancellation subject to fare rules

3. **Refund Policy**
   - Refunds subject to fare type (refundable vs non-refundable)
   - Processing time: 7-14 business days
   - ZIVO processing fee may apply for voluntary changes

4. **Passenger Responsibilities**
   - Accurate name matching passport
   - Valid travel documents (visa, passport)
   - Check-in requirements

---

## Admin Panel Enhancement

### New Admin Flights Tab Features

1. **Booking Details View**
   - Payment status (Stripe)
   - Ticketing status (pending/issued/failed)
   - PNR and ticket numbers
   - Passenger details

2. **Ticketing Actions**
   - Retry failed ticketing
   - Manual PNR entry (backup)
   - View ticketing logs

3. **Refund Management**
   - Process full/partial refund
   - Stripe + partner refund status
   - Refund reason logging

4. **Schedule Changes**
   - View airline notifications
   - Contact passenger
   - Rebook or refund options

---

## Implementation Phases

### Phase 1: Database & Core Backend
1. Run database migrations (new columns, tables)
2. Create `create-flight-checkout` Edge Function
3. Create `issue-flight-ticket` Edge Function
4. Update `stripe-webhook` for flight handling

### Phase 2: Checkout Flow
1. Create `FlightCheckout.tsx` page
2. Create `FlightConfirmation.tsx` page
3. Update `FlightTravelerInfo.tsx` to navigate to checkout
4. Create `useFlightBooking.ts` hook

### Phase 3: Compliance Updates
1. Create `flightMoRCompliance.ts`
2. Update `flightCompliance.ts` (remove affiliate text)
3. Create `/legal/flight-terms` page
4. Update disclaimers across flight components

### Phase 4: UI/UX Polish
1. Update CTAs throughout flight flow
2. Create `FlightPriceBreakdown.tsx` component
3. Update `MyTripsDashboard` for real bookings
4. Remove/hide affiliate components for flights

### Phase 5: Admin & Email
1. Enhance `AdminFlightManagement.tsx`
2. Create `send-flight-confirmation` Edge Function
3. Add ticketing logs viewer
4. Add refund processing UI

---

## Technical Notes

### Price Handling
- Duffel returns `total_amount` (includes taxes)
- Store breakdown: `subtotal` (base fare), `taxes_fees`, `total_amount`
- Display: "Fare: $X | Taxes & Fees: $Y | Total: $Z"
- No "indicative" or "estimated" language

### Stripe Metadata
```typescript
metadata: {
  type: "flight",
  booking_id: uuid,
  offer_id: duffel_offer_id,
  passengers: count,
}
```

### Ticketing Flow
1. Payment confirmed via webhook
2. Call Duffel `createOrder` with passenger details
3. Duffel returns `booking_reference` (PNR) and order ID
4. For each passenger, Duffel issues ticket (e-ticket number)
5. Store in `flight_bookings` and `flight_passengers`

### Error Handling
- If ticketing fails after payment:
  - Set `ticketing_status = 'failed'`
  - Alert admin immediately
  - Do NOT auto-refund (admin decision)
  - Customer sees "Booking processing" with support contact

---

## Summary

This implementation transforms ZIVO Flights into a full OTA where:
- ZIVO collects payment (Stripe) as Merchant of Record
- Ticketing handled by licensed partners (Duffel) under sub-agent agreement
- Clear pricing with no "indicative" language
- Customers receive PNR and e-tickets directly
- Admin has full visibility and control over bookings
- Compliant with travel agency regulations

