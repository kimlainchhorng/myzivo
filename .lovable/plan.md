
# ZIVO Flights Duffel Integration - Complete Implementation Plan

## Executive Summary

Finalize the ZIVO Flights integration to use **Duffel API (Sandbox)** for the complete Merchant-of-Record (MoR) flow. The `DUFFEL_API_KEY` is already configured. This plan connects all components: search, offer selection, price locking, Stripe payment, automatic ticketing, and admin management.

---

## Current State Analysis

### What's Already Built ✅

**Edge Functions:**
- `duffel-flights/index.ts` - Full Duffel API wrapper (createOfferRequest, getOffers, getOffer, createOrder)
- `create-flight-checkout/index.ts` - Creates Stripe checkout session and flight_bookings record
- `issue-flight-ticket/index.ts` - Creates Duffel order after payment, stores PNR + ticket numbers
- `stripe-webhook/index.ts` - Handles payment success and triggers ticketing

**Frontend Pages:**
- `FlightCheckout.tsx` - Stripe payment page using `useDuffelOffer`
- `FlightConfirmation.tsx` - Shows booking status, PNR, ticket numbers
- `FlightTravelerInfo.tsx` - Collects passenger details, stores in sessionStorage

**Hooks:**
- `useDuffelFlights.ts` - React Query hooks for Duffel search
- `useFlightBooking.ts` - Booking queries and checkout mutation

**Database:**
- `flight_bookings` - Has PNR, ticketing_status, ticket_numbers, Stripe fields
- `flight_passengers` - Stores passenger details with ticket_number
- `flight_ticketing_logs` - API call logging

### What's Missing/Needs Work 🔧

1. **FlightResults page uses Aviasales (affiliate model) instead of Duffel**
2. **Database schema mismatch** - `create-flight-checkout` inserts `origin`, `destination`, `departure_date`, `return_date`, `currency` columns that don't exist
3. **No refund edge function** - `process-flight-refund` doesn't exist
4. **No DUFFEL_ENV environment variable** - for sandbox/production toggle
5. **Admin panel missing** - ticketing status column, retry/refund actions, ticketing logs tab
6. **FlightResults → FlightDetails navigation** - needs to store Duffel offer_id properly
7. **Email confirmation** - not implemented

---

## Implementation Plan

### Phase 1: Database Schema Fix

Add missing columns to `flight_bookings` table:

```sql
ALTER TABLE flight_bookings 
ADD COLUMN IF NOT EXISTS origin text,
ADD COLUMN IF NOT EXISTS destination text,
ADD COLUMN IF NOT EXISTS departure_date date,
ADD COLUMN IF NOT EXISTS return_date date,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
```

This is **required** before the checkout flow can work.

---

### Phase 2: Environment Variable

Add `DUFFEL_ENV` secret for environment switching:

| Secret | Value | Purpose |
|--------|-------|---------|
| `DUFFEL_API_KEY` | (existing) | API authentication |
| `DUFFEL_ENV` | `sandbox` | Environment toggle |

Update edge functions to use environment-aware API URL:

```typescript
const DUFFEL_ENV = Deno.env.get('DUFFEL_ENV') || 'sandbox';
const DUFFEL_API_URL = DUFFEL_ENV === 'production' 
  ? 'https://api.duffel.com' 
  : 'https://api.duffel.com'; // Same URL, sandbox is key-based
```

---

### Phase 3: Connect FlightResults to Duffel

**File: `src/pages/FlightResults.tsx`**

Replace Aviasales search with Duffel:

1. **Change import** from `useAviasalesFlightSearch` to `useDuffelFlightSearch`
2. **Update search call**:
```typescript
const { data: duffelResult, isLoading } = useDuffelFlightSearch({
  origin: originIata,
  destination: destinationIata,
  departureDate: departureDate || '',
  returnDate: returnDate,
  passengers: { adults: passengers },
  cabinClass: cabinClass as 'economy' | 'business' | 'first',
  enabled: isValid,
});
```

3. **Map Duffel offers to card format** - offers already have exact prices
4. **Update handleViewDeal** - navigate to `/flights/details/{offerId}` instead of affiliate redirect
5. **Remove all affiliate tracking** for flights (keep for hotels/cars)

---

### Phase 4: Update FlightDetails Page

**File: `src/pages/FlightDetails.tsx`**

Current page shows flight details from sessionStorage. Update to:

1. **Fetch offer from Duffel** using `useDuffelOffer(offerId)`
2. **Display exact pricing** - no "indicative" disclaimers
3. **Show fare rules** - refundable, changeable conditions from offer
4. **CTA: "Book Now"** → navigates to `/flights/traveler-info?offer={id}&passengers={n}`
5. **Remove affiliate redirect logic** entirely

---

### Phase 5: Create Refund Edge Function

**New file: `supabase/functions/process-flight-refund/index.ts`**

```typescript
// Actions: 'request' (user), 'process' (admin), 'auto' (after ticketing failure)

serve(async (req) => {
  const { bookingId, reason, action } = await req.json();
  
  // Fetch booking
  const booking = await supabase.from('flight_bookings').select('*').eq('id', bookingId).single();
  
  if (action === 'auto' || action === 'process') {
    // Refund via Stripe
    const stripe = new Stripe(stripeKey);
    await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      reason: 'requested_by_customer',
    });
    
    // Update booking
    await supabase.from('flight_bookings').update({
      refund_status: 'refunded',
      refund_processed_at: new Date().toISOString(),
      refund_amount: booking.total_amount,
    }).eq('id', bookingId);
    
    // If Duffel order exists, cancel it
    if (booking.ticketing_partner_order_id) {
      await cancelDuffelOrder(booking.ticketing_partner_order_id);
    }
  }
  
  return { success: true };
});
```

---

### Phase 6: Enhanced Error Handling in issue-flight-ticket

**File: `supabase/functions/issue-flight-ticket/index.ts`**

Add auto-refund on ticketing failure:

```typescript
} catch (duffelError) {
  console.error("[IssueTicket] Duffel error:", duffelError);
  
  // Auto-refund on failure
  try {
    await fetch(`${supabaseUrl}/functions/v1/process-flight-refund`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supabaseServiceKey}` },
      body: JSON.stringify({ 
        bookingId, 
        reason: 'Ticketing failed: ' + duffelError.message,
        action: 'auto' 
      }),
    });
  } catch (refundErr) {
    console.error("[IssueTicket] Auto-refund failed:", refundErr);
  }
  
  throw duffelError;
}
```

---

### Phase 7: Admin Panel Enhancements

**File: `src/components/admin/AdminFlightManagement.tsx`**

1. **Add "Ticketing" tab** with logs from `flight_ticketing_logs`
2. **Add columns to Bookings table**:
   - `ticketing_status` (Pending/Processing/Issued/Failed)
   - `pnr` (if issued)
3. **Add actions**:
   - "Retry Ticketing" - calls `issue-flight-ticket` for failed status
   - "Process Refund" - calls `process-flight-refund` for issued status
   - "View Passengers" - expands to show passenger details

**New Ticketing Status Badge:**
```typescript
const getTicketingBadge = (status: string) => {
  const styles = {
    issued: "bg-emerald-500/10 text-emerald-500",
    processing: "bg-blue-500/10 text-blue-500",
    failed: "bg-red-500/10 text-red-500",
    pending: "bg-amber-500/10 text-amber-500",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
};
```

---

### Phase 8: My Trips Dashboard

**File: `src/components/flight/MyTripsDashboard.tsx`**

Connect to real `flight_bookings` data:

1. **Import `useFlightBookings`** from hooks
2. **Replace MOCK_TRIPS** with real query data
3. **Display**:
   - Booking reference / PNR
   - Ticketing status badge
   - Ticket numbers (if issued)
   - "Request Change" button (opens FlightChangeRequest dialog)
   - "Request Refund" button (for eligible bookings)

---

### Phase 9: Compliance Disclosures

All checkout/booking pages already have MoR compliance text. Verify display:

**Required on checkout:**
```text
"ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
Tickets are issued by authorized partners under airline rules."
```

**Required on results:**
```text
"Prices shown are exact totals including taxes and fees."
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| **Database** | ALTER | Add origin, destination, departure_date, return_date, currency columns |
| **Secrets** | ADD | DUFFEL_ENV = sandbox |
| `src/pages/FlightResults.tsx` | MODIFY | Switch from Aviasales to Duffel search |
| `src/pages/FlightDetails.tsx` | MODIFY | Fetch Duffel offer, remove affiliate redirect |
| `supabase/functions/process-flight-refund/` | CREATE | New refund edge function |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Add auto-refund on failure |
| `src/components/admin/AdminFlightManagement.tsx` | MODIFY | Add ticketing tab, status column, actions |
| `src/components/flight/MyTripsDashboard.tsx` | MODIFY | Connect to real flight_bookings |
| `src/hooks/useDuffelFlights.ts` | MODIFY | Update comment (already correct) |

---

## Technical Flow After Implementation

```text
User searches flights
        ↓
FlightResults.tsx (Duffel API via duffel-flights edge function)
        ↓
User clicks "Select Flight"
        ↓
FlightDetails.tsx (Duffel getOffer - exact price, fare rules)
        ↓
User clicks "Book Now"
        ↓
FlightTravelerInfo.tsx (collect passenger details)
        ↓
FlightCheckout.tsx (review + Stripe button)
        ↓
Stripe Checkout (ZIVO = merchant of record)
        ↓
stripe-webhook → marks payment_status=paid
        ↓
issue-flight-ticket → creates Duffel order
        ↓
Success: PNR + tickets saved, user sees confirmation
Failure: Auto-refund via Stripe, user notified
```

---

## Testing Checklist

1. Search flights with Duffel sandbox key
2. Select a flight and view exact price
3. Enter traveler info and proceed to checkout
4. Complete Stripe test payment
5. Verify ticketing webhook fires
6. Confirm PNR and ticket numbers display
7. Test admin retry ticketing
8. Test admin refund processing
9. Verify My Trips shows real bookings

---

## Compliance Verification

- [x] DUFFEL_API_KEY stored server-side only
- [x] No API tokens exposed in frontend
- [x] Legal disclosures on checkout
- [x] Seller of Travel registration displayed
- [x] Exact pricing (no "indicative" for Duffel offers)
