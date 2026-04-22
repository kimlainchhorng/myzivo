

# Auto-Repair sidebar add-ons — 8 new sections

Add 8 new auto-repair-only entries to the Store Owner sidebar (Manage group), each backed by a real section component, route tab, and Supabase table. Sidebar shows them only when `storeCategory === "auto-repair"`, grouped under a new "Shop Operations" sub-label so the sidebar stays scannable.

## New sidebar items (in order)

| # | Label | Icon | Tab id | Section component |
|---|---|---|---|---|
| 1 | Estimates | FileSignature | `ar-estimates` | `AutoRepairEstimatesSection` |
| 2 | Work Orders | Hammer | `ar-workorders` | `AutoRepairWorkOrdersSection` |
| 3 | Technicians & Bays | HardHat | `ar-techs` | `AutoRepairTechniciansSection` |
| 4 | Reminders & Recalls | BellRing | `ar-reminders` | `AutoRepairRemindersSection` |
| 5 | Tire Inventory | CircleDot | `ar-tires` | `AutoRepairTiresSection` |
| 6 | Warranty & Comebacks | ShieldAlert | `ar-warranty` | `AutoRepairWarrantySection` |
| 7 | Fleet Accounts | Truck | `ar-fleet` | `AutoRepairFleetSection` |
| 8 | Reports | BarChart3 | `ar-reports` | `AutoRepairReportsSection` |

These slot into `StoreOwnerLayout.tsx` after the existing `ar-vehicles` item. A small "SHOP OPS" sub-label is rendered between Vehicles and Estimates to visually group them.

## Section briefs

1. **Estimates** — list/create/send quotes; line items (parts + labor); status (Draft / Sent / Approved / Declined / Expired); **Convert to Work Order** button; PDF preview reuses `AutoRepairDocPreviewDialog`.
2. **Work Orders** — kanban (Awaiting → In Progress → On Hold → QC → Done) with tech assignment, bay, labor hours timer, parts pulled from Part Shop. Click row → drawer with checklist + photos + customer-approval signature pad.
3. **Technicians & Bays** — tech roster (name, certs, hourly rate, productivity %), bay grid (1–N), live "who's working what" view derived from work orders. CRUD on techs and bays.
4. **Reminders & Recalls** — schedule maintenance reminders by mileage/date per vehicle; NHTSA recall lookup by VIN (uses existing NHTSA fetch pattern from `AutoRepairAutoCheckSection`); bulk-send via existing `send-marketing-campaign` edge function (push/SMS/email picker).
5. **Tire Inventory** — separate tire stock (size, brand, model, DOT, load index, season, qty, cost, retail). Quick-add from RO; low-stock alerts; tire-finder by vehicle (year/make/model → recommended sizes).
6. **Warranty & Comebacks** — flag work orders as "comeback"; root-cause notes; warranty period per service; auto-link to original RO; comeback rate KPI on top of section.
7. **Fleet Accounts** — B2B customers with: vehicle roster (multi-VIN), PO numbers, billing terms (Net 15/30/60), monthly statement generator (CSV + PDF), credit limit. Statement uses existing CSV export pattern.
8. **Reports** — date-range KPI strip (revenue, ROs closed, avg ticket, parts margin, labor hours, tech productivity, comeback rate); top services chart; tech leaderboard; CSV export of any panel.

## Database schema (one migration)

```sql
-- Estimates
create table ar_estimates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  customer_id uuid, vehicle_id uuid,
  number text not null, status text not null default 'draft',
  subtotal_cents int not null default 0, tax_cents int not null default 0,
  total_cents int not null default 0, expires_at date,
  notes text, line_items jsonb not null default '[]'::jsonb,
  converted_workorder_id uuid,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Work Orders
create table ar_work_orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, estimate_id uuid,
  customer_id uuid, vehicle_id uuid, technician_id uuid, bay_id uuid,
  number text not null, status text not null default 'awaiting',
  labor_hours numeric(6,2) default 0, started_at timestamptz, completed_at timestamptz,
  checklist jsonb default '[]'::jsonb, photos jsonb default '[]'::jsonb,
  customer_signature_url text, parts_used jsonb default '[]'::jsonb,
  is_comeback boolean default false, parent_workorder_id uuid,
  total_cents int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Technicians & Bays
create table ar_technicians (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, name text not null, email text, phone text,
  certifications text[] default '{}', hourly_rate_cents int default 0,
  active boolean default true, avatar_url text,
  created_at timestamptz default now()
);
create table ar_bays (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, name text not null, lift_type text,
  active boolean default true, sort_order int default 0
);

-- Reminders & Recalls
create table ar_service_reminders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, customer_id uuid, vehicle_id uuid,
  reminder_type text not null, due_at timestamptz, due_mileage int,
  channel text default 'email', status text default 'scheduled',
  sent_at timestamptz, message text,
  created_at timestamptz default now()
);
create table ar_recall_checks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, vehicle_id uuid, vin text not null,
  campaign_id text, summary text, severity text, fetched_at timestamptz default now()
);

-- Tires
create table ar_tires (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, brand text, model text,
  size text not null, load_index text, speed_rating text,
  season text, dot text, qty int default 0,
  cost_cents int default 0, retail_cents int default 0,
  reorder_point int default 4,
  created_at timestamptz default now()
);

-- Warranty
create table ar_warranties (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, workorder_id uuid not null,
  service_name text, period_days int, mileage_limit int,
  starts_at date default current_date, expires_at date,
  notes text
);

-- Fleet
create table ar_fleet_accounts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null, name text not null,
  contact_name text, contact_email text, contact_phone text,
  billing_terms text default 'net_30', credit_limit_cents int default 0,
  po_required boolean default false, active boolean default true,
  created_at timestamptz default now()
);
create table ar_fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  fleet_account_id uuid not null references ar_fleet_accounts(id) on delete cascade,
  vehicle_id uuid, vin text, plate text, label text
);
```

All 9 tables get RLS: store owners (via `restaurants.owner_id = auth.uid()`) and admins (`has_role(auth.uid(), 'admin')`) read/write their own rows. `idx_<table>_store` index on every `store_id`.

## Hooks

One hook file per section in `src/hooks/autorepair/`:
- `useAREstimates.ts`, `useARWorkOrders.ts`, `useARTechnicians.ts`, `useARBays.ts`, `useARReminders.ts`, `useARRecalls.ts`, `useARTires.ts`, `useARWarranties.ts`, `useARFleet.ts`, `useARReports.ts`

Each exposes list / upsert / delete / status mutations with React Query invalidation. Reports hook does aggregations via 2-3 select queries (no SQL functions).

## Files

**New components** (`src/components/admin/store/autorepair/`)
- `AutoRepairEstimatesSection.tsx`
- `AutoRepairWorkOrdersSection.tsx` + `WorkOrderKanban.tsx` + `WorkOrderDrawer.tsx`
- `AutoRepairTechniciansSection.tsx` (techs + bays tabs)
- `AutoRepairRemindersSection.tsx` (reminders + recalls tabs)
- `AutoRepairTiresSection.tsx`
- `AutoRepairWarrantySection.tsx`
- `AutoRepairFleetSection.tsx` + `FleetStatementDialog.tsx`
- `AutoRepairReportsSection.tsx`

**Edited**
- `src/components/admin/StoreOwnerLayout.tsx` — append 8 nav items + sub-label divider
- `src/pages/admin/AdminStoreEditPage.tsx` — register 8 new tab cases + titles + render sections

**Migration**
- `<ts>_autorepair_addons.sql` — 9 tables + RLS + indexes

## Build order

1. Migration: 9 tables + RLS + indexes.
2. Hooks (10 files in `src/hooks/autorepair/`).
3. Sidebar wiring (`StoreOwnerLayout.tsx` + `AdminStoreEditPage.tsx` tab registry + titles).
4. Sections in order: Estimates → Work Orders → Technicians/Bays → Reminders/Recalls → Tires → Warranty → Fleet → Reports.
5. Convert-to-WO action on Estimates row uses `useARWorkOrders.create`.
6. Reminder bulk-send invokes existing `send-marketing-campaign`.
7. Reports CSV reuses `performanceCsvExport.ts`.

## Out of scope (this pass)

- Time-clock integration with techs (will reuse existing `time-clock` later).
- Stripe ACH for fleet statements (manual mark-paid only for now).
- Tire vendor API auto-restock.

