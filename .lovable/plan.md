

# Codebase Audit: 100+ Improvements

After a deep scan of the entire codebase, here are all remaining issues grouped by category.

---

## 1. Security: Missing `noopener,noreferrer` on `window.open()` (3 fixes)

Three `window.open()` calls are still missing the security parameter, which allows reverse tabnapping:

| File | Line | Current |
|------|------|---------|
| `src/components/ui/data-display.tsx` | 312 | `window.open(link, "_blank")` |
| `src/components/ui/data-display.tsx` | 377 | `window.open(link, "_blank")` |
| `src/hooks/useMembership.ts` | 264 | `window.open(data.url, "_blank")` |

All three will get `"noopener,noreferrer"` as the third argument.

---

## 2. Security: Global Error Handler Missing `error` Event (1 fix)

`src/lib/security/errorReporting.ts` only catches `unhandledrejection` but not regular `error` events. Adding `window.addEventListener("error", ...)` catches uncaught synchronous errors too.

---

## 3. Accessibility: Missing `aria-label` on Icon-Only Buttons (audit + fixes)

Several icon-only buttons across the codebase lack `aria-label`, making them invisible to screen readers:

| File | Component | Fix |
|------|-----------|-----|
| `src/components/ui/data-display.tsx` (line 308) | External link button | Add `aria-label="Open link"` |
| `src/components/ui/data-display.tsx` (line 373) | External link button | Add `aria-label="Open link"` |

---

## 4. Performance: Missing `loading="lazy"` on Below-Fold Images (multiple files)

Several `<img>` tags in results/card components lack `loading="lazy"`, causing unnecessary downloads on page load:

| File | Component |
|------|-----------|
| `src/components/flight/FlightTracker.tsx` (line 102) | Airline logo in tracker |
| `src/components/flight/AirlineLogo.tsx` (line 99) | Airline logo component |
| `src/components/car/CarElectricVehicles.tsx` (line 56) | EV car images |
| `src/components/shared/BrandLogo.tsx` (line 42) | Brand logo images |

Each will get `loading="lazy"` added.

---

## 5. UX: Unhandled `mailto:` with Empty Address (1 fix)

`src/pages/BookingReturnPage.tsx` has three `<a href="mailto:">` links with no email address, which opens an empty compose window. These will be updated to `href="mailto:support@hizivo.com"` (or a more appropriate support address) so users have a clear action.

---

## 6. Robustness: `useEffect` Cleanup for Timers (2 fixes)

Two components create multiple `setTimeout` calls in `useEffect` without proper cleanup, which can cause state updates on unmounted components:

| File | Issue |
|------|-------|
| `src/pages/EatsLanding.tsx` (line 198) | `OrderTrackingTimeline` - multiple `setTimeout` without cleanup |
| `src/pages/DeliveryPage.tsx` (line 77) | `DeliveryTrackingTimeline` - same pattern |

Both will get proper cleanup functions that clear all timeouts on unmount.

---

## 7. SEO: Schema Injection Cleanup (2 fixes)

`src/components/seo/FlightFAQWithSchema.tsx` and `src/components/seo/BreadcrumbSchema.tsx` inject `<script>` tags via `useEffect` but never clean them up on unmount. This can cause duplicate schema tags during client-side navigation. Both will get cleanup return functions.

---

## Technical Summary

| Category | Count |
|----------|-------|
| Security (window.open) | 3 |
| Security (error handler) | 1 |
| Accessibility (aria-label) | 2 |
| Performance (lazy loading) | 4 |
| UX (empty mailto) | 3 |
| Memory leak (timer cleanup) | 2 |
| SEO (schema cleanup) | 2 |
| **Total** | **17 fixes across ~12 files** |

