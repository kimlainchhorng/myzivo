
# Complete ZIVO Flights MoR Transition - Phase 2

## Overview

The backend infrastructure for the Merchant-of-Record model is now in place (database tables, Edge Functions for checkout and ticketing). This phase completes the transition by updating all frontend components to use the MoR compliance language and flow, removing affiliate patterns, and enhancing the admin panel.

---

## Current State

### Completed (Phase 1)
- Database schema: `flight_bookings` enhanced with `pnr`, `ticketing_status`, `stripe_checkout_session_id`
- New tables: `flight_passengers`, `flight_ticketing_logs`
- Edge Functions: `create-flight-checkout`, `issue-flight-ticket`
- Stripe webhook updated for flight handling
- New pages: `FlightCheckout.tsx`, `FlightConfirmation.tsx`, `FlightTerms.tsx`
- New hooks: `useFlightBooking.ts`
- New config: `flightMoRCompliance.ts`

### Still Using Affiliate Patterns (24+ files)
- `flightCompliance.ts` - Still has "does not issue tickets" language
- `FlightTravelerInfo.tsx` - References partner redirect
- `FlightDetails.tsx` - Uses affiliate tracking and redirect
- `FlightBookingSidebar.tsx` - "Partner checkout" language
- `StickyBookingCTA.tsx` - Uses `useAffiliateRedirect`
- `FlightPartnerDisclaimer.tsx` - Affiliate disclaimers
- `FlightResultCard.tsx` - Opens affiliate links
- `FlightPopularRoutes.tsx` - "Indicative" pricing language
- `MyTripsDashboard.tsx` - Uses mock data, not real bookings
- `AdminFlightManagement.tsx` - Missing ticketing status, refunds

---

## Files to Modify

### 1. Core Compliance Config Updates

#### `src/config/flightCompliance.ts`
Update all locked text to MoR language:

```typescript
// OLD: "Hizovo does not issue tickets. Payment handled by partners."
// NEW: "ZIVO sells flight tickets. Tickets issued by licensed partners."

FLIGHT_CTA_TEXT.primary = "Book Now"
FLIGHT_CTA_TEXT.viewDeal = "Select Flight"  
FLIGHT_CTA_TEXT.proceedToPayment = "Pay Securely"

FLIGHT_DISCLAIMERS.ticketing = "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers."
FLIGHT_DISCLAIMERS.price = "All prices include taxes and fees." // Remove "indicative"
FLIGHT_DISCLAIMERS.payment = "Payment is processed securely by ZIVO."
```

### 2. Traveler Info to Checkout Flow

#### `src/pages/FlightTravelerInfo.tsx`
- Remove partner redirect logic
- Navigate to `/flights/checkout` instead of Duffel checkout
- Pass passengers and offer data via URL params or session storage
- Update consent text to MoR terms checkbox

Changes:
- Line 143-171: Replace `logPartnerRedirect` with direct navigation to FlightCheckout
- Line 427-445: Update consent text from "share with partner" to "agree to Terms and Airline Rules"
- Line 474-494: Change CTA from "Proceed to secure payment" to "Continue to Payment"

### 3. Flight Details Page

#### `src/pages/FlightDetails.tsx`
- Remove affiliate tracking imports
- Update `handleBookNow` to navigate internally
- Change consent from "partner consent" to "terms agreement"

Changes:
- Line 51: Remove `trackAffiliateClick`, `buildAffiliateUrl` imports
- Line 110-148: Replace affiliate redirect with navigation to `/flights/traveler-info?offer={id}`
- Update all CTA buttons to use `FLIGHT_MOR_CTA`

### 4. Booking Sidebar

#### `src/components/flight/FlightBookingSidebar.tsx`
- Import from `flightMoRCompliance.ts` instead of `flightCompliance.ts`
- Remove `ExternalLink` icons (no redirect)
- Update "partner checkout" text to "secure checkout"

Changes:
- Line 27: Import from `flightMoRCompliance`
- Line 240-246: Remove ExternalLink icon, use `FLIGHT_MOR_CTA.primary`
- Line 249-251: Change "complete booking with partner" to "secure ZIVO checkout"
- Line 264-271: Update disclaimer from affiliate to seller language

### 5. Sticky Mobile CTA

#### `src/components/flight/StickyBookingCTA.tsx`
- Remove `useAffiliateRedirect` hook
- Navigate internally instead of redirect
- Update compliance text

Changes:
- Line 4: Remove affiliate redirect import
- Line 31-57: Replace redirect with internal navigation
- Line 103-105: Update disclaimer to MoR language

### 6. Partner Disclaimer Component

#### `src/components/flight/FlightPartnerDisclaimer.tsx`
- Import from MoR config
- Update all variants to seller language
- Rename component to `FlightSellerDisclaimer`

### 7. Result Cards

#### `src/components/flight/FlightResultCard.tsx`
- Remove affiliate tracking
- Navigate to flight details instead of external link
- CTA: "Select" or "View Details" (not "View Deal")

### 8. Popular Routes / Trending

#### `src/components/flight/FlightPopularRoutes.tsx`
#### `src/components/flight/TrendingDestinationsSection.tsx`
- Remove "indicative" language
- Remove affiliate links
- Update to "From $XXX" without asterisk disclaimers

### 9. My Trips Dashboard (Real Bookings)

#### `src/components/flight/MyTripsDashboard.tsx`
- Replace mock data with real `flight_bookings` query
- Display PNR, ticket numbers from database
- Show ticketing status (pending/issued/failed)
- Add change/refund request buttons

Changes:
- Import `useFlightBookings` from `useFlightBooking.ts`
- Replace `MOCK_TRIPS` with real query data
- Add ticket number display
- Add "Request Change" and "Request Refund" actions

### 10. Admin Flight Management

#### `src/components/admin/AdminFlightManagement.tsx`
- Add "Ticketing" tab with logs
- Show `ticketing_status` column in bookings
- Add "Retry Ticketing" action for failed
- Add "Process Refund" action
- Add passenger details view

---

## Files to Delete/Deprecate

| File | Action |
|------|--------|
| `src/hooks/useAffiliateRedirect.ts` | Keep for Hotels/Cars, remove flight functions |
| `src/lib/affiliateTracking.ts` | Keep for Hotels/Cars, remove flight tracking |
| `src/config/affiliateLinks.ts` | Keep, remove flight entries |

---

## New Components Needed

### 1. `src/components/flight/FlightSellerDisclaimer.tsx`
Replaces `FlightPartnerDisclaimer` with MoR language:
- "ZIVO sells flight tickets"
- "Tickets issued by licensed partners"
- "Secure payment by ZIVO"

### 2. `src/components/flight/FlightTicketCard.tsx`
Display issued ticket details:
- Ticket number
- PNR/Confirmation code
- Passenger name
- Baggage allowance
- Download itinerary button

### 3. `src/components/flight/FlightChangeRequest.tsx`
Request change or cancellation:
- Select reason
- Show fare rules (fees may apply)
- Submit request
- Link to support

---

## Database Queries to Add

### `useFlightBooking.ts` Enhancements
```typescript
// Fetch user's real bookings with passengers
useFlightBookings() {
  return useQuery({
    queryKey: ['flight-bookings'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return supabase
        .from('flight_bookings')
        .select(`*, flight_passengers(*)`)
        .eq('customer_id', data.user?.id)
        .order('created_at', { ascending: false });
    }
  });
}
```

---

## Compliance Text Matrix

| Location | Old (Affiliate) | New (MoR) |
|----------|-----------------|-----------|
| CTA Button | "Continue to secure booking" | "Book Now" |
| Under CTA | "Redirects to partner checkout" | "Secure ZIVO checkout" |
| Price | "Indicative pricing" | "All prices include taxes" |
| Disclaimer | "Hizovo does not issue tickets" | "ZIVO sells tickets" |
| Ticketing | "Partner handles ticketing" | "Tickets issued by licensed partners" |
| Refunds | "Contact partner" | "Contact ZIVO Support" |

---

## Implementation Order

1. **Update compliance configs** (flightCompliance.ts)
2. **Update traveler info flow** (navigate to checkout)
3. **Update details page** (remove affiliate redirect)
4. **Update sidebar and CTAs** (MoR language)
5. **Update result cards** (internal navigation)
6. **Replace disclaimer component** (seller language)
7. **Connect My Trips to real data**
8. **Enhance admin panel** (ticketing, refunds)
9. **Remove unused affiliate code for flights**

---

## Technical Summary

This phase completes the Flights MoR transition by:
- Updating 15+ components to use MoR compliance language
- Removing all affiliate redirect patterns for flights
- Connecting My Trips to real flight_bookings data
- Enhancing admin panel with ticketing and refund management
- Creating new components for ticket display and change requests

After this phase, the flight booking flow will be:
**Search → Results → Details → Traveler Info → ZIVO Checkout (Stripe) → Ticketing → Confirmation**

No external redirects. ZIVO controls the entire experience.
