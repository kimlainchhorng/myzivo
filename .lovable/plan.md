
# ZIVO Flights OTA Conversion - Remove Affiliate Flow

## Executive Summary

Convert ZIVO Flights from an affiliate/meta-search model to a **full OTA (Online Travel Agency)** where ZIVO is the Merchant of Record. This involves removing all affiliate language, partner redirect notices, "indicative pricing" disclaimers, and updating UI to reflect direct ZIVO booking.

---

## Current Issues Identified

### Components Still Using Affiliate Patterns

| File | Issue |
|------|-------|
| `FlightResultCard.tsx` | Says "Indicative price. Final price confirmed on partner checkout." + ExternalLink icon + "Hizovo does not issue tickets" |
| `AffiliateNotice.tsx` | Entire file is affiliate-focused: "View Deal will redirect you to partner", "Hizivo does not issue airline tickets" |
| `RedirectNotice` | Shows on FlightResults page, telling users about partner redirect |
| `AffiliateDisclaimer` | Footer component about commissions and partner bookings |
| `TravelFAQ.tsx` | Flights FAQs describe affiliate model: "click View Deal to be redirected to partner" |
| `TrendingDealsSection.tsx` | Uses `trackAffiliateClick`, opens external `window.open` |
| `HowBookingWorks.tsx` | Step 3 says "Book securely with our airline partner" |
| `TrustSignals.tsx` | Says "Secure booking on partner sites", "Partner site redirect" |
| `MyTripsDashboard.tsx` | Still uses MOCK_TRIPS, not connected to real `flight_bookings` |
| FlightResults.tsx | Imports/renders `RedirectNotice` and `AffiliateDisclaimer` |

### Compliance Configs (Already MoR - Good)

- `flightCompliance.ts` - Uses MoR language, no "indicative" for Duffel
- `flightMoRCompliance.ts` - Correct seller of travel text

---

## Implementation Plan

### Phase 1: FlightResultCard.tsx - Remove Affiliate Elements

**Current Issues:**
- Line 3-4: Comment says "Meta-search affiliate card: Indicative pricing"
- Line 239-240: "Estimated" label for non-live prices
- Line 257-259: "Indicative price. Final price confirmed on partner checkout."
- Line 277: ExternalLink icon in button
- Line 275-276: "Continue to secure booking" implies external
- Line 281-283: "Powered by licensed travel partners · Final price confirmed before payment"
- Line 289-291: "Hizovo does not issue tickets. Payment and booking fulfillment are handled by licensed travel partners."

**Changes:**
- Update file comment to "ZIVO OTA Flight Card - Direct booking"
- Change price label from "Estimated" to "From" for all prices (Duffel = exact)
- Remove indicative price disclaimer text
- Replace ExternalLink icon with ArrowRight (internal navigation)
- Change button text to "Book on ZIVO"
- Update footer to MoR language: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers."

---

### Phase 2: Remove Affiliate Components from FlightResults

**File: `FlightResults.tsx`**

Remove these imports/usages:
- Line 49-50: `RedirectNotice, AffiliateDisclaimer`
- Line 25: `trackPageView` (affiliate tracking)
- Line 533-536: `<RedirectNotice service="flights" />` render
- Line 599-600: `<AffiliateDisclaimer />` render
- Line 565-570: `TrendingDealsSection` (uses affiliate tracking)

Replace with:
- Flights-specific MoR disclaimer component
- Remove or update TrendingDeals to use internal navigation

---

### Phase 3: Create FlightsMoRDisclaimer Component

**New Component: `src/components/flight/FlightsMoRDisclaimer.tsx`**

Replace `AffiliateDisclaimer` and `RedirectNotice` with MoR-appropriate footer:

```text
"ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
Tickets are issued by authorized partners under airline rules."
```

No mention of:
- Partner redirect
- Indicative prices
- Commission earnings
- External booking sites

---

### Phase 4: Update AffiliateNotice.tsx for Non-Flights

**File: `src/components/results/AffiliateNotice.tsx`**

Flights use MoR model now, so update:
- `RedirectNotice` - Exclude flights, only show for hotels/cars
- `IndicativePriceAlert` - Exclude flights (Duffel = exact pricing)
- `AffiliateDisclaimer` - Add conditional text for flights vs hotels/cars

Or create separate components:
- `FlightsMoRFooter.tsx` for flights
- Keep existing for hotels/cars (still affiliate)

---

### Phase 5: Update TravelFAQ.tsx - Flights Section

**Current (Affiliate model):**
```text
"click 'View Deal' to be redirected to our partner's website"
"ZIVO is a search and comparison tool only. All bookings...handled by airline"
"Prices shown on ZIVO are indicative"
```

**Updated (MoR model):**
```text
"click 'Book on ZIVO' to complete your booking securely"
"ZIVO sells tickets as a sub-agent. All bookings confirmed directly with ZIVO."
"Prices are exact totals including taxes and fees"
"For changes or cancellations, contact ZIVO Support"
```

---

### Phase 6: Update HowBookingWorks.tsx

**Current Step 3:**
```text
"Complete booking securely"
"Book securely with our airline partner"
```

**Updated Step 3:**
```text
"Book directly on ZIVO"
"Complete your booking and receive your e-ticket instantly"
```

---

### Phase 7: Update TrustSignals.tsx

**Current:**
```text
"Secure booking on partner sites"
"Partner site redirect"
```

**Updated:**
```text
"Secure ZIVO checkout"
"Licensed Seller of Travel"
```

---

### Phase 8: Connect MyTripsDashboard to Real Data

**File: `src/components/flight/MyTripsDashboard.tsx`**

**Current:** Uses `MOCK_TRIPS` array (lines 88-180)

**Changes:**
1. Import and use `useFlightBookings` hook
2. Replace MOCK_TRIPS with real database query
3. Map `flight_bookings` data to Trip interface
4. Show real ticketing status, PNR, ticket numbers
5. Add "Request Change" and "Request Refund" buttons
6. Handle empty state for users with no bookings

---

### Phase 9: Remove TrendingDealsSection Affiliate Tracking

**File: `src/components/monetization/TrendingDealsSection.tsx`**

**Current:** Uses `trackAffiliateClick`, `window.open` to external affiliate URL

**Options:**
1. Remove from FlightResults (flights are MoR now)
2. Update to navigate internally for flights, keep affiliate for hotels/cars
3. Create separate "Popular Routes" component for flights with internal links

Recommended: Remove from flights, keep for hotels/cars only

---

### Phase 10: Clean Up Hizivo/Hizovo References

Search found 71 files with old brand references:
- Replace "Hizivo" / "Hizovo" with "ZIVO" throughout
- Update email addresses to ZIVO domain if applicable
- Ensure consistent branding

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `FlightResultCard.tsx` | MODIFY | Remove affiliate text, update CTA to "Book on ZIVO" |
| `FlightResults.tsx` | MODIFY | Remove RedirectNotice, AffiliateDisclaimer, TrendingDealsSection |
| `AffiliateNotice.tsx` | MODIFY | Exclude flights from affiliate components |
| `TravelFAQ.tsx` | MODIFY | Update flights FAQs to MoR language |
| `HowBookingWorks.tsx` | MODIFY | Update step 3 to ZIVO direct booking |
| `TrustSignals.tsx` | MODIFY | Remove partner redirect language |
| `MyTripsDashboard.tsx` | MODIFY | Connect to real flight_bookings data |
| `TrendingDealsSection.tsx` | MODIFY | Remove from flights or update navigation |
| **NEW**: `FlightsMoRFooter.tsx` | CREATE | MoR-specific footer for flight pages |

---

## New CTA and Disclaimer Text

### Result Card Button
**Old:** "Continue to secure booking" + ExternalLink icon
**New:** "Book on ZIVO" + ArrowRight icon

### Price Display
**Old:** "Estimated" / "Indicative price"
**New:** "From" (always exact for Duffel)

### Footer Disclaimer
**Old:**
```
"ZIVO is a meta-search travel comparison platform – we do not sell tickets.
ZIVO may earn a commission when users book through partner links."
```

**New:**
```
"ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
Tickets are issued by authorized partners under airline rules."
```

### Support FAQ
**Old:** "Contact the airline or travel agency where you completed your purchase"
**New:** "Contact ZIVO Support for booking changes. Airline fare rules apply."

---

## Post-Implementation Verification

1. Search flights - no "partner" or "redirect" language visible
2. Result cards show "Book on ZIVO" button (no external link icon)
3. Prices display as "From $XXX" (not "Indicative" or "Estimated")
4. Footer shows seller of travel disclosure
5. FAQ describes ZIVO as seller, not aggregator
6. My Trips shows real bookings with PNR and ticket numbers
7. HowBookingWorks shows direct ZIVO checkout
8. No `window.open` or `ExternalLink` for flights
9. All Hizivo/Hizovo references replaced with ZIVO

---

## Technical Flow After Implementation

```text
User searches flights
        ↓
FlightResults.tsx (Duffel API - exact prices)
        ↓
User clicks "Book on ZIVO" (internal navigation)
        ↓
FlightDetails.tsx (review itinerary, fare rules)
        ↓
User clicks "Book Now"
        ↓
FlightTravelerInfo.tsx (collect passenger details)
        ↓
FlightCheckout.tsx (Stripe payment - ZIVO is MoR)
        ↓
stripe-webhook → issue-flight-ticket (Duffel order)
        ↓
FlightConfirmation.tsx (PNR, ticket numbers)
        ↓
My Trips dashboard (real bookings from flight_bookings)
```

**Key Difference:** NO external redirects. NO partner checkout. ZIVO handles everything.
