

# Promo Codes for Rides Implementation Plan

## Overview

This plan adds a promo code input to the ride booking flow, allowing riders to enter discount codes before payment. The system validates codes against city, usage limits, and per-user limits, then applies the discount to the final fare.

---

## Current State Analysis

### Existing Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `promo_codes` table | Exists | Has code, discount_type, discount_value, max_uses, expires_at, is_active |
| `promo_redemptions` table | Exists | Tracks order_id, discount_amount, final_amount, status |
| `validate_promo_code` RPC | Exists | But uses `promotions` table, not `promo_codes` |
| `increment_promo_uses` RPC | Exists | Atomic counter for promo usage |
| `ride_requests` table | Missing promo fields | Needs price_before_discount, promo_code, promo_discount |

### Flow to Modify

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │───>│   Options   │───>│   Confirm   │───>│  Checkout   │
│  (pickup/   │    │  (ride      │    │  (contact   │    │  (payment)  │
│  dropoff)   │    │   type)     │    │   info)     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                     + PROMO CODE INPUT
                                     + PRICE BREAKDOWN
```

---

## Database Changes

### 1. Extend `promo_codes` table

Add columns to support your requirements:

| Column | Type | Purpose |
|--------|------|---------|
| city | TEXT | Restrict to specific pickup city (NULL = all cities) |
| start_at | TIMESTAMPTZ | Start date for validity window |
| min_fare | NUMERIC | Minimum fare required to apply promo |
| max_discount | NUMERIC | Cap on discount amount (for percent type) |
| max_uses_per_user | INTEGER | Per-user usage limit |

### 2. Extend `ride_requests` table

Add promo tracking columns:

| Column | Type | Purpose |
|--------|------|---------|
| price_before_discount | NUMERIC | Original quoted fare |
| promo_code | TEXT | Applied promo code |
| promo_id | UUID | Reference to promo_codes.id |
| promo_discount | NUMERIC | Discount amount applied |

---

## Backend Implementation

### 1. Create `validate_ride_promo` RPC Function

A new PostgreSQL function specifically for rides:

**Parameters:**
- `p_code` - Promo code to validate
- `p_user_id` - Logged-in user ID (optional for guests)
- `p_pickup_city` - City from pickup address (for geo-restriction)
- `p_fare_amount` - Pre-discount fare (for min_fare check)

**Validation Logic:**
1. Fetch promo where `code = UPPER(p_code)` AND `is_active = true`
2. Check date range: `start_at <= now() <= expires_at`
3. Check city restriction: if `promo.city IS NOT NULL`, require `promo.city = p_pickup_city`
4. Check min fare: if `promo.min_fare IS NOT NULL`, require `p_fare_amount >= min_fare`
5. Check total uses: `SELECT COUNT(*) FROM promo_redemptions WHERE promo_id = ?` < `max_uses`
6. Check per-user uses (if p_user_id provided): count redemptions for this user < `max_uses_per_user`

**Returns:**
```json
{
  "valid": true,
  "promo_id": "uuid",
  "discount_type": "percent|fixed",
  "discount_value": 25,
  "discount_amount": 8.50,
  "final_total": 25.50,
  "description": "25% off your ride"
}
```

### 2. Update `create-ride-payment-intent` Edge Function

Add promo code handling:

1. Accept new parameters: `promo_code`, `promo_id`, `promo_discount`
2. Re-validate promo server-side (security)
3. Calculate final amount with discount
4. Store promo fields in `ride_requests`
5. Create PaymentIntent with discounted amount
6. On success path, insert into `promo_redemptions`

---

## Frontend Implementation

### 1. New Component: `PromoCodeInput.tsx`

Location: `src/components/ride/PromoCodeInput.tsx`

Features:
- Text input with "Apply" button
- Loading state during validation
- Success state showing discount
- Error toast for invalid codes
- Remove promo button

### 2. New Hook: `useRidePromoValidation.ts`

Location: `src/hooks/useRidePromoValidation.ts`

Responsibilities:
- Call `validate_ride_promo` RPC
- Calculate discounted total
- Track applied promo state
- Input validation (trim, uppercase)

### 3. Update `Rides.tsx` - Confirm Step

Add promo code UI between contact form and price breakdown:

**Before (lines ~1115-1127):**
```tsx
// Notes textarea
</div>
</div>
```

**After:**
```tsx
// Notes textarea
</div>

{/* Promo Code Section */}
<PromoCodeInput
  originalPrice={currentQuote?.total ?? 0}
  pickupCity={extractCity(pickup)}
  onPromoApplied={(promo) => setAppliedPromo(promo)}
  onPromoRemoved={() => setAppliedPromo(null)}
/>

{/* Price Breakdown with Discount */}
{currentQuote && (
  <PriceBreakdownWithDiscount
    quote={currentQuote}
    appliedPromo={appliedPromo}
  />
)}

</div>
```

### 4. Update `handleStartCheckout`

Pass promo data to edge function:

```typescript
const invokePromise = supabase.functions.invoke("create-ride-payment-intent", {
  body: {
    // ... existing fields ...
    promo_code: appliedPromo?.code,
    promo_id: appliedPromo?.promo_id,
    promo_discount: appliedPromo?.discount_amount,
    price_before_discount: currentQuote?.total,
  },
});
```

---

## UI Design (Confirm Step)

```text
┌────────────────────────────────────────┐
│ Your Information                       │
│                                        │
│ Full Name *                            │
│ ┌──────────────────────────────────┐   │
│ │ John Doe                         │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Phone Number *                         │
│ ┌──────────────────────────────────┐   │
│ │ (555) 123-4567                   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Email (optional)                       │
│ ┌──────────────────────────────────┐   │
│ │ john@email.com                   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ Promo Code                             │
│ ┌────────────────────────┐ ┌────────┐  │
│ │ FIRST25                │ │ Apply  │  │
│ └────────────────────────┘ └────────┘  │
│                                        │
│ ✓ FIRST25 applied: -$8.50 off          │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ Fare Breakdown                         │
│ Base fare               $3.50          │
│ Distance (5.2 mi)       $9.10          │
│ Time (~12 min)          $4.20          │
│ Booking fee             $2.50          │
│ ─────────────────────────────────────  │
│ Subtotal                $19.30         │
│ Promo discount (FIRST25) -$4.83        │
│ ─────────────────────────────────────  │
│ Total                   $14.47         │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │       Continue to Payment          │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## Security Considerations

| Risk | Mitigation |
|------|------------|
| Client tampering with discount | Server re-validates promo in edge function |
| Applying promo after ride created | Only accept promo before payment intent creation |
| Race condition on max_uses | Use atomic increment in transaction |
| Promo applied to wrong city | Validate pickup city in RPC |
| User exceeds per-user limit | Check promo_redemptions count in RPC |

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/xxxxx.sql` | Add columns to promo_codes and ride_requests |
| `supabase/migrations/xxxxx.sql` | Create `validate_ride_promo` RPC function |
| `src/components/ride/PromoCodeInput.tsx` | New component |
| `src/hooks/useRidePromoValidation.ts` | New hook |
| `src/pages/Rides.tsx` | Add promo UI to confirm step |
| `supabase/functions/create-ride-payment-intent/index.ts` | Handle promo validation and discount |

---

## Testing Checklist

- [ ] Enter valid promo code, see discount applied
- [ ] Enter invalid code, see error toast
- [ ] Enter expired code, see "expired" error
- [ ] Enter code at max uses, see "limit reached" error
- [ ] Enter city-restricted code from wrong city, see error
- [ ] Apply promo, complete payment, verify promo_redemptions record
- [ ] Remove promo, see original price restored
- [ ] Try same promo twice (per-user limit), see error on second use

