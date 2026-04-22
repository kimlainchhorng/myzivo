

# Lodging admin polish + booking availability blocking

Four enhancements that build on the booking flow already shipped.

## 1. Reservation Details page (admin)

New route: `/admin/stores/:storeId/lodging/reservations/:reservationId`, opened from `LodgingReservationsSection` row tap.

Sections:
- **Header**: guest name, reservation number (`RES-XXXXXX`), current status badge, source.
- **Stay**: room name + photo, check-in/out dates, nights, adults/children, special requests/notes.
- **Price breakdown**: room nightly rate × nights, weekend uplift, length-of-stay discount, each add-on line (from `addons` JSONB snapshot showing `name · qty × per · subtotal`), grand total, paid amount, balance due.
- **Status panel**: current status + action buttons (Hold → Confirmed → Checked-In → Checked-Out, plus Cancel / No-show). Each transition opens a small inline form requiring an **audit note**, then writes both the new status AND an entry to a new `lodge_reservation_audit` table.
- **Audit log**: chronological list of `{ from_status, to_status, note, actor_id, created_at }`.

## 2. Database — audit trail + cover photo

New migration:

```sql
create table public.lodge_reservation_audit (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references lodge_reservations(id) on delete cascade,
  store_id uuid not null,
  from_status text,
  to_status text not null,
  note text,
  actor_id uuid,
  created_at timestamptz not null default now()
);
alter table lodge_reservation_audit enable row level security;
-- RLS: store owners + admins can select/insert for their store (mirror lodge_reservations policies)

alter table lodge_rooms add column cover_photo_index integer not null default 0;
```

Plus a small `useLodgeReservationAudit(reservationId)` hook (list + insert).

## 3. Cover photo selector in room editor

Update `LodgingRoomPhotoUploader.tsx`:
- Add `coverIndex` + `onCoverChange` props.
- Each thumbnail gets a **"Set as cover"** star button (corner, always visible on the active cover, hover/tap on others). The selected cover shows the existing emerald `Star · Cover` chip.
- Helper text becomes `{count}/{max} photos · tap ★ to set cover`.
- Reordering and removal adjust `coverIndex` correctly (shift down on remove-before-cover, swap on move).

`LodgingRoomsSection.tsx` passes `cover_photo_index`, persists it on save, and the rooms list thumbnail uses `photos[cover_photo_index] ?? photos[0]`.

`StoreProfilePage.tsx` + `LodgingRoomCard.tsx` + reservation details page all read `photos[cover_photo_index ?? 0]` instead of `photos[0]`.

## 4. Public booking — date availability blocking

In `LodgingBookingDrawer.tsx` switch the date inputs in `LodgingStaySelector` to a `Calendar` (shadcn date range, `mode="range"`) inside a `Popover`, so we control which days are selectable.

New hook `useRoomAvailability(roomId, monthsAhead = 6)`:
- Fetches `lodge_room_blocks` for `roomId` (manual blocks with `reason`).
- Fetches `lodge_reservations` for `roomId` with `status in ('hold','confirmed','checked_in','checked_out')`, expands each to per-night dates (excluding the checkout day).
- Returns `Map<dateISO, { unavailable: boolean; reason: 'sold_out' | 'restricted' | 'past' }>` plus a `disabledDates` array for `Calendar`.

Calendar wiring:
- `disabled={[{ before: today }, ...unavailableDates]}` — past dates disabled, plus blocked/booked dates.
- `modifiers` add `unavailable` styling (strike-through + muted) so users see why a date is greyed out.
- Below the date pickers a small legend: `■ Unavailable · ■ Selected · ■ Today`.
- If the user previously selected a range that now contains an unavailable night (e.g. via deep-link URL params), surface a banner: *"One or more nights are no longer available — please pick new dates."* and disable the Continue button until resolved.
- Tooltip / aria-label on each disabled day reads `Sold out` or `Not available` based on reason source.

`LodgingStaySelector.tsx` accepts an optional `disabledDates` + `availabilityMap` prop so the same UX can be reused on `StoreProfilePage`'s sticky bar (only the booking drawer fetches availability per-room; the store-profile selector stays unrestricted because it spans many rooms).

## Files

**Create**
- `src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx`
- `src/hooks/lodging/useLodgeReservationAudit.ts`
- `src/hooks/lodging/useRoomAvailability.ts`
- Supabase migration: `lodge_reservation_audit` table + RLS, `lodge_rooms.cover_photo_index` column

**Edit**
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx` — make rows tappable → details page; keep quick-actions as shortcuts.
- `src/components/lodging/LodgingRoomPhotoUploader.tsx` — cover selector star.
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx` — pass `cover_photo_index` through, list thumb uses cover.
- `src/hooks/lodging/useLodgeRooms.ts` — extend `LodgeRoom` with `cover_photo_index`.
- `src/components/lodging/LodgingRoomCard.tsx` + `src/pages/StoreProfilePage.tsx` — read cover via `photos[cover_photo_index ?? 0]`.
- `src/components/lodging/LodgingStaySelector.tsx` — Calendar range picker with `disabledDates` support.
- `src/components/lodging/LodgingBookingDrawer.tsx` — wire `useRoomAvailability` into the selector + show legend + invalid-range banner.
- `src/App.tsx` (or admin routes file) — register new reservation detail route.

## Out of scope

- Multi-room availability search ("show me all rooms free this weekend") — stays per-room.
- Email/SMS notification on status change — current toasts only.
- Editing past audit notes (append-only log).

