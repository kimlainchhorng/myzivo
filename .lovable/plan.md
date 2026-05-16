
## Goal
Fix the visible issues on `/hotels` (HotelsLandingPage.tsx) in light theme and finish the deferred Step 3 of the Maps performance plan. Pure frontend/presentation work plus one shared component.

---

## A. Hotel page visual polish

**File:** `src/pages/lodging/HotelsLandingPage.tsx`

1. **Hero scrim & legibility** — the current `from-primary/75 via-primary/45 to-background` washes the sunset photo emerald in light mode and still leaves the title low-contrast. Replace with a true dark scrim that works in both themes:
   - `bg-gradient-to-b from-black/55 via-black/30 to-background`
   - Add `bg-black/15` base layer behind everything so title/subtitle always read.
   - Bump title to `text-[22px] sm:text-[26px]` and subtitle to `text-[13px]` with `text-white/90`.

2. **Quick filter chips contrast** — `bg-background` + `border-border` chips disappear on the white page. Change inactive state to `bg-card border-border/80 shadow-sm` and ensure the row sits on a faint divider (`border-t border-border/60`) so it reads as its own band. Same treatment for the Sort / Budget / Type chip rows for consistency.

3. **Featured / Popular horizontal rows — scroll affordance on desktop** — at ≥`md` add a right-edge fade (`after:` pseudo overlay) and small chevron button that scrolls the row by ~320px. Mobile unchanged.

4. **Sort row consistency** — already uses `bg-primary` vs `bg-muted/70`; leave behavior but switch active to `bg-foreground text-background` so it matches the existing List/Map toggle and doesn't read as "emerald button" next to neutral chips.

5. **"New" badge spam** — only render the `New` badge for stores `created_at` within last 30 days (data already on store). Otherwise render rating-or-price (already computed) where the badge sat.

**New shared component:** `src/components/shared/SmartImage.tsx`

- Wraps `<img>` with: skeleton (`bg-muted animate-pulse`) until `onLoad`, fallback to a branded placeholder (HotelIcon + gradient like the existing empty state) on `onError`, `loading="lazy"` and `decoding="async"` by default. Accepts `aspect` and `rounded` props.
- Replace raw `<img>` in featured/all-hotels cards and Popular destinations tiles. Removes the `?` placeholder seen on broken images and gives a consistent skeleton instead.

---

## B. Finish Maps Performance — Step 3

**File:** `src/components/lodging/HotelsMapView.tsx`

1. **Viewport-cap markers to 40** — listen to `map.addListener('idle', …)` (throttled 200ms via `requestAnimationFrame`), compute `map.getBounds()`, filter hotels in-bounds, slice top 40 by price/rating, and render only those overlays. Off-screen overlays are removed from the DOM (huge win on mid-range Android).

2. **AdvancedMarkerElement when available** — if `google.maps.marker?.AdvancedMarkerElement` exists AND `import.meta.env.VITE_GOOGLE_MAPS_MAP_ID` is set, render price pills via `AdvancedMarkerElement` with a custom DOM element. Otherwise fall back to current `OverlayView` (no regression).

3. **Map `mapId` prop** — pass `mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}` to the GoogleMap so Advanced markers actually mount.

No new dependencies. No backend / RLS / data changes.

---

## C. Validation

1. Visually verify `/hotels` in light theme at 1034px (desktop) and 390px (iPhone) — hero readable, chips visible, no `?` images.
2. Toggle to Map view → confirm price pills render and panning re-caps to ≤40 visible markers.
3. Build passes (auto). No console errors beyond the pre-existing `has_role` permission warning (unrelated to this scope).

---

## Out of scope (explicitly not touching)

- `RoutePrefetcher`, `HotelLanding.tsx`, search forms.
- The `Error fetching brand config: permission denied for function has_role` console warning (separate RLS issue — flag for a follow-up).
- Any backend/data changes to `food_orders`, `stores`, or RLS.
