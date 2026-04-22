

# Hotels & Resorts — full add-on pack

Make hotel/resort/guesthouse stores behave like a real lodging business across the customer profile **and** the owner admin: hide grocery delivery UI, open hours go up to 24h, "Products" becomes "Rooms & Bookings", and add 8 hotel-only sidebar sections under a new **HOTEL OPS** group (mirroring the auto-repair pattern).

---

## 1. Hide delivery & "products" wording for hotels (existing pages)

**Customer profile** (`src/pages/StoreProfilePage.tsx`)
- Treat `hotel`, `resort`, `guesthouse` as `isLodging`.
- Hide the `30m delivery` badge on the header (currently only hidden for `auto-repair`).
- Section header: "All Products" → **"Rooms & Suites"**, items label → "rooms".
- Empty state copy: "No products available" → **"No rooms published yet — check back soon"**, with a primary "Check Availability" button that scrolls to the new booking widget (step 3).
- Floating cart label: "View Cart" → **"View Booking"** for lodging (already done for auto-repair).

**Admin store form** (`src/pages/admin/AdminStoresPage.tsx`)
- Extend `FOOD_CATEGORIES` check → only show **Delivery Time** field for food stores (already correct), leave hotels without it.
- Operating Hours: add "Open 24 hours" toggle per day. When on, store `open: "12:00 AM"`, `close: "11:30 PM"`, `is24h: true`. Renderer (`StoreProfilePage`) shows **"Open 24 hours"** for those days. Useful for hotels and gas stations.

**Owner admin** (`src/pages/admin/AdminStoreEditPage.tsx`)
- "Products" tab title for lodging → **"Rooms"**, "Add Product" → **"Add Room"**, empty state → **"No rooms yet" / "Add First Room"**.
- Pass `isLodging` flag through `StoreOwnerLayout` (alongside the current `isAutoRepair`).

---

## 2. Sidebar — new HOTEL OPS group

`src/components/admin/StoreOwnerLayout.tsx`: add `isLodging = ["hotel","resort","guesthouse"].includes(storeCategory)` and render after the regular nav (mirroring `_ar_shop_ops_label`):

| # | Label | Icon | Tab id | Section |
|---|---|---|---|---|
| – | HOTEL OPS (divider) | BedDouble | `_lodging_ops_label` | — |
| 1 | Rooms & Rates | BedDouble | `lodge-rooms` | `LodgingRoomsSection` |
| 2 | Reservations | CalendarRange | `lodge-reservations` | `LodgingReservationsSection` |
| 3 | Calendar & Availability | CalendarDays | `lodge-calendar` | `LodgingCalendarSection` |
| 4 | Guests | Users | `lodge-guests` | `LodgingGuestsSection` |
| 5 | Front Desk (Check-in/out) | KeyRound | `lodge-frontdesk` | `LodgingFrontDeskSection` |
| 6 | Housekeeping | Sparkles | `lodge-housekeeping` | `LodgingHousekeepingSection` |
| 7 | Amenities & Policies | Hotel | `lodge-amenities` | `LodgingAmenitiesSection` |
| 8 | Reports | BarChart3 | `lodge-reports` | `LodgingReportsSection` |

Productions/Payment labels for lodging: `Products` → **Rooms**, `Payment` → **Reservations** (so the existing Payment tab becomes the booking-payouts view; reservations sidebar item is the new operational board).

---

## 3. Section briefs (all 8)

1. **Rooms & Rates** — list/CRUD room types: name, type (Standard/Deluxe/Suite/Villa), beds, max guests, sqft/m², base nightly rate (USD + KHR), weekend rate, weekly/monthly discount %, breakfast included toggle, photos (multi), amenities chips, total physical units. Card layout matches Estimates list.
2. **Reservations** — list view of all bookings with status filter (Hold / Confirmed / Checked-In / Checked-Out / Cancelled / No-Show), guest name/phone, room type, check-in/out, nights, total, payment status. Action cluster: Confirm, Check-In, Cancel, Send invoice. Click → drawer with full reservation details + add charges.
3. **Calendar & Availability** — month grid per room type showing booked/blocked nights. Click a date to **block** (maintenance/owner-stay) or set a price override for that date (peak/holiday). Drag-select range.
4. **Guests** — guest CRM: name, phone, email, ID/passport, country, total stays, lifetime spend, last visit, notes, VIP flag. Click → guest history list.
5. **Front Desk (Check-in/out)** — today board: arrivals (left), in-house (middle), departures (right). Buttons: capture ID photo, assign room number, take key deposit, sign signature, mark checked-in/out. Live count badges.
6. **Housekeeping** — per-room status (Clean / Dirty / In Progress / Inspected / Out of Service), assignee (uses existing `employees`), notes, last cleaned timestamp, auto-flip to Dirty on check-out.
7. **Amenities & Policies** — toggles for hotel amenities (Wi-Fi, Pool, Gym, Spa, Restaurant, Bar, Parking, Airport shuttle, Pet-friendly, Family rooms, AC, Breakfast, Laundry, Concierge…) + free-text policies: Check-in time, Check-out time, Cancellation policy, Children policy, Pet policy, Smoking policy, Extra-bed fee. These flow back to the public profile.
8. **Reports** — date-range KPI strip: Occupancy %, ADR (avg daily rate), RevPAR, total revenue, nights sold, avg LOS, top room type, top source. Tables per room type + per channel. CSV export.

---

## 4. Database migration (1 file, 7 tables)

```sql
create table lodge_rooms (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  name text not null, room_type text, beds text, max_guests int default 2,
  size_sqm numeric, units_total int default 1,
  base_rate_cents int default 0, weekend_rate_cents int default 0,
  weekly_discount_pct numeric default 0, monthly_discount_pct numeric default 0,
  breakfast_included boolean default false,
  amenities text[] default '{}',
  photos jsonb default '[]'::jsonb, sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table lodge_reservations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, room_id uuid, guest_id uuid,
  number text not null,
  guest_name text, guest_phone text, guest_email text, guest_country text,
  adults int default 1, children int default 0,
  check_in date not null, check_out date not null, nights int generated always as ((check_out - check_in)) stored,
  room_number text, status text not null default 'confirmed',
  source text default 'direct', -- direct/booking.com/agoda/airbnb/walk-in
  rate_cents int default 0, extras_cents int default 0, tax_cents int default 0, total_cents int default 0,
  paid_cents int default 0, payment_status text default 'unpaid',
  notes text, signature_url text, id_photo_url text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table lodge_room_blocks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, room_id uuid not null,
  block_date date not null, reason text default 'maintenance',
  rate_override_cents int, created_at timestamptz default now(),
  unique(room_id, block_date)
);

create table lodge_guests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, name text not null,
  phone text, email text, country text, id_number text,
  vip boolean default false, notes text,
  total_stays int default 0, lifetime_spend_cents int default 0, last_visit date,
  created_at timestamptz default now()
);

create table lodge_housekeeping (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, room_id uuid not null,
  room_number text, status text not null default 'clean',
  assignee_id uuid, notes text, last_cleaned_at timestamptz,
  updated_at timestamptz default now()
);

create table lodge_amenities (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique,
  amenities jsonb default '{}'::jsonb,           -- { wifi: true, pool: true, ... }
  policies jsonb default '{}'::jsonb,            -- { check_in: "14:00", cancellation: "...", ... }
  updated_at timestamptz default now()
);

create table lodge_reservation_charges (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, reservation_id uuid not null,
  label text not null, amount_cents int not null,
  created_at timestamptz default now()
);
```

Indexes on every `store_id`, plus `idx_lodge_reservations_dates (store_id, check_in, check_out)` and `idx_lodge_blocks_room_date (room_id, block_date)`.
RLS: store owners (via `store_profiles.owner_id = auth.uid()`) and admins read/write their store rows; public has no access. `updated_at` triggers on the four mutable tables.

---

## 5. Hooks (one file each, `src/hooks/lodging/`)

- `useLodgeRooms.ts`, `useLodgeReservations.ts`, `useLodgeBlocks.ts`, `useLodgeGuests.ts`, `useLodgeHousekeeping.ts`, `useLodgeAmenities.ts`, `useLodgeReports.ts`.
- Each: list / upsert / delete / status mutations with React-Query invalidation.
- `useLodgeReports` does 3 select queries to compute occupancy / ADR / RevPAR client-side.

---

## 6. Public profile additions (`StoreProfilePage`)

For lodging only:
- New **"Check Availability"** widget under hero card: check-in / check-out date pickers, guests stepper, "Search Rooms" button → filters the rooms list below by available units (queries `lodge_reservations` overlap + `lodge_room_blocks`).
- Each room card shows: photo, name, beds, max guests, amenities chips, base rate + "/night", **"Reserve"** button → opens existing `GroceryCheckoutDrawer` adapted as **`LodgingBookingDrawer`** (new file) collecting guest name/phone/email/notes and writing to `lodge_reservations` (status `hold`).
- Hide the grocery cart and 30m delivery badge entirely.
- Show amenities chips and policies block (pulled from `lodge_amenities`).

---

## 7. Files

**New components** (`src/components/admin/store/lodging/`)
- `LodgingRoomsSection.tsx`
- `LodgingReservationsSection.tsx` + `ReservationDrawer.tsx`
- `LodgingCalendarSection.tsx`
- `LodgingGuestsSection.tsx`
- `LodgingFrontDeskSection.tsx`
- `LodgingHousekeepingSection.tsx`
- `LodgingAmenitiesSection.tsx`
- `LodgingReportsSection.tsx`

**New customer-facing**
- `src/components/lodging/LodgingAvailabilityWidget.tsx`
- `src/components/lodging/LodgingBookingDrawer.tsx`
- `src/components/lodging/LodgingRoomCard.tsx`

**Edited**
- `src/components/admin/StoreOwnerLayout.tsx` — `isLodging` group + 8 nav items + divider.
- `src/pages/admin/AdminStoreEditPage.tsx` — register 8 new tab cases + render sections + lodging-aware "Rooms" labels.
- `src/pages/admin/AdminStoresPage.tsx` — "Open 24h" toggle per day in Operating Hours.
- `src/pages/StoreProfilePage.tsx` — `isLodging` branch: hide delivery, swap copy, render availability widget + room cards instead of products grid.

**Migration**
- `<ts>_lodging_addons.sql` — 7 tables + RLS + indexes + triggers.

---

## Build order

1. Migration (7 tables + RLS + indexes + triggers).
2. Hooks (7 files in `src/hooks/lodging/`).
3. Sidebar wiring (`StoreOwnerLayout` + `AdminStoreEditPage` tab registry + lodging labels).
4. Sections in order: Rooms → Amenities → Reservations → Calendar → Front Desk → Housekeeping → Guests → Reports.
5. "Open 24h" toggle in `AdminStoresPage` Operating Hours + renderer in `StoreProfilePage`.
6. `StoreProfilePage` lodging branch: hide delivery badge, swap copy, mount Availability Widget + Room Cards + Booking Drawer.

## Out of scope (this pass)

- OTA channel-manager sync (Booking.com/Agoda/Airbnb) — only manual `source` tag for now.
- Online card payments for room deposits — uses existing payment_types (cash/ABA/card link).
- Multi-property groups (parent hotel chains).

