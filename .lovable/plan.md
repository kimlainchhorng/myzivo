
# ZIVO Flights Final OTA Cleanup - Remove All Affiliate Language

## Summary

Complete removal of all remaining affiliate/indicative pricing language from the Flights UI to ensure ZIVO is presented as a true OTA (Merchant of Record) with Duffel ticketing and Stripe checkout. No affiliate fallback UI should ever render.

---

## Components with Remaining Affiliate Language

### Critical Fixes Required

| File | Issue | Fix |
|------|-------|-----|
| `EmptyResults.tsx` | Shows "Estimated prices shown", Cheapest/Best Value/Flexible cards, partner CTA, affiliate disclaimer | Replace with OTA-appropriate empty state for flights |
| `QuickStatsBar.tsx` | Shows "via Aviasales/JetRadar/Kiwi" partner names, "partner websites" footer | Remove partner names, update to airline sources |
| `FlightTicketCard.tsx` | Shows "Estimated", "Indicative price. Final price confirmed on partner checkout.", ExternalLink icon, `window.open` affiliate redirect | Replace with OTA wording, remove affiliate redirect |
| `ResultsContainer.tsx` | Shows "*Indicative prices – final price shown on partner site" | Remove for flights (or change to OTA text) |
| `RampResultsLayout.tsx` | Shows "Indicative prices shown — final price confirmed on partner site", "Hizovo does not issue tickets" | Replace with OTA disclaimer |
| `FlightEmptyState.tsx` | Shows "Search Partner Site" CTA with ExternalLink, affiliate redirect, "partner's secure site" | Replace with OTA messaging |
| `FlightTrustBadgesBar.tsx` | Shows "Secure Partner Checkout", "licensed airline partners" | Change to "Secure ZIVO Checkout" |
| `FlightPriceCalendar.tsx` | Shows "indicative prices" | Change to "estimated" or remove |
| `HeroSection.tsx` | Shows "Indicative prices shown", "Final booking completed on partner site", ExternalLink icon | Remove for flights context |
| `FlightConsentGate.tsx` | Entire component is for partner redirect consent | Component likely unused now (OTA flow) - verify usage |
| `FlightConsentCheckbox.tsx` | Comment says "REQUIRED before partner checkout redirect" | Update comment, verify if still needed |
| `FlightCardWithModal.tsx` | Builds affiliate URL for partner redirect | Update to use internal navigation |

---

## Implementation Plan

### Phase 1: EmptyResults.tsx - Flight-Specific OTA Mode

**Current (lines 38-63):**
```tsx
flights: {
  icon: Plane,
  title: "Estimated prices shown",
  titleFiltered: "No flights match your filters",
  message: "We're comparing deals from our licensed travel partners.",
  // ... mock indicative price cards
}
```

**Updated:**
```tsx
flights: {
  icon: Plane,
  title: "No flights available",  // Changed
  titleFiltered: "No flights match your filters",
  message: "No flights found for these dates. Try different dates or nearby airports.",  // MoR text
  defaultPrices: null,  // NO mock prices for flights
}
```

**Also update:**
- Line 230: Remove "Estimated" label for flights
- Line 239: Remove "Indicative price. Final price confirmed on partner checkout."
- Line 254-256: Remove ExternalLink icon and "Continue to secure booking" for flights
- Line 270: Change disclaimer to "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers."

---

### Phase 2: QuickStatsBar.tsx - Remove Partner Names

**Current (lines 42, 52, 63):**
```tsx
partner: cheapest.partner || "Aviasales",
partner: fastest.partner || "JetRadar", 
partner: bestValue.partner || "Kiwi",
```

**Updated:**
```tsx
partner: undefined,  // Remove partner references
```

**Also update:**
- Line 77: Change "Compare prices from multiple airlines and trusted partners" → "Compare prices from multiple airlines"
- Line 105-107: Remove "via {stat.partner}" display
- Line 117: Change "Final booking is completed securely on partner websites" → "Tickets issued instantly after payment"

---

### Phase 3: FlightTicketCard.tsx - Full OTA Conversion

**Current (lines 320-370):**
- Line 322: `{flight.isRealPrice ? "From" : "Estimated"}`
- Line 334: "Indicative price. Final price confirmed on partner checkout."
- Line 347-351: `window.open(AFFILIATE_LINKS.flights.url, "_blank")`
- Line 369: ExternalLink icon

**Updated:**
- Line 322: Always show "From" (all Duffel prices are exact)
- Line 334: "Final prices shown — tickets issued instantly after payment." (or remove)
- Line 347-351: Replace with internal navigation to `/flights/details/{id}`
- Line 369: Replace ExternalLink with ArrowRight

---

### Phase 4: ResultsContainer.tsx - Remove Indicative for Flights

**Current (lines 71-75):**
```tsx
{indicativePrice && (
  <p className="text-xs text-muted-foreground mt-0.5">
    *Indicative prices – final price shown on partner site
  </p>
)}
```

**Updated:**
Keep `indicativePrice` prop but change the text:
```tsx
{indicativePrice && (
  <p className="text-xs text-muted-foreground mt-0.5">
    Final prices shown — tickets issued instantly after payment.
  </p>
)}
```

Or pass `indicativePrice={false}` from FlightResults.tsx (since Duffel = exact pricing).

---

### Phase 5: RampResultsLayout.tsx - Update Disclaimers

**Current (lines 64-67, 91-93):**
```tsx
<p className="text-xs text-muted-foreground mt-1">
  Indicative prices shown — final price confirmed on partner site
</p>
...
<p className="text-xs text-muted-foreground">
  Hizovo does not issue tickets. Payment and booking fulfillment are handled by licensed travel partners.
</p>
```

**Updated:**
```tsx
<p className="text-xs text-muted-foreground mt-1">
  Final prices shown — tickets issued instantly after payment.
</p>
...
<p className="text-xs text-muted-foreground">
  ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
</p>
```

---

### Phase 6: FlightEmptyState.tsx - Remove Partner Fallback

**Current (lines 222-238):**
```tsx
{/* Partner Fallback CTA */}
<Button onClick={handleSearchPartner}>
  Search Partner Site
  <ExternalLink className="w-4 h-4" />
</Button>
<p>You will complete your booking on our partner's secure site.</p>
```

**Updated:**
Remove entire partner fallback section. Replace with:
```tsx
<p className="text-sm text-muted-foreground">
  Can't find what you're looking for? Try adjusting your search criteria.
</p>
```

Also remove the `handleSearchPartner` function and AFFILIATE_LINKS import.

---

### Phase 7: FlightTrustBadgesBar.tsx - OTA Language

**Current:**
- Line 17: `"Secure Partner Checkout"`
- Line 97: `"All bookings completed with licensed airline partners"`

**Updated:**
- Line 17: `"Secure ZIVO Checkout"`
- Line 97: `"ZIVO sells tickets as a sub-agent of licensed ticketing providers"`

---

### Phase 8: FlightPriceCalendar.tsx - Update Text

**Current (line 69):**
```tsx
Explore indicative prices across the month to compare options
```

**Updated:**
```tsx
Explore prices across the month to find the best deals
```

---

### Phase 9: HeroSection.tsx - Remove Partner Language

**Current (lines 39-41, 81-83, 98-100):**
```tsx
<p>Indicative prices shown · Final price confirmed before payment</p>
...
<ExternalLink /> Final booking completed on partner site.
```

**Updated:**
For flights context, these should not appear. Since this is a shared home page component, we could:
1. Remove these lines entirely (affects hotels/cars too - keep for them)
2. Add a service-specific conditional

**Recommendation:** Keep for hotels/cars (affiliate), but remove ExternalLink icon.

---

### Phase 10: FlightConsentGate.tsx & FlightConsentCheckbox.tsx

These components were designed for affiliate partner redirect flow. Since OTA mode doesn't redirect externally:
1. Verify if these are still used in the OTA flow
2. If used for internal ZIVO checkout consent, update comments and text
3. If unused, mark as deprecated or remove

---

### Phase 11: FlightCardWithModal.tsx - Remove Affiliate URL

**Current (line 25-27):**
```tsx
// Build affiliate URL for partner redirect
const getAffiliateUrl = () => { ... }
```

**Updated:**
Remove affiliate URL logic, use internal navigation:
```tsx
const handleSelect = () => {
  navigate(`/flights/details/${flight.id}`);
};
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/results/EmptyResults.tsx` | MODIFY | Update flights config to OTA language, remove mock price cards |
| `src/components/flight/QuickStatsBar.tsx` | MODIFY | Remove partner names, update footer text |
| `src/components/flight/FlightTicketCard.tsx` | MODIFY | Remove affiliate redirect, use internal navigation, update price labels |
| `src/components/results/ResultsContainer.tsx` | MODIFY | Update indicative price text to OTA language |
| `src/components/results/RampResultsLayout.tsx` | MODIFY | Update disclaimers to OTA language |
| `src/components/flight/FlightEmptyState.tsx` | MODIFY | Remove partner fallback CTA entirely |
| `src/components/flight/FlightTrustBadgesBar.tsx` | MODIFY | Change "Partner Checkout" to "ZIVO Checkout" |
| `src/components/flight/FlightPriceCalendar.tsx` | MODIFY | Remove "indicative" wording |
| `src/components/home/HeroSection.tsx` | MODIFY | Remove ExternalLink icon, keep pricing text for hotels/cars |
| `src/components/flight/FlightCardWithModal.tsx` | MODIFY | Remove affiliate URL, use internal navigation |

---

## New Text Standards

### Empty State
**Old:** "Estimated prices shown"
**New:** "No flights available for these dates. Try different dates or nearby airports."

### Price Labels
**Old:** "Estimated" / "Indicative"
**New:** "From" (all Duffel prices are exact)

### Price Disclaimers
**Old:** "Indicative price. Final price confirmed on partner checkout."
**New:** "Final prices shown — tickets issued instantly after payment."

### Global Disclaimer
**Old:** "Hizovo does not issue tickets. Payment and booking fulfilled by partners."
**New:** "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under airline rules."

### CTAs
**Old:** "Search Partner Site" + ExternalLink
**New:** "Book on ZIVO" + ArrowRight

### Trust Badges
**Old:** "Secure Partner Checkout"
**New:** "Secure ZIVO Checkout"

---

## Global Rule Enforcement

When `DUFFEL_ENV = sandbox` or `live`:
- Affiliate fallback UI must NEVER render
- Partner redirect logic must NEVER execute
- All prices are final (from Duffel API)
- All bookings complete on ZIVO (Stripe checkout)
- Tickets issued via Duffel after payment

---

## Verification Checklist

After implementation, search codebase to confirm ZERO instances of:
1. ❌ "Estimated prices" (for flights)
2. ❌ "Indicative price"
3. ❌ "partner site" / "partner checkout" (for flights)
4. ❌ "does not issue tickets"
5. ❌ "Continue to secure booking" with ExternalLink
6. ❌ Mock Cheapest/Best Value/Flexible cards (for flights)
7. ❌ Partner names (Aviasales, JetRadar, Kiwi)
8. ❌ `window.open` for flights
9. ❌ AFFILIATE_LINKS usage in flight components
10. ❌ Hizivo/Hizovo references

And confirm these ARE present:
1. ✅ "Book on ZIVO" CTA
2. ✅ "From $XXX" price labels
3. ✅ "Final prices shown — tickets issued instantly"
4. ✅ "Secure ZIVO Checkout"
5. ✅ "ZIVO sells flight tickets as a sub-agent..."
6. ✅ ArrowRight icons (internal navigation)
7. ✅ Internal navigate() calls to `/flights/details/{id}`
