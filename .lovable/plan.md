# Map + Stores List — fixes from live test + parity add-ons

Tested `/store-map` and `/store-map/list` in the preview. Map renders correctly with pins. List + drawer work, but I found one real bug, two visual nits, and several missing-parity actions on the map's selected-store card. Plan below also adds the new things you asked for.

## Bugs to fix

1. **Drawer cropped by bottom nav (BLOCKER).**
   The store details drawer opens but its bottom half (Promo field, Directions / Share buttons, Favorite, "Open in map") sits behind the fixed `ZivoMobileNav`, which is opaque. Fix: hide `ZivoMobileNav` while the drawer is open, same pattern we already use for Manage mode.
   Also pad the drawer's internal scroll bottom by `env(safe-area-inset-bottom)` + 24px so it can never undercut.

2. **Rating shows literal "0" on the map's selected-store card** (Koh Sdach Resort screenshot).
   `s.rating ? … : null` evaluates `0` as truthy via `??`. Treat `rating < 0.1` or null/`0` as "no rating" in `StoreMapPage`'s selected card and in the list row to match the drawer.

3. **GPS denied state never recovers if browser permission was denied at the OS level.**
   The current "Try again" replays `getCurrentPosition`, which silently returns the same denied error. Add an inline help line: "Enable location in your browser/phone settings, then tap Try again." Also stop showing the amber banner once the user dismisses it (`dismissed` local state).

## Parity: bring map's selected-store card up to drawer level

The bottom card on `/store-map` is missing the actions we shipped on the list. Add these three buttons to the map card (icon-only on small widths) so users don't have to dive into the list for them:

- **Favorite** (heart) — wires `useStoreFavorites` toggle, optimistic.
- **Directions** — calls `openDirections(store)`.
- **Promo** — opens a compact inline promo input row directly under the action buttons; on Apply, saves to `sessionStorage["zivo:pending-promo"]` (same key as the list) and toasts.

Layout becomes a 5-button row: `Ride · View · Share · Directions · ♥`, with `Promo ▾` as a secondary line that expands.

## New add-ons you asked for

4. **"Open in details" affordance on the map card.**
   Add a `chevron More` button at the top-right of the map's selected-store card that opens the same full bottom-sheet drawer (extracted from the list page into a shared component) so map users get the full info: hours, phone, address, distance, rating, plus all actions including Promo.
   New shared file: `src/components/store/StoreDetailsDrawer.tsx` consuming `StorePin` + `userLoc` + favorite/promo handlers. Both `StoresListPage` and `StoreMapPage` mount it.

5. **Quick-filter chip: "Open now".**
   When a store has `hours`, parse a simple "Mon–Sun HH:MM–HH:MM" pattern and mark it open/closed for the user's local time. Add an "Open now" chip in the list and on the map. Stores with unparseable hours are excluded silently from the open-now filter (still visible under "All").
   New helper: `src/lib/store/storeHours.ts` (`isOpenNow(hours: string, now = new Date())`).

6. **Persist last-used filters across sessions.**
   `cat`, `q`, `fav`, `openNow` are already in the URL. Mirror them to `localStorage["zivo:stores:filters"]` and rehydrate on first visit when no URL params are present, so returning users land on their preferred view.

7. **"Find me on map" from a list row.**
   In Manage mode this is suppressed, but in normal mode add a small `MapPin` button that calls `navigate("/store-map?focus=" + s.id)` directly without opening the drawer. Useful when the user just wants to see a store's location.

8. **Show queued offline favorite count.**
   When `localStorage["zivo:store-favs:queue"]` has entries, surface a tiny pill in the list header: "2 changes pending sync". On reconnect the existing flush runs; show a toast "Favorites synced" when it succeeds.

## Technical Details

**Edits**
- `src/pages/StoresListPage.tsx`
  - Hide `ZivoMobileNav` when `drawerStore` is set (also keep current `manageMode` rule).
  - Replace inline drawer JSX with `<StoreDetailsDrawer …>`.
  - Add Open-now chip + `MapPin` row button + queued-sync pill.
  - Add localStorage filter persistence (read on mount only when URL is empty).
- `src/pages/StoreMapPage.tsx`
  - Selected-store card: add Favorite / Directions buttons, More-chevron that opens `StoreDetailsDrawer`, and inline promo row.
  - Fix `rating > 0` guard.
  - Pass `cat`/`q`/`fav`/`openNow` through to the list "See all" link so chips stay in sync.
- `src/hooks/useStoreFavorites.ts`
  - Expose `pendingSyncCount` (length of `zivo:store-favs:queue`) and a `syncNow()` helper that calls `flushQueue` and re-reads server state.
  - Fire toast via callback so the page owns wording.

**New files**
- `src/components/store/StoreDetailsDrawer.tsx` — shared bottom-sheet (header, info rows, promo, primary actions, "Open in map" link). Props: `store`, `userLoc`, `onClose`, `onRide`, `onView`, `onShare`, `onDirections`, `isFavorite`, `onToggleFavorite`, `promo`/setters.
- `src/lib/store/storeHours.ts` — `parseHours(text) → WeekSchedule | null` and `isOpenNow(text, now?)`. Handles formats already present in seed data: `"Mon–Sun 8:00–22:00"`, `"Mon-Fri 9-18"`, `"24/7"`, `"Closed"`. Returns `null` (unknown) when unparseable so the UI never lies.
- `src/lib/store/storeHours.test.ts` — unit tests for `isOpenNow` (open, closed, 24/7, overnight, unknown).

**No DB changes.** All state is client-side or in existing tables.

## What I tested live

- `/store-map` → renders Google Maps with 6 active store pins (Asia + Cambodia cluster, North America).
- "See all" → `/store-map/list` loads, GPS denied banner shows correctly, store rows render with rating + category chip + per-row Ride / Share / Call.
- Favorite heart on a row → correctly shows "Sign in to save favorites" toast (preview is unauthed).
- Tap a row → drawer opens, header + address visible, but Promo + action grid are visually clipped by the bottom mobile nav.
- Tap a pin → bottom card shows Ride / View / Share but lacks Favorite / Directions / Promo. Rating displays as `0` for Koh Sdach (no real rating).
