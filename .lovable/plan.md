

# Wire HOTEL OPS tabs + add 24h toggle + lodging profile + new Maintenance Work Orders section

Three things in one pass: (1) wire all 8 hotel sections so clicking them actually shows content, (2) add the "Open 24 hours" toggle to Operating Hours, (3) flip `StoreProfilePage` into lodging mode, plus (4) add a new **Maintenance** section to HOTEL OPS for hotel-side repair tickets.

---

## 1. Register HOTEL OPS tabs in `AdminStoreEditPage.tsx`

**Imports** — add the 8 lodging section components + new Maintenance one.

**Title map** — extend `autoRepairTitles` pattern with a `lodgingTitles` map and merge into `storeOwnerTitle`:
```
lodge-rooms → Rooms & Rates
lodge-reservations → Reservations
lodge-calendar → Calendar & Availability
lodge-guests → Guests
lodge-frontdesk → Front Desk
lodge-housekeeping → Housekeeping
lodge-maintenance → Maintenance
lodge-amenities → Amenities & Policies
lodge-reports → Reports & Analytics
```

**Tab content blocks** — add after the `auto-repair` block:
```tsx
{["hotel","resort","guesthouse"].includes(form.category) && (
  <>
    <TabsContent value="lodge-rooms"><LodgingRoomsSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-reservations"><LodgingReservationsSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-calendar"><LodgingCalendarSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-guests"><LodgingGuestsSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-frontdesk"><LodgingFrontDeskSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-housekeeping"><LodgingHousekeepingSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-maintenance"><LodgingMaintenanceSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-amenities"><LodgingAmenitiesSection storeId={storeId!} /></TabsContent>
    <TabsContent value="lodge-reports"><LodgingReportsSection storeId={storeId!} /></TabsContent>
  </>
)}
```

**Products tab gating** — guard the Add-Product dialog so lodging shows the Room form (re-use existing fields: name, description, base price, photos) with relabeled buttons ("Add Room" / "Edit Room") — already partially handled by `productsLabel`; finalize by treating `isLodging` like `auto-repair` to skip car-dealership-specific blocks.

---

## 2. New **Maintenance** section (the "work work" item)

Hotel-side repair tickets distinct from housekeeping cleaning.

**Sidebar** — insert after Housekeeping in `StoreOwnerLayout.tsx`:
```ts
{ id: "lodge-maintenance", label: "Maintenance", icon: Wrench }
```

**DB migration** — one table:
```sql
create table lodge_maintenance (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  room_id uuid, room_number text,
  title text not null,                 -- "AC not cooling", "Leaking faucet"
  category text default 'general',     -- plumbing/electrical/hvac/furniture/general
  priority text default 'normal',      -- low/normal/high/urgent
  status text not null default 'open', -- open/in_progress/blocked/done
  assignee_id uuid, assignee_name text,
  reported_by text, notes text,
  photos jsonb default '[]'::jsonb,
  cost_cents int default 0,
  reported_at timestamptz default now(),
  resolved_at timestamptz,
  updated_at timestamptz default now()
);
```
RLS: store owners + admins read/write own rows. `idx_lodge_maintenance_store (store_id, status)`. `updated_at` trigger.

**Hook** — `src/hooks/lodging/useLodgeMaintenance.ts` with list/upsert/delete/setStatus.

**Component** — `src/components/admin/store/lodging/LodgingMaintenanceSection.tsx`:
- Top KPI strip: Open / In Progress / Done this week / Avg time-to-resolve.
- Filter chips by status + priority.
- "New Ticket" dialog (title, room dropdown, category, priority, notes, photos).
- List rows with priority badge color, room#, age, status dropdown, assignee select (from `employees`), "Mark Done" button (sets `resolved_at = now()`).
- Auto-suggest creating a ticket when housekeeping flips a room to `out_of_service` (small "Open ticket?" prompt).

---

## 3. "Open 24 hours" toggle in Operating Hours

`AdminStoresPage.tsx` — extend each day row in the Operating Hours grid:
- Add a small `24h` toggle (switch + label) to the right of the open/close selects.
- When on: store `{ open:"12:00 AM", close:"11:30 PM", closed:false, is24h:true }` and hide the time selects, render "Open 24 hours" text instead.
- `parseSchedule` already preserves unknown keys via JSON.

`StoreProfilePage.tsx` hours renderer — when `day.is24h` is true, show **"Open 24 hours"** badge instead of the time range.

---

## 4. Lodging branch in `StoreProfilePage.tsx`

- `const isLodging = ["hotel","resort","guesthouse"].includes(store.category)`.
- Hide the `30m delivery` badge when `isLodging` (extend the existing `!= "auto-repair"` guard).
- Section header for lodging: **"Rooms & Suites"** (label) / "rooms" (count noun).
- Above the rooms grid, mount `<LodgingAvailabilityWidget storeId={store.id}/>` (already built) — passes selected dates + guests down to the rooms list which renders `<LodgingRoomCard>` cards (already built) with a "Reserve" button opening `<LodgingBookingDrawer>` (already built).
- Floating cart label: "View Booking" when `isLodging` (extend the existing auto-repair branch).
- Skip the grocery cart logic entirely when `isLodging` (gate the `cart.*` add-to-cart code paths).

---

## Files

**New**
- `src/hooks/lodging/useLodgeMaintenance.ts`
- `src/components/admin/store/lodging/LodgingMaintenanceSection.tsx`
- Migration: `<ts>_lodge_maintenance.sql`

**Edited**
- `src/pages/admin/AdminStoreEditPage.tsx` — imports, `lodgingTitles` map, 9 `<TabsContent>` blocks, lodging-aware product dialog labels.
- `src/components/admin/StoreOwnerLayout.tsx` — add Maintenance nav item between Housekeeping and Amenities.
- `src/pages/admin/AdminStoresPage.tsx` — `24h` toggle per day in Operating Hours.
- `src/pages/StoreProfilePage.tsx` — `isLodging` branch (hide delivery, swap copy, mount Availability + Booking, "Open 24 hours" hours rendering).

## Build order

1. Migration (`lodge_maintenance` + RLS + index + trigger).
2. `useLodgeMaintenance.ts` hook.
3. `LodgingMaintenanceSection.tsx` component.
4. Wire all 9 lodging `<TabsContent>` blocks + titles in `AdminStoreEditPage.tsx`.
5. Add Maintenance entry in `StoreOwnerLayout.tsx` sidebar.
6. "Open 24 hours" toggle + renderer.
7. `StoreProfilePage` lodging branch.

