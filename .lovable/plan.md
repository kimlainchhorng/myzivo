# Fix Hotel Detail Page — All Viewports

Looking at the screenshot (390px mobile) and re-reading `HotelResortDetailPage.tsx`, the page is built mobile-only: every section sits in a single 100%-wide column even on iPad / desktop, the room rail is fixed-width 224px regardless of screen size, the sticky CTA goes edge-to-edge on a 1440px monitor, and several smaller polish issues are visible in the upload (e.g. discount only on first room card, no rating visible, owner band and Check Availability pinned in odd places on desktop).

## Issues to fix

### 1. Page never widens beyond mobile
The whole page (hero, header card, About, Amenities, Rooms, Contact, Owner band) is full-width with `px-4`. On md/lg/xl viewports content stretches across the full window — text lines become 1500px wide, amenities show as a 2-column grid spanning the entire screen, and the cover image is 80px tall relative to a 1440px wide page.

Fix: wrap body sections in a centered container `mx-auto max-w-3xl lg:max-w-5xl`, and bump hero height (`h-56 md:h-80 lg:h-[420px]`).

### 2. Rooms rail uses horizontal scroll on desktop
On desktop, a horizontal-scroll carousel of 224px cards looks broken. There is plenty of width for a grid.

Fix: keep the snap carousel on mobile, switch to `md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3` with full-width room cards on tablet/desktop. Remove the `w-56 shrink-0` constraint inside the grid.

### 3. Discount badge and rating only on first card (visible in screenshot)
Looking at the upload, "Garden Bungalow" shows -20% + star, but "Twin Garden Bungalow" is cut off and missing its discount label space. The cards are clipped because the rail runs off-screen. Two fixes:
- After switching to grid on desktop (#2), all cards render fully.
- On mobile, increase rail card width slightly (`w-60`) and add `pr-4` so the last card is fully visible.

### 4. Amenities grid too sparse on wider screens
2 columns at 1440px = each amenity pill ~700px wide.

Fix: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

### 5. Header price column truncates promo name
`max-w-[110px]` truncation forces "Grand Opening 20% Off" to clip on desktop where there is room.

Fix: lift the cap to `md:max-w-none` and let the column grow on tablet+.

### 6. Sticky bottom CTA is full screen-width on desktop
`fixed bottom-0 left-0 right-0` with only inner `max-w-2xl` means the white bar visually spans the full monitor — looks like an admin toolbar, not a property CTA.

Fix: on `md+`, remove the sticky bar and instead show an inline Check Availability + Share block right under the header card. Keep sticky bar only on `< md` (`md:hidden` on the sticky wrapper, `hidden md:flex` on inline version).

### 7. "Owner tools" band placement
On mobile this sits above the sticky CTA which double-stacks two CTAs. On desktop it appears as a tiny strip. Consolidate into a right-aligned card on `md+` (sidebar style) using a 2-column layout: main content left, owner/contact summary right (`lg:grid lg:grid-cols-[1fr_320px] lg:gap-6`).

### 8. Top nav buttons overlap status bar / cover overlay
The Share button uses `w-4.5 h-4.5` which is not a valid Tailwind size (renders 0). Replace with `w-5 h-5` to match Back.

### 9. Booking sheet centered awkwardly on desktop
`flex items-end justify-center` puts a 28rem sheet at the bottom-center of a wide monitor. Switch to a true centered modal on `md+` (`md:items-center`, `md:rounded-3xl` instead of `rounded-t-3xl`, `md:max-w-lg`).

### 10. Hero gradient eats the cover photo at md+
`bg-gradient-to-t from-background via-background/30` is calibrated for a 224px-tall hero. On a 420px hero it covers half the image. Reduce to `via-background/10 md:via-transparent`.

### 11. Stat row labels look thin on desktop
`Stat` uses `text-sm` value + `text-[10px]` label. On desktop these read as captions. Bump on `md+`: `md:text-lg` value, `md:text-xs` label.

### 12. Page bottom padding wastes space on desktop
`pb-28` reserves room for the sticky CTA. Once sticky is mobile-only, change to `pb-28 md:pb-12`.

## Files to edit

- `src/pages/lodging/HotelResortDetailPage.tsx` — all the responsive container, grid, sticky-CTA, modal, hero, and Stat changes above.

No DB changes, no new components — purely Tailwind class adjustments and a small layout restructure (introducing the `lg:grid-cols-[1fr_320px]` two-column wrapper around the main sections).

## Out of scope
- `LodgingRoomCard.tsx` already has its own responsive internals; we only change how the parent lays it out.
- No changes to the booking flow logic or promotion logic — those are working correctly.
