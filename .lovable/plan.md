# Stores List Enhancements

Five additions to the Stores list + details drawer. All scoped to `StoresListPage.tsx`, `useStorePins.ts`, `useStoreFavorites.ts`, plus one new utility for the share image.

## 1. "Manage favorites" mode (bulk un-favorite)

- Add a `Manage` toggle button in the list header (only visible when `favoriteIds.size > 0`).
- When enabled:
  - Each row swaps the heart action for a checkbox; tapping the row toggles selection instead of opening the drawer.
  - A sticky bottom action bar appears with: selection count, `Select all` (favorited stores in current view), `Cancel`, and `Remove (n)`.
  - `Remove` calls `toggleFavorite` for each selected ID in parallel, shows one toast (`Removed N favorites`), and exits manage mode.
- Auto-switches the list to the Favorites filter when entered for clarity.
- New local state: `manageMode: boolean`, `selectedIds: Set<string>`.

## 2. Offline cache for nearby stores + favorites

- Extend `useStorePins`:
  - On query success, write `{ data, ts }` to `localStorage["zivo:stores:cache"]`.
  - Pass `placeholderData` from cache (≤24h old) so the list paints instantly while refetching.
  - Detect `navigator.onLine === false`: skip network, return cached, surface `isOffline` flag.
- Extend `useStoreFavorites`:
  - Mirror `favoriteIds` + `item_data` snapshots into `localStorage["zivo:store-favs:<userId>"]`.
  - On mount, hydrate from cache before Supabase responds.
  - When offline, optimistic toggles are queued in `localStorage["zivo:store-favs:queue"]` and flushed on next mount when online (best-effort).
- List page shows a small "Offline — showing saved list" pill in the header when `!navigator.onLine`.

## 3. Shareable store image card

- New util `src/lib/social/storeShareCard.ts`:
  - `generateStoreCard(store, { distanceMi, logoDataUrl }) → Promise<Blob>` using a 1080×1080 `OffscreenCanvas` (fallback to `<canvas>`).
  - Renders: ZIVO wordmark, store logo (rounded), name, category chip, ⭐ rating, distance, address line, and a footer URL `hizovo.com/s/<slug>`.
  - Uses brand tokens (emerald gradient bg, white card).
- Update `shareStore(s, userLoc)`:
  - Build the card blob.
  - If `navigator.canShare?.({ files: [file] })`, call `navigator.share({ title, text, url, files: [file] })`.
  - Otherwise fall back to current URL share / clipboard copy and additionally trigger a download of the PNG (`<store-name>.png`) so the user still gets the image.
  - Toast text differentiates: `Shared with image`, `Link shared`, `Link copied`.

## 4. "Open directions" in the details drawer

- New helper `openDirections(store)`:
  - Builds `geo:lat,lng?q=<urlencoded address>` for Android.
  - Builds `maps://?daddr=<lat>,<lng>` for iOS (Apple Maps).
  - Falls back to `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` for web/desktop.
  - Detect platform via `Capacitor.getPlatform()` if available, else `navigator.userAgent`.
  - Opens via `openExternalUrl` (already in repo) so Capacitor in-app browser handling is consistent.
- New button in the drawer's primary actions grid: `Directions` (Navigation icon), placed alongside `Ride There`. The grid becomes 2×3.

## 5. Promo code field in the drawer → ride/order

- New section in the drawer (above primary actions): collapsible "Have a promo code?" row that expands to an input + `Apply` button.
- On Apply:
  - Trim/uppercase the code.
  - Persist to `sessionStorage["zivo:pending-promo"] = { code, storeId, storeSlug, ts }` (15-min TTL).
  - Toast `Promo applied — it'll be added to your next ride or order`.
  - Update `handleRide` and the `View Store` action to append `?promo=<code>` to the destination URL so `RequestRidePage` and the shop flow can pick it up.
- Light-touch consumer changes (separate, minimal):
  - `RequestRidePage` and `app/shop/*` checkout: read `sessionStorage["zivo:pending-promo"]` (or `?promo=` query) on mount and pre-fill their existing promo input. No new validation logic — rely on each flow's existing apply path.

## Technical Details

- New files:
  - `src/lib/social/storeShareCard.ts` — canvas card generator + `shareStoreWithCard`.
  - `src/lib/maps/openDirections.ts` — platform-aware directions launcher.
- Edited files:
  - `src/hooks/useStorePins.ts` — localStorage cache + offline placeholder.
  - `src/hooks/useStoreFavorites.ts` — local mirror + offline queue.
  - `src/pages/StoresListPage.tsx` — manage mode UI, offline pill, drawer Directions + Promo, integrate new share util.
  - `src/pages/app/RequestRidePage.tsx` — read `?promo=` / sessionStorage on mount, prefill existing promo field.
  - One shop checkout entry (whichever applies coupons today) — same prefill pattern.
- No DB migration required (favorites table already exists; promo lives in session/URL).
- Bundle impact: small. Canvas card is generated on-demand; image fonts use system stack.

```text
Drawer layout (after changes)
┌─────────────────────────────┐
│ logo  Store Name      [X]   │
│       chip ⭐ 4.8 · 0.7 mi  │
│ 📍 Address                  │
│ 🕒 Hours                    │
│ 📞 Phone                    │
│ ▾ Have a promo code?        │
│   [_______]   [Apply]       │
│ [View Store ] [Ride There ] │
│ [Directions ] [Share      ] │
│ [Favorite                 ] │
│ Open in map                 │
└─────────────────────────────┘
```
