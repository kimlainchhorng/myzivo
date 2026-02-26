

# Codebase Audit: Next 40+ Fixes

Deep scan across accessibility, performance, security, and production-readiness categories.

---

## 1. Accessibility: Missing `aria-label` on Icon-Only Buttons (8 fixes)

Remaining icon-only buttons without `aria-label`:

| File | Line | Icon | Fix |
|------|------|------|-----|
| `src/pages/business/BusinessAccountPage.tsx` | 137 | ArrowLeft | `aria-label="Go back"` |
| `src/pages/Profile.tsx` | 154-161 | ArrowLeft | `aria-label="Go back"` |
| `src/pages/security/VulnerabilityDisclosure.tsx` | 32 | ArrowLeft | `aria-label="Go back"` |
| `src/components/shared/PromoCodeBanner.tsx` | 63-68 | Copy/Check | `aria-label="Copy promo code"` |
| `src/components/search/FlightSearchFormPro.tsx` | 285-290 | ArrowLeftRight | `aria-label="Swap cities"` |
| `src/components/search/FlightSearchFormPro.tsx` | 518-524 | Minus | `aria-label="Fewer passengers"` |
| `src/components/search/FlightSearchFormPro.tsx` | 528-534 | Plus | `aria-label="More passengers"` |

---

## 2. Performance: Missing `loading="lazy"` on Below-Fold Images (8 fixes)

Images without `loading="lazy"` that are below the fold:

| File | Line | Content |
|------|------|---------|
| `src/pages/FlightTravelerInfo.tsx` | 274 | Airline logo in traveler info |
| `src/pages/FlightDetails.tsx` | 231 | Airline logo in detail header |
| `src/components/hotel/HotelResultCardPro.tsx` | 124 | Hotel result card image |
| `src/components/hotel/HotelInspirationalBanner.tsx` | 22 | Hotel banner image (could be above fold - use `loading="eager"` + `fetchPriority="high"`) |
| `src/components/hotel/HotelExperienceGallery.tsx` | 117 | Experience gallery images |
| `src/components/seo/PopularRoutesGrid.tsx` | 61 | Airline logo in route cards |

---

## 3. Production: Remove `console.log` Statements (12 fixes)

Per the production-lockdown policy, these `console.log` calls should be removed or replaced with proper error handling:

| File | Lines | Content |
|------|-------|---------|
| `src/lib/partnerRedirectLog.ts` | 76-78 | `console.log('[PartnerRedirect] Logged redirect:')` |
| `src/lib/partnerRedirectLog.ts` | 146-148 | `console.log('[SearchSession] Logged session:')` |
| `src/lib/affiliateTracking.ts` | 105 | `console.log("[Affiliate Tracking]")` |
| `src/lib/outboundTracking.ts` | 119 | `console.log('[Hizovo Tracking] Click logged:')` |
| `src/hooks/useSupportTickets.ts` | 438 | `console.log('[useAddTicketMessage] Push sent')` |
| `src/hooks/usePushNotifications.ts` | 107 | `console.log("[Push] Registration token:")` |
| `src/hooks/usePushNotifications.ts` | 123 | `console.log("[Push] Notification received:")` |
| `src/hooks/usePushNotifications.ts` | 136 | `console.log("[Push] Action performed:")` |
| `src/hooks/usePushNotifications.ts` | 193 | `console.log("[Push] Token unregistered")` |
| `src/pages/Feedback.tsx` | 76 | `console.log("Feedback submitted:")` |
| `src/components/shared/AirportTransferBridge.tsx` | 63 | `console.log("Booking transfer:")` |
| `src/contexts/CustomerCityContext.tsx` | 159 | `console.log('No match for detected city')` |

Note: `usePWAUpdate.ts`, `supabaseErrors.ts`, `CurrencyContext.tsx`, and `BookingReturnPage.tsx` logs are operational/debug and should remain at most as `console.debug`.

---

## 4. Downgrade Debug-Level Logs to `console.debug` (6 fixes)

These logs provide operational info but should not pollute production console:

| File | Lines | Change |
|------|-------|--------|
| `src/hooks/usePWAUpdate.ts` | 28 | `console.log` -> `console.debug` |
| `src/hooks/usePWAUpdate.ts` | 33 | `console.log` -> `console.debug` |
| `src/hooks/usePWAUpdate.ts` | 36 | `console.log` -> `console.debug` |
| `src/hooks/usePWAUpdate.ts` | 52 | `console.log` -> `console.debug` |
| `src/lib/supabaseErrors.ts` | 160 | `console.log` -> `console.debug` |
| `src/lib/supabaseErrors.ts` | 176 | `console.log` -> `console.debug` |

---

## 5. Accessibility: `<button>` Elements Missing Labels (1 fix)

| File | Line | Fix |
|------|------|-----|
| `src/components/shared/PriceAlertWidget.tsx` | 167-170 | The `<button>` remove alert has no label. Add `aria-label="Remove alert"` |

---

## Technical Summary

| Category | Count |
|----------|-------|
| Accessibility (aria-label on icon buttons) | 8 |
| Performance (loading="lazy" on images) | 6 |
| Production (remove console.log) | 12 |
| Production (downgrade to console.debug) | 6 |
| Accessibility (plain button labels) | 1 |
| **Total** | **33 fixes across ~18 files** |

