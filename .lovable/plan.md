# Map "See All" Flow + UI Polish + Action QA

## Goal
On `/store-map` (the Map tab from the bottom nav), add a clear **"See All"** entry point that opens a full list view of nearby stores, polish the existing header/chips/FABs to match the screenshot's clean style, and verify every action button (Ride There / View Store / Share / Call / Create Reel / Buy Now / Locate / Recenter / store pin tap / category chip) is wired to the right destination.

## What's missing today
- The Map page has category chips ("All (7)", "Resort (1)"…) but **no "See All" button** — there is no way to browse the full store list without scrubbing the map.
- Header card and chips look slightly heavy; user wants a "new style" cleaner look matching the screenshot.
- Action buttons in the selected-store card (Ride There, View Store, Share, Call, Create Reel, Buy Now) need an end-to-end pass to confirm flows still work after recent edits.

## Plan

### 1. Add "See All" entry on the Map header
- In `src/pages/StoreMapPage.tsx`, add a small **"See all"** pill on the right side of the title card (next to the search icon) that navigates to a new full-list route `/store-map/list`, preserving the current `activeCategory` and `searchQuery` via URL params.
- Tap target ≥ 40px, primary color text, chevron-right icon.

### 2. Build the Stores List page (new)
- New file `src/pages/StoresListPage.tsx`, route `/store-map/list` in `src/App.tsx` (lazy).
- Layout:
  - Sticky header with back arrow → returns to `/store-map` (preserve filter), title "All Stores", count subtitle, and a search input (same behavior as map search).
  - Sticky horizontal category chips row (reuses the same chip styles).
  - Scrollable list: for each store render a card with logo, name, category badge, rating, distance (if `userLocation` available), address, and a right-side chevron.
  - Tap a row → opens `/grocery/shop/:slug` (same as map "View Store").
  - Long-press / kebab → quick actions sheet: Ride There, Share, Call (when phone present).
- Reuse the same Supabase query the map uses (extract into a shared hook `src/hooks/useStorePins.ts` so both Map and List stay in sync; export the existing `StorePin` type).
- Empty state: friendly icon + "No stores match this filter" + reset button.
- Loading state: 6 skeleton rows.

### 3. Polish header + chip "new style"
- Header title card: tighter padding, slightly larger store icon tile (44×44), 13px subtitle muted, subtle 1px border, soft shadow (no heavy blur stack).
- Chips: pill style with 14px font, white background + light border for inactive, primary fill for active, emoji/icon at left, count in muted weight, `whileTap` scale-95. Add a subtle right-edge fade (gradient mask) on the scroll container to hint at horizontal overflow.
- FABs (Locate / Recenter): keep round, raise to 14×14 (56px), add soft shadow ring.

### 4. Wire & verify every action (acceptance checks)
For each item below, confirm the click target navigates / triggers the right side effect with no console error:

| Surface | Button | Expected |
|---|---|---|
| Header | Search icon | Opens inline search input, filters list as you type |
| Header | "See all" | Pushes `/store-map/list?cat=<active>&q=<query>` |
| Chips | All / category | Filters pins on map AND list count updates |
| Map | Pin tap | Selects store, pans, opens bottom card |
| Card | Card body | `/grocery/shop/:slug` |
| Card | Ride There | `trackInitiateCheckout` + `/rides/hub?destination=…` |
| Card | View Store | `/grocery/shop/:slug` |
| Card | Share | `navigator.share` → fallback `clipboard.writeText(buildShopDeepLink)` |
| Card | Call | `tel:` link |
| Card | Create Reel | `/reels` with `commerceLinkDraft` state |
| Card | Buy Now | `trackInitiateCheckout` + `/grocery/shop/:slug?buy=:id` |
| FABs | Locate | Re-requests GPS, pans + zoom 15 |
| FABs | Recenter | Re-fits bounds to current pins |
| List page | Back | Returns to `/store-map` with filter intact |
| List page | Row tap | `/grocery/shop/:slug` |
| List page | Quick action sheet | Same handlers as map card |

After implementation I'll open the preview, walk through the flow on a 428×703 viewport, and report any failures with fixes.

## Files

**New**
- `src/pages/StoresListPage.tsx` — full-list view
- `src/hooks/useStorePins.ts` — shared query + types

**Edited**
- `src/pages/StoreMapPage.tsx` — add "See all" button, refine header/chips/FAB styles, switch to shared hook
- `src/App.tsx` — register `/store-map/list` lazy route

## Out of scope
- Real-time distance sorting via Haversine on the map page (kept only on list page where it's useful).
- Server-side category counts (current client-side filter is fast enough at this volume).
