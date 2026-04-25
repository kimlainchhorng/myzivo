# Store Discovery — Type-check, QA, and Map/List Parity

Tighten typing around the new open-now logic, verify the shared drawer on mobile, and bring the Map page fully in line with the List page (Open-now chip, parity actions, drawer reuse).

## 1. Type-check sweep

- Run `bunx tsc --noEmit` (and `bun run lint` if available) and fix anything introduced by:
  - `src/lib/store/storeHours.ts` — confirm `WeekIndex` indexing into `WeekSchedule` (currently `Partial<Record<WeekIndex, DayWindow[]>>`) is consistent; tighten `parseClock` return and `inWindow` parameter types; export `WeekSchedule` if other modules need it.
  - `src/components/store/StoreDetailsDrawer.tsx` — verify `StoreDetailsDrawerProps` matches every call site; fix the non-null assertion on `store.rating!` by narrowing with `showRating &&` already in scope (drop the `!`).
  - `src/pages/StoresListPage.tsx` — ensure `useStoreFavorites()` destructure (`favoriteIds`, `toggle`, etc.) matches the hook signature; ensure `isOpenNow` `null` return is handled in the filter (`openNowOnly && isOpenNow(...) !== true` → exclude).
- No behavior change beyond making the build green.

## 2. Mobile QA of `StoreDetailsDrawer`

After parity edits land, manually verify on the 428×703 preview on both routes:

- `/store-map/list` (List page) — open drawer from a row.
- `/store-map` (Map page) — open drawer from the new "More" button on the selected-store card.

Checklist:
- 44px minimum tap targets on every action button (View, Ride, Directions, Share, Favorite, Promo Apply, Close).
- Drawer respects `env(safe-area-inset-bottom)` and is not clipped by `ZivoMobileNav`.
- Two-column action grid wraps cleanly; Favorite button spans both columns.
- Promo input expands without pushing actions off-screen; long store names truncate.
- Drawer scroll works when address/hours/phone are all present.
- Backdrop tap closes; inner taps do not.

## 3. Open-now chip on `StoreMapPage`

- Add an "Open now" pill into the existing category-chip row (between "All" and category chips). Use the same chip styling as List page for visual consistency.
- New state `openNowOnly` (default from `?open=1` URL param).
- Apply to `filteredStores` via `isOpenNow(store.hours) === true` so unknowns stay hidden when filter is on.
- Update marker rendering effect so toggling re-clusters the pins.
- Pass the filter through the "See all" navigation: append `&open=1` when active so the List page mounts with the same filter.
- Reflect state in URL (`setSearchParams`) so deep-links from List ↔ Map keep the chip in sync.

## 4. Map selected-store card → full action parity

Two changes on `StoreMapPage`:

a) **Add inline buttons to the existing pinned card** (matches List drawer set):
   - Favorite (heart, filled when saved) — calls `useStoreFavorites().toggle`.
   - Directions — calls `openDirections({ lat, lng, label, address })`.
   - Share — uses `shareStoreWithCard` (same util as List) with toast variants.
   - More — opens `<StoreDetailsDrawer>` for the selected store.
   - Keep existing Ride / View / Call but compact them so the row fits 428px without wrap-bleed.

b) **Mount `<StoreDetailsDrawer>` on the Map page**, controlled by a `drawerStore` state. Reuse the shared component with the same props the List page passes:
   - `onView` → `navigate(/grocery/shop/:slug)`
   - `onRide` → existing ride-book handler with promo passthrough
   - `onDirections` → `openDirections(...)`
   - `onShare` → `shareStoreWithCard(...)`
   - `onToggleFavorite` → `toggle(store)`
   - `onOpenInMap` → omit on Map page (not relevant)
   - `onPromoApplied` → `toast.success(\`Promo \${code} applied\`)`
- When the drawer is open, hide the floating selected-store card and the right FAB stack to avoid overlap.

## Technical notes

- Files touched:
  - `src/pages/StoreMapPage.tsx` (chip + parity buttons + drawer mount)
  - `src/components/store/StoreDetailsDrawer.tsx` (small typing fix)
  - `src/lib/store/storeHours.ts` (export types if needed)
  - Possibly `src/pages/StoresListPage.tsx` for the small typing fix on `openNowOnly` filter
- No DB or RLS changes. No new dependencies.
- After edits, screenshot `/store-map` and `/store-map/list` at 428×703 to confirm spacing.

## Out of scope

- Changing marker visuals or clustering behavior.
- Persisting Open-now toggle to `localStorage` (URL param is sufficient for cross-page sync).
