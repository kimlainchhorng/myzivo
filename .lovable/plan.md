

## Desktop Split Layout for Store Profile — Map & Actions Side Rail

On large screens (lg ≥ 1024px), turn the store profile page into a two-column layout: store content on the left, a sticky right rail with a live map and quick-action panel. Mobile stays exactly as it is today.

### What you'll see (desktop only)

**Left column (≈ 62% width, max-w-3xl)**
- Store header card, Rooms & Rates / Products, reviews, policy footer — the existing flow, just constrained to the left.

**Right column (≈ 38% width, sticky, top-aligned under the banner)**
- **Mini map card** (rounded-3xl, glass, h-72): Google/Mapbox tile centered on the store's coordinates with an emerald ZIVO pin. "Open full map" link → `/store-map?focus={slug}`.
- **Address block**: store address with a copy-to-clipboard icon, distance from user (if GPS allowed).
- **Ride There** button (full-width, emerald) → existing ride deep link.
- **Quick actions row** (3 pill buttons): Call Store, Live Chat, Share — same gating logic as the current header (locked until booking confirmed, with the existing tooltip).
- **Stay summary card** (lodging only): the existing `LodgingStaySelector` moves into the rail so check-in/out/guests stay visible while scrolling rooms.
- **Hours & status chip**: today's open/close times + "Open 24 hours" / "Closes at …" line.
- **Social links row** (FB / IG / Telegram icons) when present.

The rail uses `lg:sticky lg:top-20 lg:self-start` and scrolls internally if the viewport is short.

### Layout structure

```text
┌─ Banner (full width, h-60) ──────────────────────────────┐
│                                                            │
└────────────────────────────────────────────────────────────┘
┌─ max-w-7xl mx-auto px-4 ──────────────────────────────────┐
│ ┌─ left (lg:col-span-7) ──┐  ┌─ right rail (lg:col-span-5)│
│ │ Store header card        │  │ ┌─ Mini map (h-72) ─────┐ │
│ │ Stay selector* (mobile)  │  │ │  [pin]                │ │
│ │ Rooms & Rates / Products │  │ └───────────────────────┘ │
│ │ Reviews                  │  │ Address + distance        │
│ │ Policy footer            │  │ Ride There (CTA)          │
│ │                          │  │ Call · Chat · Share       │
│ │                          │  │ Stay selector* (lg)       │
│ │                          │  │ Hours · Socials           │
│ └──────────────────────────┘  └───────────────────────────┘
└────────────────────────────────────────────────────────────┘
```
*Stay selector renders inline on mobile, in rail on lg+.

### Technical Plan

**1. `src/pages/StoreProfilePage.tsx`**
- Wrap the post-banner content in `<div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-12 lg:gap-6">`.
- Left column: `<div className="lg:col-span-7 min-w-0">` containing the existing header card, products/rooms, reviews, footer.
- Right column: `<aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 lg:self-start space-y-3">` — a new local component `<StoreSideRail store={store} ... />`.
- Move the existing **Ride There** button and **Lock/Live-Chat** unlock row into the rail on lg, keep them inline on mobile via duplicated render gated by `hidden lg:hidden` / `hidden lg:block` (or extract to a `StoreActionPanel` that both surfaces use).
- Move `LodgingStaySelector` into the rail on lg using the same dual-render pattern.

**2. New file `src/components/grocery/StoreSideRail.tsx`**
- Props: `store`, `hasBooking`, `bookingSource`, `chattable`, `callable`, `phoneNumber`, `onOpenChat`, `onOpenCall`, `isLodging`, `stay`, `onStayChange`, `roomsMinPrice`.
- Sections: MiniMap → Address → CTA stack → Stay (lodging) → Hours → Socials.
- Uses `.zivo-card-organic` glass styling consistent with the rest of the page.

**3. New file `src/components/grocery/StoreMiniMap.tsx`**
- Lightweight Google Maps embed (re-uses the existing Maps loader from `RideMap` if available; otherwise a thumbnail via Maps Static API as a fast first paint, with click → full `/store-map?focus={slug}` route).
- Reads `store.latitude` / `store.longitude` (already present per `useStoreProfile`).
- Emerald pin marker matching brand tokens.

**4. Sticky behavior + safe area**
- Rail uses `lg:top-20` to clear the desktop NavBar (header height ≈ 64–72px per `style/desktop-header-consistency`).
- `max-h-[calc(100vh-6rem)] overflow-y-auto` so long content scrolls inside the rail.

**5. No mobile regression**
- All `lg:` prefixes ensure mobile uses the current single-column flow. Mobile bottom nav (`ZivoMobileNav`) untouched.
- Existing booking-gated tooltips, analytics events, and chat/call gating logic are passed through to the rail unchanged.

### Out of scope
- Map clustering or showing nearby stores (that's `/store-map`).
- Reordering the mobile flow.
- Adding a desktop NavBar to the page if not already wrapped (the current page omits it; rail `top-20` is safe either way and can be tuned).

### Files

**Created**
- `src/components/grocery/StoreSideRail.tsx`
- `src/components/grocery/StoreMiniMap.tsx`

**Edited**
- `src/pages/StoreProfilePage.tsx`

