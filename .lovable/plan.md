# Stores List — Toasts, Favorites, Drawer, GPS Recenter, Robust Loading

Five upgrades to `/store-map/list` (with one carried over to `/store-map`):

## 1. Share confirmation toast
- Use `sonner` `toast` to confirm share outcome:
  - Native share success → `toast.success("Shared!")`
  - Clipboard fallback → `toast.success("Link copied to clipboard")`
  - User cancels (`AbortError`) → no toast
  - Hard failure → `toast.error("Couldn't share — try again")`
- Apply to both `handleShare` in `src/pages/StoresListPage.tsx` and the existing card `Share` button in `src/pages/StoreMapPage.tsx` so the behavior is consistent.

## 2. Robust loading / errors on the list page
- Improve skeletons in `src/pages/StoresListPage.tsx`: 6 rows that match real card shape (logo block + 2 text bars + footer action bar).
- Surface fetch failure: when `useStorePins().error` is set, show an inline error card with reason + **Retry** button (`refetch()`).
- GPS failure: track `gpsError` state. If geolocation fails or is denied, show a small inline banner above the list ("Location unavailable — list isn't sorted by distance") with a **Try again** button that re-runs the GPS request. Distance pills hide when no location.
- Update `src/hooks/useStorePins.ts` to also return `refetch` and `error`.

## 3. Favorite / heart button + Favorites filter
- New hook `src/hooks/useStoreFavorites.ts` backed by the existing `user_favorites` table (`item_type='store'`, `item_id=store.id`). RLS already restricts to the owner.
  - `isFavorite(id)`, `toggleFavorite(id, snapshot)` with optimistic update + rollback on failure.
- On every list row: heart button (top-right of the meta column) toggles favorite. Toast on add/remove. If signed-out, toast prompt to sign in.
- Add a **Favorites** chip at the start of the category row (after "All") showing the count. When active, list filters to favorited stores only and displays an empty state with link to clear filter when there are none.
- URL param `fav=1` so the state survives reload / back-from-store.

## 4. Recenter distance action
- Add a small **Recenter** pill in the list header (right side, next to the search button), icon `Locate`. Tapping it:
  - Re-requests GPS (`getCurrentPosition` with `maximumAge: 0`).
  - On success → updates `userLoc`, toast `"Distances updated"`.
  - On failure → sets `gpsError`, toast.error.
- A spinner replaces the icon while in flight. Disabled during request.

## 5. Store details drawer (tap row → drawer)
- Replace the row's primary tap behavior: tapping the card body opens a **bottom drawer** instead of going straight to the shop. The drawer shows:
  - Logo, name, category badge, rating, distance.
  - Hours (`s.hours`), full address with map-pin icon, phone (tap to call), and a small "Open in map" link that returns to `/store-map?focus=<storeId>`.
  - Primary actions: **View Store** (→ `/grocery/shop/:slug`), **Ride There**, **Share**, **Favorite/Unfavorite**.
- The existing inline action bar (Ride / Share / Call / more) stays for power users — tapping those still works without opening the drawer (`stopPropagation`).
- New component lives inline in `StoresListPage.tsx` (or extracted to `src/components/stores/StoreDetailsDrawer.tsx` if it grows).
- Map page: support `?focus=<storeId>` to auto-select that store's pin and pan to it on load.

## Database
No migration required — `user_favorites` already exists with the right shape and RLS policies (own-row only on select/insert/delete). Schema:
```
user_favorites(id uuid pk, user_id uuid, item_type text, item_id text, item_data jsonb, created_at timestamptz)
```
We will use `item_type='store'` and store a small JSON snapshot (name, slug, category, logo_url) so the favorites view can render even if the store is deleted.

## Files
- **New**: `src/hooks/useStoreFavorites.ts`
- **Edited**: `src/hooks/useStorePins.ts` (return `refetch`, `error`)
- **Edited**: `src/pages/StoresListPage.tsx` (toasts, skeletons, error UI, favorites chip + heart, recenter button, details drawer)
- **Edited**: `src/pages/StoreMapPage.tsx` (share toast, accept `?focus=` param)

## Acceptance checks
- Tap Share on row → see "Link copied to clipboard" toast (or "Shared!" on native).
- Disable network → list shows error card with working Retry.
- Deny location → banner appears, distance pills hidden, "Try again" reinitiates request.
- Tap heart on a row → row updates instantly, toast confirms; reload preserves state; switch to Favorites chip → only that store remains.
- Tap Recenter → spinner, then "Distances updated" toast and visible re-sort.
- Tap row body → drawer opens with hours/address/phone/distance/rating; primary buttons all work; closing returns to list.
