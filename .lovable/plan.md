

# Hotels & Resorts: complete the Booking flow + room photo uploads

## What's broken / missing today

1. **Public store profile** for hotels/resorts/guesthouses shows "No products available yet" (image 1). `StoreProfilePage.tsx` only branches on `auto-repair`; lodging falls through to the empty product grid. The `LodgingRoomCard` and `LodgingBookingDrawer` components exist but are never rendered anywhere.
2. **Admin "Add Room" dialog** (image 2 / `LodgingRoomsSection.tsx`) has no photo upload — `photos: []` is hardcoded. Owners can't show what the room actually looks like.
3. **Add-ons** (extra services like breakfast, airport transfer, late checkout) don't exist on rooms or in the booking drawer.
4. **Booking drawer** is a hand-rolled fixed overlay (z-60), no date picker (`checkIn/checkOut` come in as strings from a parent that doesn't exist on the public profile), no add-on selection, no per-night breakdown beyond a flat total.

## What we'll build

### 1. Admin — richer "Add / Edit Room" dialog (`LodgingRoomsSection.tsx`)

- **Photos uploader** (up to 8 per room): drag/drop + tap to pick, thumbnail grid with remove + drag-reorder, first photo = cover. Reuses the existing `store-assets` bucket under path `lodging/{storeId}/rooms/{roomId|new}/{uuid}.{ext}`. Same pattern as `AdminStoresPage` logo/banner upload, with the existing `uploadStoreAsset` helper.
- **Description textarea** (new column `description text`) — short marketing copy shown on the public card detail.
- **Cancellation policy** select: `flexible` / `moderate` / `strict` / `non_refundable` (new column `cancellation_policy text`).
- **Check-in / check-out time** inputs (store-level fallback already exists; per-room override optional — new columns `check_in_time time`, `check_out_time time` nullable).
- **Add-ons editor**: rows of `{ name, price_cents, per: "stay" | "night" | "guest" }`. Stored in new JSONB column `addons jsonb default '[]'`. Examples: "Breakfast +$8/night", "Airport pickup +$25/stay".
- Keep the existing null-safe number inputs from the prior fix.

### 2. Database migration

New columns on `lodge_rooms`:
- `description text`
- `cancellation_policy text default 'flexible'`
- `check_in_time time`, `check_out_time time`
- `addons jsonb not null default '[]'::jsonb`

(Photos already supported via existing `photos jsonb` column — we just start writing to it.)

New column on `lodge_reservations`:
- `addons jsonb not null default '[]'::jsonb` (snapshot of selected add-ons + computed price per booking)

### 3. Public store profile — render rooms for lodging stores (`StoreProfilePage.tsx`)

Add an `isLodging` branch (parallel to the existing `auto-repair` branch) at line ~673:

- Fetch rooms via `useLodgeRooms(store.id)` filtered to `is_active = true`.
- Replace the "All Products" header with **"Rooms & Rates"** + room count.
- Render a vertical stack of `LodgingRoomCard` (already exists) — pass first photo as `imageUrl`.
- Above the list, a **stay selector bar** (sticky-ish): Check-in date, Check-out date, Adults, Children. Defaults: today / +1 day / 2 / 0. Persist in URL params so deep-links work.
- Empty state: "No rooms listed yet" with bed icon (not the package icon).

### 4. Booking flow upgrade (`LodgingBookingDrawer.tsx` → migrated to `ResponsiveModal`)

- **Step 1 — Stay**: date range picker (uses existing `Calendar` from shadcn), guest counters (adults/children), room/units count if multiple.
- **Step 2 — Add-ons**: list of room's `addons` with checkboxes + qty (for per-guest items). Live total updates.
- **Step 3 — Guest info**: name, phone, email, country, special requests (current form, kept). Phone uses `CountryPhoneInput` per project standard.
- **Price breakdown**: rate × nights, weekend rate auto-applied for Fri/Sat nights, weekly/monthly discount auto-applied, add-ons line, **Total** in bold. Sub-line: "Pay at the property unless arranged with host" (preserve current MoR-style disclaimer).
- On submit → insert `lodge_reservations` with `addons` snapshot + `status: 'hold'` (current behavior preserved).
- Use `ResponsiveModal` (bottom sheet on mobile, dialog on desktop) so it matches the rest of the v2026 UI and respects safe-area + keyboard.

### 5. Reuse where possible

- `ResponsiveModal` for the booking sheet.
- `uploadStoreAsset` helper for room photo uploads.
- `useLodgeRooms` already supports the new fields once the migration runs (it does `select *`).
- `LodgingRoomCard` stays as-is (already accepts `imageUrl`, `amenities`, `breakfastIncluded`).

## Files

**Edit**
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx` — add photos uploader, description, cancellation policy, check-in/out times, add-ons editor.
- `src/hooks/lodging/useLodgeRooms.ts` — extend `LodgeRoom` interface with the new fields.
- `src/components/lodging/LodgingBookingDrawer.tsx` — convert to `ResponsiveModal`, add date picker, add-ons step, weekend/discount math, snapshot add-ons on insert.
- `src/components/lodging/LodgingRoomCard.tsx` — show description preview + "X add-ons available" hint when present.
- `src/pages/StoreProfilePage.tsx` — render lodging rooms branch with stay selector + booking drawer wiring.

**Create**
- `src/components/lodging/LodgingStaySelector.tsx` — date range + guests bar used on store profile.
- `src/components/lodging/LodgingRoomPhotoUploader.tsx` — thumbnail grid + add/remove/reorder.
- Supabase migration: add columns above to `lodge_rooms` and `lodge_reservations`.

## Out of scope

- Real-time availability calendar blocking on the public side (already exists in admin via `LodgingCalendarSection`; integrating with the booking drawer to grey out sold-out dates is a follow-up).
- Card payments / Stripe for hotels (current model is "request booking, pay at property").
- Multi-room cart (one room per booking request for now).

