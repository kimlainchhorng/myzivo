
# Next Update: P2P Booking Payment Integration + Traditional/P2P Car Rental Unified Entry Point

## Overview

The P2P car rental marketplace is fully functional but has two critical gaps:
1. **Payment flow is incomplete** - The "Pay" button in P2PBookingConfirmation doesn't trigger the Stripe checkout
2. **Traditional vs P2P car rentals need unified discovery** - Users on `/rent-car` page have no visibility into P2P options

This update connects the payment flow and creates a unified car rental experience.

---

## Current State Analysis

### What's Working
- P2P vehicle search, filtering, and detail pages
- P2P booking creation (creates database entry correctly)
- Owner onboarding multi-step wizard
- Owner booking management (approve/reject)
- Stripe Checkout edge function (`create-p2p-checkout`)
- Payment hooks (`useP2PPayment.ts`)
- Admin test data creation tools

### What's Missing

| Issue | Impact |
|-------|--------|
| P2PBookingConfirmation "Pay" button is static | Renters cannot complete payment |
| `/rent-car` page has no P2P awareness | Users don't know P2P exists when searching |
| No P2P promo section on CarResultsPage | Missed opportunity to show local owner options |

---

## Phase 1: Complete P2P Payment Flow

### 1.1 Wire Up Payment Button in P2PBookingConfirmation

The confirmation page shows a "Pay" button but it doesn't call the checkout mutation.

**Current code (lines 316-319):**
```text
<Button className="gap-2">
  <CreditCard className="w-4 h-4" />
  Pay ${booking.total_amount.toFixed(2)}
  <ArrowRight className="w-4 h-4" />
</Button>
```

**Update to:**
- Import `useCreateP2PCheckout` from `@/hooks/useP2PPayment`
- Wire button onClick to call `createCheckout.mutate({ bookingId: booking.id })`
- Show loading spinner during checkout creation
- Handle payment return query params (success/cancelled)

### 1.2 Add Payment Success/Cancel Handling

When user returns from Stripe, show appropriate feedback:
- `?payment=success` → Show success message, update UI
- `?payment=cancelled` → Show info message, keep pay button visible

---

## Phase 2: P2P Discovery on Traditional Car Rental Pages

### 2.1 Add P2P Promotion Banner to CarRentalBooking

On `/rent-car`, add a prominent banner encouraging P2P discovery:

```text
+----------------------------------------------------------+
|  🚗 Looking for something unique?                         |
|  Rent directly from local owners in your area             |
|  [Browse P2P Rentals →]                                   |
+----------------------------------------------------------+
```

Location: Below the search form, before the category tiles.

### 2.2 Add P2P Cross-Sell Section to CarResultsPage

After showing traditional rental results, add a P2P section:

```text
+----------------------------------------------------------+
|  Rent from Local Owners                                   |
|  Skip the rental counter. Unique cars at better prices.   |
|                                                           |
|  [Show P2P Results for {location} →]                      |
+----------------------------------------------------------+
```

Include quick stats if P2P vehicles exist in that location.

---

## Phase 3: Quick P2P Vehicle Count Check

### Create useP2PVehicleCount Hook

A lightweight hook to check if P2P vehicles exist in a location:

```typescript
export function useP2PVehicleCount(city?: string) {
  return useQuery({
    queryKey: ["p2pVehicleCount", city],
    queryFn: async () => {
      let query = supabase
        .from("p2p_vehicles")
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "approved")
        .eq("is_available", true);
      
      if (city) {
        query = query.ilike("location_city", `%${city}%`);
      }
      
      const { count } = await query;
      return count || 0;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
```

This allows conditional rendering of P2P sections only when vehicles exist.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/p2p/P2PBookingConfirmation.tsx` | **Update** | Wire payment button to checkout hook, handle return params |
| `src/pages/CarRentalBooking.tsx` | **Update** | Add P2P discovery banner below search |
| `src/pages/CarResultsPage.tsx` | **Update** | Add P2P cross-sell section |
| `src/hooks/useP2PBooking.ts` | **Update** | Add useP2PVehicleCount hook |

---

## Technical Implementation Details

### P2P Booking Confirmation Payment Flow

```text
User clicks "Pay $X" button
       ↓
useCreateP2PCheckout.mutate({ bookingId })
       ↓
Edge function creates Stripe Checkout session
       ↓
User redirected to Stripe hosted checkout
       ↓
After payment, redirected back with query params
       ↓
Page shows success/cancelled state
```

### P2P Discovery Components

**P2PDiscoveryBanner Component:**
- Gradient background with car icon
- "Browse P2P Rentals" CTA linking to `/p2p/search?city={location}`
- Dismissible with local storage persistence

**P2PResultsCrossSell Component:**
- Shows after traditional results
- Displays count of available P2P vehicles if > 0
- Links to P2P search with location pre-filled

---

## User Flow After Implementation

### Renter Payment Journey
1. User books a P2P vehicle → Booking created as "pending" or "confirmed"
2. If instant book or owner approves → Status becomes "confirmed"
3. User visits booking confirmation page
4. Clicks "Pay $X" button → Redirected to Stripe
5. Completes payment → Redirected back with success
6. Booking status updates to "paid"

### Car Rental Discovery Journey
1. User visits `/rent-car` page
2. Sees P2P discovery banner → Option to explore local owner rentals
3. If user searches traditional → Results page shows P2P cross-sell
4. User can switch to P2P search with one click
5. Location context preserved across both flows

---

## Testing Checklist

1. Create test P2P booking via admin
2. Navigate to booking confirmation page
3. Click "Pay" button → Verify Stripe checkout opens
4. Complete test payment → Verify redirect back with success
5. Visit `/rent-car` → Verify P2P banner appears
6. Search for cars → Verify P2P cross-sell on results page
7. Click P2P links → Verify location is pre-filled in P2P search
