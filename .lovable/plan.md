
# ZIVO Flights OTA Mode - Remove Affiliate Flow Completely

## Executive Summary

The core Flights OTA infrastructure is already built (Duffel API, Stripe checkout, ticketing webhook). However, several legacy affiliate components and text patterns remain visible in the UI. This plan removes all remaining affiliate patterns and ensures a pure OTA booking experience.

---

## Current State Analysis

### Already OTA-Ready (Working)

| Component | Status | Notes |
|-----------|--------|-------|
| `FlightResults.tsx` | ✅ Uses Duffel | Calls `useDuffelFlightSearch`, navigates to `/flights/details/{id}` |
| `FlightDetails.tsx` | ✅ OTA Flow | Navigates to `/flights/traveler-info`, no external redirect |
| `FlightTravelerInfo.tsx` | ✅ OTA Flow | Collects passengers, navigates to `/flights/checkout` |
| `FlightCheckout.tsx` | ✅ Stripe MoR | Uses `useCreateFlightCheckout`, redirects to Stripe |
| `FlightConfirmation.tsx` | ✅ Shows PNR | Displays ticketing status and ticket numbers |
| `FlightResultCard.tsx` | ✅ OTA CTA | Shows "Select Flight" + ArrowRight, "Secure ZIVO checkout" |
| `duffel-flights` Edge Function | ✅ Working | Handles search, offers, orders |
| `create-flight-checkout` Edge Function | ✅ Working | Creates Stripe session |
| `issue-flight-ticket` Edge Function | ✅ Working | Creates Duffel order after payment |
| `flightCompliance.ts` | ✅ MoR Text | Correct disclaimers, no "indicative" language |

### Still Contains Affiliate Patterns (Needs Removal)

| Component | Issue |
|-----------|-------|
| `ApiPendingNotice.tsx` | Full affiliate comparison hub with partner redirect links (Aviasales, Kiwi, JetRadar) |
| `AffiliatePartnerSelector.tsx` | Uses `trackAffiliateClick`, `window.open` to external site, ExternalLink icons |
| `useDuffelFlights.ts` Line 6 | Comment says "Hizovo is NOT the merchant of record" - incorrect |
| `duffel-flights/index.ts` Line 9 | Comment says "Hizovo is NOT the merchant of record" - incorrect |
| `FlightTravelerInfo.tsx` Line 6 | Comment says "Hizovo is NOT the merchant of record" - incorrect |
| `trackPageView` import | Still imported in FlightResults (line 25) |
| Various "Hizivo" / "Hizovo" references | 70+ files still contain old brand name |

---

## Implementation Plan

### Phase 1: Remove ApiPendingNotice (Affiliate Hub)

**Problem:** `ApiPendingNotice.tsx` is a full affiliate comparison component that:
- Builds partner URLs (Aviasales, JetRadar, Kiwi)
- Shows "Continue to secure booking" with ExternalLink
- Says "Hizivo does not issue airline tickets"
- Says "Final booking completed on partner site"

**Solution:** 
1. Remove import from `FlightResults.tsx` (line 55)
2. Delete the `ApiPendingNotice.tsx` file entirely
3. Remove export from `src/components/results/index.ts`

The component is currently imported but NOT rendered in FlightResults (searched entire file - it's imported but never used in JSX). This is dead code that should be removed.

---

### Phase 2: Remove AffiliatePartnerSelector

**Problem:** `AffiliatePartnerSelector.tsx` uses affiliate tracking and external redirects.

**Solution:**
1. Delete `src/components/flight/AffiliatePartnerSelector.tsx`
2. Search for any imports and remove them
3. Update `src/components/flight/index.ts` to remove export

---

### Phase 3: Update Comments to MoR Model

**Files with incorrect "NOT merchant of record" comments:**

| File | Line | Current Comment | New Comment |
|------|------|-----------------|-------------|
| `src/hooks/useDuffelFlights.ts` | 6 | "Hizovo is NOT the merchant of record" | "ZIVO is the Merchant of Record for flight bookings" |
| `supabase/functions/duffel-flights/index.ts` | 9 | "Hizovo is NOT the merchant of record" | "ZIVO is the Merchant of Record - Stripe + Duffel" |
| `src/pages/FlightTravelerInfo.tsx` | 6 | "Hizovo is NOT the merchant of record" | "ZIVO is the Merchant of Record - internal checkout" |

---

### Phase 4: Remove Unused Affiliate Tracking Import

**File:** `src/pages/FlightResults.tsx`

Remove line 25:
```typescript
// REMOVE: import { trackPageView } from "@/lib/affiliateTracking";
```

The `trackPageView` function is used in the component (lines 102-110), but for OTA mode we should either:
- Keep it for analytics purposes (harmless)
- OR remove the import and the useEffect that calls it

**Recommendation:** Keep for analytics - it just tracks page views, not affiliate clicks.

---

### Phase 5: Update CTA Text (Already Correct)

Current state in `FlightResultCard.tsx` lines 263-266:
```tsx
<span className="hidden sm:inline">{FLIGHT_CTA_TEXT.viewDeal}</span>  // = "Select Flight"
<span className="sm:hidden">Select</span>
<ArrowRight className="w-4 h-4" />  // ✅ Not ExternalLink
```

And line 271:
```tsx
<p className="text-[9px] text-muted-foreground text-center leading-relaxed max-w-[160px]">
  Secure ZIVO checkout
</p>
```

**Status:** Already correct. The CTA says "Select Flight" with ArrowRight icon and "Secure ZIVO checkout" micro-copy.

However, the user requested "Book on ZIVO" as the CTA. We should update:

| Location | Current | Proposed |
|----------|---------|----------|
| `FLIGHT_CTA_TEXT.viewDeal` | "Select Flight" | "Book on ZIVO" |
| Desktop button | "Select Flight" | "Book on ZIVO" |
| Mobile button | "Select" | "Book" |

---

### Phase 6: Update Trust Banner Text

**File:** `src/pages/FlightResults.tsx` lines 406-422

Current:
```tsx
<p className="text-sm font-medium text-foreground">
  Book directly on ZIVO • Tickets issued instantly
</p>
```

This is already correct. The trust banner says:
- "Book directly on ZIVO • Tickets issued instantly"
- "Secure ZIVO checkout"
- "Prices include all taxes & fees"

No changes needed.

---

### Phase 7: EmptyResults Message Update

**File:** `src/pages/FlightResults.tsx` line 515

Current:
```tsx
<EmptyResults 
  service="flights"
  message="No flights found for this route. Try adjusting your dates or filters."
/>
```

User requested: "No flights found for these dates. Try different dates or nearby airports."

**Change:** Update message text.

---

### Phase 8: Branding Cleanup (Hizivo → ZIVO)

Based on search, 70+ files contain "Hizivo" or "Hizovo" references. Key files:
- `src/components/results/ApiPendingNotice.tsx` (will be deleted)
- Various component files
- Legal pages

**Approach:** After removing affiliate components, do a batch find/replace:
- "Hizivo" → "ZIVO"
- "Hizovo" → "ZIVO"
- "hizovo.com" → "hizivo.com" (or keep for domain)

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/results/ApiPendingNotice.tsx` | DELETE | Remove affiliate hub component |
| `src/components/results/index.ts` | MODIFY | Remove ApiPendingNotice export |
| `src/components/flight/AffiliatePartnerSelector.tsx` | DELETE | Remove affiliate partner selector |
| `src/components/flight/index.ts` | MODIFY | Remove AffiliatePartnerSelector export |
| `src/pages/FlightResults.tsx` | MODIFY | Remove ApiPendingNotice import, update empty state message |
| `src/hooks/useDuffelFlights.ts` | MODIFY | Update comment to MoR model |
| `supabase/functions/duffel-flights/index.ts` | MODIFY | Update comment to MoR model |
| `src/pages/FlightTravelerInfo.tsx` | MODIFY | Update comment to MoR model |
| `src/config/flightCompliance.ts` | MODIFY | Change viewDeal CTA to "Book on ZIVO" |

---

## Verification Checklist

After implementation, verify:

1. **Search flights** - Real Duffel offers display with exact prices
2. **Result cards** - Show "Book on ZIVO" CTA with ArrowRight (not ExternalLink)
3. **No affiliate text** - No "partner redirect", "indicative prices", "continue to secure booking"
4. **Trust banner** - Shows "Book directly on ZIVO" (already correct)
5. **Select flight** - Navigates to `/flights/details/{id}` (internal)
6. **Traveler info** - Collects passengers, navigates to `/flights/checkout`
7. **Checkout** - Stripe payment processed by ZIVO
8. **Confirmation** - Shows PNR and ticket numbers
9. **Empty state** - Shows "Try different dates or nearby airports"
10. **No Hizivo** - Search codebase confirms no legacy brand references

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

**Result:** Pure OTA flow with NO external redirects, NO partner comparisons, NO affiliate tracking for flights.

---

## New CTA and Disclaimer Text

### Result Card Button
**Current:** "Select Flight" + ArrowRight
**New:** "Book on ZIVO" + ArrowRight

### Trust Banner (Already Correct)
"Book directly on ZIVO • Tickets issued instantly"

### Footer Disclaimer (Already Correct)
"ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under airline rules."

### Empty State
**Current:** "No flights found for this route. Try adjusting your dates or filters."
**New:** "No flights found for these dates. Try different dates or nearby airports."
