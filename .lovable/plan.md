

# ZIVO Flights Final Modal Cleanup - Remove All Affiliate Language

## Summary

Remove remaining affiliate wording from the Edit Flight Search modal and all flight-related modals/components to ensure full OTA (Merchant of Record) consistency.

---

## Issue Identified

The FlightSearchFormPro component (used in the Edit Search modal) still displays:

```
"Final booking completed on our airline partner's secure site."
```

This contradicts ZIVO's OTA booking flow where:
- Users book and pay on ZIVO
- Tickets are issued by licensed partners after payment

---

## Components Requiring Updates

### 1. FlightSearchFormPro.tsx - Edit Search Modal Helper Text

**File:** `src/components/search/FlightSearchFormPro.tsx`

| Line | Current | New |
|------|---------|-----|
| 643 | "Final booking completed on our airline partner's secure site." | "Payment completed securely on ZIVO. Tickets issued by licensed partners." |

---

### 2. NoFlightsFound.tsx - Complete Rewrite for OTA

This component is a full affiliate fallback that redirects users to external partner sites when Duffel returns 0 offers.

**Per the user's requirement:** IF Duffel returns 0 offers, show "No flights available" UI - DO NOT fallback to affiliate.

| Section | Current | New |
|---------|---------|-----|
| Title | "Comparing live deals" | "No flights available" |
| Message | "We're searching licensed travel partners..." | "No flights found for these dates. Try different dates or nearby airports." |
| Primary CTA | "Search Partner Site" + ExternalLink + window.open affiliate | **REMOVE ENTIRE SECTION** |
| Disclaimer | FLIGHT_DISCLAIMERS.ticketingShort | Update or remove |

**Remove:**
- `handleSearchPartner` function
- AFFILIATE_LINKS import
- trackAffiliateClick import
- Primary affiliate CTA section
- ExternalLink icon (for flights)

**Keep:**
- Cross-sell options for Hotels/Cars (those are affiliate model)
- Clear Filters / Modify Search buttons

---

### 3. FlightDetailsModal.tsx - Remove Affiliate Redirect

This modal uses affiliate link redirection instead of internal OTA navigation.

| Section | Current | New |
|---------|---------|-----|
| Import | trackAffiliateClick, AFFILIATE_LINKS | Remove |
| Line 364-367 | Affiliate disclosure | OTA disclaimer |
| Line 375-399 | External link to AFFILIATE_LINKS.flights.url | Internal navigation to `/flights/details/{id}` |
| Icon | ExternalLink | ArrowRight |
| CTA | "Book Flight" + ExternalLink | "Select Flight" + ArrowRight |

---

### 4. FlightConsentGate.tsx - Update or Deprecate

This component exists specifically for affiliate partner redirect consent flow. With OTA mode:
- External redirects don't happen for flights
- Consent is handled on the ZIVO checkout page

**Options:**
1. **Deprecate entirely** - Not needed for OTA flow
2. **Repurpose** - Update for internal ZIVO checkout consent

**Recommendation:** Update for OTA use or mark as deprecated.

| Section | Current | New |
|---------|---------|-----|
| Title | "Partner Checkout" | "Confirm Booking" or deprecate |
| Description | "You're being redirected to complete your booking with our airline partner." | "Review and confirm your booking details." or deprecate |
| CTA | Redirect to external URL | Not needed - remove or redirect internally |

---

### 5. HowBookingWorks.tsx - Update Comment

| Line | Current | New |
|------|---------|-----|
| 3 | "Trust-building component explaining the partner checkout flow" | "Trust-building component explaining the ZIVO booking flow" |

---

## File Changes Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/search/FlightSearchFormPro.tsx` | MODIFY | Update helper text to OTA language |
| `src/components/flight/NoFlightsFound.tsx` | MODIFY | Remove affiliate fallback, update to OTA empty state |
| `src/components/flight/FlightDetailsModal.tsx` | MODIFY | Remove affiliate redirect, use internal navigation |
| `src/components/flight/FlightConsentGate.tsx` | MODIFY/DEPRECATE | Update or mark as deprecated for OTA |
| `src/components/flight/HowBookingWorks.tsx` | MODIFY | Update comment only |

---

## New Text Standards

### FlightSearchFormPro Helper Text
- **Current:** "Final booking completed on our airline partner's secure site."
- **New:** "Payment completed securely on ZIVO. Tickets issued by licensed partners."

### NoFlightsFound Empty State
- **Title:** "No flights available"
- **Message:** "No flights found for these dates. Try different dates or nearby airports."
- **NO affiliate fallback CTA**

### FlightDetailsModal CTA
- **Current:** External link with ExternalLink icon
- **New:** Internal button with ArrowRight icon, navigates to `/flights/details/{id}`

---

## Global Rule Enforcement

When `DUFFEL_ENV = live` or `sandbox`:
1. IF Duffel returns 0 offers → Show "No flights available" UI
2. DO NOT fallback to affiliate redirects
3. All booking language must describe ZIVO as the payment/booking platform
4. Partners are described only as ticket issuers

---

## Technical Details

### FlightSearchFormPro.tsx Change (Line 641-644)

Replace:
```tsx
{/* Helper text below button */}
<p className="text-xs text-muted-foreground text-center mt-2">
  Final booking completed on our airline partner's secure site.
</p>
```

With:
```tsx
{/* Helper text below button */}
<p className="text-xs text-muted-foreground text-center mt-2">
  Payment completed securely on ZIVO. Tickets issued by licensed partners.
</p>
```

### NoFlightsFound.tsx Simplification

Remove:
- Lines 28-48: `handleSearchPartner` function
- Lines 99-118: Primary affiliate CTA section
- Imports: AFFILIATE_LINKS, trackAffiliateClick (for flight context)

Update:
- Line 80: "Comparing live deals" → "No flights available"
- Line 81-83: Message to "No flights found for these dates. Try different dates or nearby airports."

Keep:
- Cross-sell for Hotels/Cars/Activities (lines 120-148) - these remain affiliate model

### FlightDetailsModal.tsx Simplification

Remove:
- Line 17: trackAffiliateClick import
- Line 18: AFFILIATE_LINKS import
- Lines 380-393: trackAffiliateClick call

Replace lines 375-399:
```tsx
// External affiliate link
<a 
  href={AFFILIATE_LINKS.flights.url}
  target="_blank"
  ...
>
  <ExternalLink className="w-4 h-4" />
  Book Flight
</a>
```

With:
```tsx
// Internal navigation button
<Button
  onClick={() => {
    onOpenChange(false);
    onSelectFlight?.(flight);
  }}
  className="flex-1 gap-2 bg-gradient-to-r from-sky-500 to-blue-600..."
>
  <ArrowRight className="w-4 h-4" />
  Select Flight
</Button>
```

---

## Verification Checklist

After implementation, confirm:
1. Edit Flight Search modal shows "Payment completed securely on ZIVO"
2. FlightDetailsModal uses internal navigation (no external link)
3. NoFlightsFound shows simple "No flights available" (no affiliate CTA)
4. No "partner checkout" or "partner site" text in flight modals
5. No `window.open` redirects for flights
6. No ExternalLink icons on flight CTAs
7. All flight booking language describes ZIVO as the platform

