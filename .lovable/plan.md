## Auto Repair admin — fixes & upgrades

After auditing every Auto Repair section in `AdminStoreEditPage.tsx` against the live database, I found a clear split: 7 sections are real (already wired to `ar_*` tables), 4 are static demos that look working but do nothing on save, and 2 have a real React warning. Here's the cleanup.

### 1. Sections that are demos / not actually working

These render data and respond to clicks but nothing persists — buttons like "Add Vehicle", "Send to Customer", "Add to Cart" all `toast` and disappear:

| Section | Current state | Fix |
|---|---|---|
| Vehicles | Hard-coded 3 vehicles, "Add Vehicle" button does nothing | Wire to `vehicles` table filtered by `store_id` (or new `ar_customer_vehicles`); add real Add/Edit dialog, list real customers' vehicles |
| Inspections (DVI) | Static 20-point checklist, "Send to Customer" no-op | Wire to `vehicle_inspections` table; persist checklist JSON, link to vehicle, generate shareable customer report URL |
| Auto Check (VIN) | VIN decode works, but lookups don't persist between page loads | Save lookups to a new `ar_vin_lookups` table so history survives reload; show last 20 across sessions |
| Part Shop | 12 hard-coded parts, cart only lives in memory | Add `ar_parts` table (sku/name/brand/category/price_cents/stock); seed with the current 12; persist cart as a draft on `ar_estimates` so "Checkout" creates a real estimate |

### 2. Real bug — `forwardRef` warning in Bookings

Console shows:
```text
Warning: Function components cannot be given refs.
Check the render method of `AdminBookingsTab`. at Dialog
```
This fires every time the Bookings tab opens. It comes from a `<Calendar>` component nested inside `<PopoverContent>` inside a `<Dialog>` — Calendar is a function component and Radix tries to forward a ref through it. Fix by wrapping Calendar usage in a `<div>` (or migrating to `React.forwardRef`-wrapped Calendar shim). Two locations: lines 865 and 941.

### 3. UI polish across the AR sidebar

Matching the screenshot (dense desktop layout, emerald brand, Lucide icons):

- **Sidebar active state** — current emerald text on plain bg looks washed out; add `bg-emerald-500/10` pill background like other admin areas.
- **Section headers** — unify all 14 AR sections to the same `CardHeader` pattern (icon + title left, primary action button right with `gap-1.5`). Estimates/Invoices/Work Orders already follow this; Vehicles, Inspections, Auto Check, Part Shop don't.
- **Empty states** — add real empty states (icon + 1-line label + primary action) instead of blank grids when the store has no records.
- **Loading states** — Estimates/Invoices already use `isLoading` from `useQuery`; add the same skeleton to Reminders, Tires, Warranty, Fleet, Reports.
- **Mobile** — sidebar `StoreOwnerLayout` already has scroll, but on `<768px` the AR section grids should collapse to single column (currently `md:grid-cols-2` is fine; `lg:grid-cols-3` parts grid too narrow → switch to `sm:grid-cols-2 xl:grid-cols-3`).

### 4. Tables to add

Two new migrations:

```sql
-- For Part Shop persistence
create table public.ar_parts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  sku text not null,
  name text not null,
  brand text,
  category text,
  price_cents integer not null default 0,
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: store owner full access; public can read active parts.

-- For VIN history persistence
create table public.ar_vin_lookups (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  vin text not null,
  decoded jsonb not null,
  looked_up_by uuid references auth.users(id),
  created_at timestamptz default now()
);
-- RLS: store owner only.
```

Inspections will use existing `vehicle_inspections` table (already has columns for inspector, vehicle, results jsonb). Vehicles section will use existing `vehicles` table filtered by a new `assigned_store_id` nullable column (one small migration).

### 5. Out of scope (intentionally)

- Carfax / accident-history paid integration (already disclosed in Auto Check banner).
- Online parts ordering from external suppliers.
- Tech timeclock / payroll — separate project.

### Files I'll touch

- `src/components/admin/store/autorepair/AutoRepairVehiclesSection.tsx` — full rewrite, wire to `vehicles`
- `src/components/admin/store/autorepair/AutoRepairInspectionsSection.tsx` — full rewrite, wire to `vehicle_inspections`
- `src/components/admin/store/autorepair/AutoRepairAutoCheckSection.tsx` — add `ar_vin_lookups` persistence
- `src/components/admin/store/autorepair/AutoRepairPartShopSection.tsx` — wire to new `ar_parts`
- `src/components/admin/store/AdminBookingsTab.tsx` — fix Calendar ref warning (lines 865, 941)
- `src/components/admin/StoreOwnerLayout.tsx` — sidebar active-pill polish
- 3 new SQL migrations: `ar_parts`, `ar_vin_lookups`, `vehicles.assigned_store_id`

Approve to proceed.