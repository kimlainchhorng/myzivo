# ZIVO Flights OTA Language Update - COMPLETED ✅

## Summary

All affiliate wording has been removed from Flights pages and modals. ZIVO now operates as an OTA (Merchant of Record) for flights.

---

## Completed Changes

### 1. FlightSearchFormPro.tsx ✅
- Updated helper text: "Payment completed securely on ZIVO. Tickets issued by licensed partners."

### 2. NoFlightsFound.tsx ✅
- Removed affiliate fallback CTA entirely
- Updated title: "No flights available"
- Updated message: "No flights found for these dates. Try different dates or nearby airports."
- Kept cross-sell for Hotels/Cars (those remain affiliate model)

### 3. FlightDetailsModal.tsx ✅
- Removed trackAffiliateClick import
- Removed AFFILIATE_LINKS import
- Changed CTA from external link to internal Button
- Changed icon from ExternalLink to ArrowRight
- Changed text from "Book Flight" to "Select Flight"
- Updated disclaimer to OTA language

### 4. FlightConsentGate.tsx ✅
- Marked as @deprecated for OTA flow
- Updated for internal checkout use (not external redirect)
- Changed title from "Partner Checkout" to "Confirm Booking"
- Updated all language to OTA model

### 5. HowBookingWorks.tsx ✅
- Updated comment: "Trust-building component explaining the ZIVO booking flow"

---

## Global Rules Enforced

When `DUFFEL_ENV = live` or `sandbox`:
1. ✅ IF Duffel returns 0 offers → Shows "No flights available" UI
2. ✅ NO fallback to affiliate redirects
3. ✅ All booking language describes ZIVO as the payment/booking platform
4. ✅ Partners are described only as ticket issuers

---

## Verification Checklist

- [x] Edit Flight Search modal shows "Payment completed securely on ZIVO"
- [x] FlightDetailsModal uses internal navigation (no external link)
- [x] NoFlightsFound shows simple "No flights available" (no affiliate CTA)
- [x] No "partner checkout" or "partner site" text in flight modals
- [x] No `window.open` redirects for flights
- [x] No ExternalLink icons on flight CTAs
- [x] All flight booking language describes ZIVO as the platform
