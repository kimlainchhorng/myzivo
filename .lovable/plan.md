
# Codebase Audit: Next 25+ Fixes

Deep scan results across accessibility, performance, security, and robustness categories.

---

## 1. Accessibility: Missing `aria-label` on Icon-Only Buttons (17 fixes)

Icon-only `size="icon"` buttons without `aria-label` are invisible to screen readers:

| File | Line | Icon | Fix |
|------|------|------|-----|
| `src/pages/EmbeddedCheckout.tsx` | 212 | HelpCircle | `aria-label="Help"` |
| `src/components/shared/UserTestimonials.tsx` | 117 | ChevronLeft | `aria-label="Previous testimonial"` |
| `src/components/shared/UserTestimonials.tsx` | 127 | ChevronRight | `aria-label="Next testimonial"` |
| `src/components/flight/TravelDocuments.tsx` | 364 | Eye | `aria-label="View document"` |
| `src/components/flight/TravelDocuments.tsx` | 367 | Download | `aria-label="Download document"` |
| `src/components/flight/TravelDocuments.tsx` | 370 | Trash2 | `aria-label="Delete document"` |
| `src/pages/cars/CarDetailPage.tsx` | 139 | ChevronLeft | `aria-label="Previous image"` |
| `src/pages/cars/CarDetailPage.tsx` | 147 | ChevronRight | `aria-label="Next image"` |
| `src/pages/app/UnifiedDashboard.tsx` | 125 | HelpCircle | `aria-label="Help"` |
| `src/pages/app/UnifiedDashboard.tsx` | 126 | User | `aria-label="Profile"` |
| `src/components/seo/FlightSearchForm.tsx` | 111 | ArrowLeftRight | `aria-label="Swap cities"` |
| `src/components/shared/MultiCityPlanner.tsx` | 166 | Plus | `aria-label="Add city"` |
| `src/components/shared/AITravelAssistantWidget.tsx` | 168 | Send | `aria-label="Send message"` |
| `src/pages/TravelTripsPage.tsx` | 40 | ArrowLeft | `aria-label="Go back"` |
| `src/components/support/TicketChatInput.tsx` | 64 | Send | `aria-label="Send message"` |
| `src/components/flight/AirlinePartnersHub.tsx` | 265 | Unlink | `aria-label="Unlink partner"` |
| `src/components/flight/FlightTestimonialsSection.tsx` | 226/250 | ChevronLeft/Right | `aria-label="Previous/Next slide"` |
| `src/pages/ResetPassword.tsx` | 167/201 | Eye/EyeOff | `aria-label="Toggle password visibility"` |
| `src/components/shared/CurrencyConverter.tsx` | 75 | RefreshCw | `aria-label="Refresh rates"` |
| `src/components/shared/CurrencyConverter.tsx` | 114 | ArrowUpDown | `aria-label="Swap currencies"` |
| `src/components/shared/BaggageCalculatorWidget.tsx` | 101 | Minus | `aria-label="Remove bag"` |
| `src/components/shared/BaggageCalculatorWidget.tsx` | 111 | Plus | `aria-label="Add bag"` |
| `src/pages/AITripPlanner.tsx` | 203/215 | Minus/Plus | `aria-label="Fewer/More travelers"` |
| `src/components/flight/GroundTransportBooking.tsx` | 318/327 | Minus/Plus | `aria-label="Fewer/More rental days"` |

---

## 2. Performance: Missing `loading="lazy"` on Below-Fold Images (7 fixes)

| File | Line | Content |
|------|------|---------|
| `src/pages/FlightCheckout.tsx` | 314 | Airline logo in checkout |
| `src/components/hotel/HotelImageShowcase.tsx` | 142 | Hotel property images |
| `src/pages/CarDetailPage.tsx` | 125 | Car detail image |
| `src/pages/EatsLanding.tsx` | 1006 | Restaurant detail image |
| `src/pages/account/FavoritesPage.tsx` | 160 | Favorite item covers |
| `src/components/results/CarResultCard.tsx` | 147 | Company logo inline |
| `src/components/flight/FlightSearchHero.tsx` | 137 | Hero image (change to `loading="eager"` + `fetchpriority="high"` for LCP) |

---

## 3. Performance: Hero Image LCP Optimization (1 fix)

`src/components/flight/FlightSearchHero.tsx` line 137 - the above-fold hero image should have `loading="eager"` and `fetchpriority="high"` to improve Largest Contentful Paint score instead of defaulting to browser behavior.

---

## 4. Accessibility: Carousel Dot Buttons Missing Labels (2 fixes)

| File | Line | Fix |
|------|------|-----|
| `src/pages/cars/CarDetailPage.tsx` | 157 | Add `aria-label={`Go to image ${idx + 1}`}` |
| `src/components/flight/FlightTestimonialsSection.tsx` | 237 | Add `aria-label={`Go to testimonial ${index + 1}`}` |

---

## Technical Summary

| Category | Count |
|----------|-------|
| Accessibility (aria-label on icon buttons) | 25 |
| Performance (loading="lazy" on images) | 6 |
| Performance (LCP hero optimization) | 1 |
| Accessibility (carousel dot labels) | 2 |
| **Total** | **34 fixes across ~20 files** |
