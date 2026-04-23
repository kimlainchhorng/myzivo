

## Reusable StarRating Component

Build a single shared component for star ratings and use it everywhere stars currently appear, with half-star support, value clamping, and a hover tooltip showing the exact number.

### What you'll see

- **Stars look the same everywhere** — store header, room cards, restaurant reviews, ride/car reviews.
- **Half stars work** — a 4.5 rating shows 4 full stars and one half-filled star (not rounded to 5).
- **Hover tooltip** — hovering the stars on desktop shows "4.5 out of 5 (based on 128 reviews)" so the number is always discoverable.
- **Each individual review row** in restaurant/store/ride/car review lists gets a small star row next to the reviewer's name (some currently only show a number).
- **No more broken stars** — a bad value like `-1`, `7`, or `"abc"` won't crash; it clamps to 0–5 cleanly.

### Technical Plan

**1. New component: `src/components/shared/StarRating.tsx`**
- Props: `value: number`, `max?: number = 5`, `size?: "xs" | "sm" | "md" | "lg"`, `showValue?: boolean`, `reviewCount?: number`, `tooltip?: boolean = true`, `className?: string`.
- Clamping: `const safe = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0`.
- Half-star rendering: render `max` Star icons; for each index `i`:
  - If `safe >= i + 1` → full amber star (`fill-amber-400 text-amber-400`).
  - Else if `safe >= i + 0.5` → half star using `StarHalf` from lucide-react (amber fill + amber text).
  - Else → muted empty star.
- Tooltip: wrap stars in `Tooltip` from `@/components/ui/tooltip`. Content = `"{safe.toFixed(1)} out of {max}"` plus `" • {reviewCount} reviews"` when provided.
- Size map: `xs=h-3 w-3`, `sm=h-3.5 w-3.5`, `md=h-4 w-4`, `lg=h-5 w-5`.

**2. Replace existing inline star blocks** with `<StarRating />`:
- `src/pages/StoreProfilePage.tsx` (header rating block at line ~326) — use `value={store.rating ?? 4.5}` with tooltip + review count.
- `src/components/rides/RideSocialFeatures.tsx` (line ~152) — per-review row.
- `src/pages/CarRentalBooking.tsx` (line ~781) — per-review row.
- `src/pages/cars/CarDetailPage.tsx` (line ~302) — per-review row.
- `src/components/flight/FlightReviewsWidget.tsx` (`renderStars`) — replace with StarRating.
- `src/components/admin/store/StorePerformanceSection.tsx` (`renderStars`) — replace.
- `src/components/marketplace/MarketplaceReviewSheet.tsx` — keep its interactive picker as-is (it's an input, not a display); leave untouched.

**3. Add per-row stars to review sections that currently show only numbers**
- Audit restaurant/store reviews list inside `StoreProfilePage` (and any `StoreReviewsSection`-style component if present). For each review item render `<StarRating value={review.rating} size="xs" />` next to the reviewer name + date.

**4. TooltipProvider check**
- App root already wraps in `TooltipProvider` (standard in this project via `App.tsx`); no extra setup needed. If a usage site is outside the provider, the component falls back gracefully (Radix Tooltip simply won't show).

### Out of scope
- The hotel "star class" displays (`hotel.starRating` showing how many stars a hotel is rated, e.g. "5-star hotel") will keep their existing simple full-star rendering since they represent a hotel category, not a review average.
- The interactive "tap to rate" picker in `MarketplaceReviewSheet` stays as-is (input control, not a display).

### Files

**Created**
- `src/components/shared/StarRating.tsx`

**Edited**
- `src/pages/StoreProfilePage.tsx`
- `src/components/rides/RideSocialFeatures.tsx`
- `src/pages/CarRentalBooking.tsx`
- `src/pages/cars/CarDetailPage.tsx`
- `src/components/flight/FlightReviewsWidget.tsx`
- `src/components/admin/store/StorePerformanceSection.tsx`

