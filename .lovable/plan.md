

# Room Details Modal: carousel, amenities, add-ons, reserve flow polish

Targeted upgrades to `LodgingRoomDetailsModal.tsx` and the small wiring in `LodgingRoomCard.tsx` so the details view matches a real OTA experience.

## 1. Swipeable carousel + keyboard nav + skeletons

Replace the current static-image carousel with a richer one:
- Wrap the gallery in shadcn `Carousel` (Embla) with `opts={{ loop: true }}` for swipe-to-advance on touch and built-in pointer drag on desktop.
- Sync Embla via `setApi` so the existing pagination dots and prev/next buttons stay in sync (and dot taps call `api.scrollTo(i)`).
- Keyboard: when the modal is open, `ArrowLeft` / `ArrowRight` advance slides; `Home` / `End` jump to first/last. Bound on a focusable wrapper with `tabIndex={0}` and `aria-roledescription="carousel"`. Embla's built-in `keyboard` plugin would also fire, but explicit handler ensures it works even when focus is on body.
- Loading skeletons: each `<img>` uses `loading="lazy"` and tracks `loaded[i]` state. Until loaded, render a `Skeleton` overlay with the existing shimmer animation in the same `aspect-[16/10]` slot — no layout shift. On error, fall back to the bed-icon placeholder per slide.
- Counter pill (`{idx + 1} / {total}`) in the top-right corner for orientation.

## 2. All amenities with consistent iconography

- Add a small `AMENITY_ICON_MAP` (record of normalized name → Lucide icon) covering the full canonical set used elsewhere in lodging (Wi-Fi, AC, Pool, Parking, Breakfast, TV, Kitchen, Workspace, Laundry, Gym, Pets, Balcony, Heating, Hot tub, Beach access, Airport shuttle, Smoke detector, etc.). Lookup is case-insensitive and normalizes spaces/underscores.
- Render **all** amenities (no truncation), one row per item: `[icon] [label]` in a 2-column grid on mobile, 3-column on `sm:`. Unknown amenity → fallback `Check` icon (current behavior) so nothing breaks.
- Same map is exported and reused in `LodgingRoomCard`'s amenity preview chip strip so card and modal stay visually consistent.

## 3. Add-ons with proper currency + clear per-X labels

- Replace ad-hoc `formatAddonPrice` with the global `useCurrency()` hook (`format(amountUsd, "USD")`) so prices honor the user's selected display currency just like `PriceDisplay`.
- Per-X label rendered as a separate muted line under the formatted price: `per night`, `per guest`, `per stay` (full words, no slash abbreviation).
- Layout per row: name (medium-bold, 13px) on the left with optional one-line description if present in the `LodgeAddon` shape; on the right a vertical stack: price (bold, currency symbol included) + per-X line (10px muted).
- Empty state stays hidden if no add-ons; otherwise the helper line below becomes "Optional — choose during booking. Prices shown per the property's policy."

## 4. Clean Reserve handoff

- Footer Reserve button calls `onReserve()` first, then `onOpenChange(false)` inside a `requestAnimationFrame` so the parent gets the room id / open command **before** the modal teardown animation, eliminating the brief flash where neither sheet is mounted on mobile.
- `LodgingRoomCard` already passes the active room into `setBookingRoom` via `onReserve`; verify that the same `room` reference is captured (closure) so the booking drawer opens with identical room context. No prop changes needed beyond confirming the handler.
- Add `aria-label="Reserve {name}"` for screen readers and `data-testid="reserve-from-details"` for QA.

## Files

**Edit**
- `src/components/lodging/LodgingRoomDetailsModal.tsx` — carousel via shadcn `Carousel` + Embla api, keyboard handler, per-slide skeleton + error fallback, amenity icon map, currency-aware add-on rows, reserve handoff order.
- `src/components/lodging/LodgingRoomCard.tsx` — import shared `AMENITY_ICON_MAP` for the card's amenity chips so iconography matches the modal.

**No changes needed**
- `LodgingBookingDrawer.tsx`, `StoreProfilePage.tsx` — existing `onReserve` wiring is already correct; just polish the call order inside the modal.

## Out of scope

- Full-screen lightbox / pinch-zoom on photos (carousel inside modal is enough for v1).
- Persisting amenity icon choices in the DB (mapping stays client-side).
- Per-add-on quantity selection inside the details modal (still chosen in the booking drawer).

