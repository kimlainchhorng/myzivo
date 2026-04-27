# Hotel & Resort Admin — Next-Level Upgrade

You asked to "complete update" the Hotel admin: fix where things sit in the sidebar, connect workflows side-by-side, make sure data is real (not mock), add more add-ons, and rename / reorder things that are in the wrong place.

After auditing every Lodging section, **all 25 sections are already real Supabase-backed** (Promotions, Channel Manager, Reports, Reviews, Add-ons, Experiences, Transport, Wellness, Dining, etc. all use `useLodgingCatalog` / `useLodgeReports` / `useLodgeRooms` etc.). So this plan focuses on **structure, flow, naming, polish, and 4 net-new modules** rather than re-replacing real with real.

---

## 1. Sidebar reorganization & renames

Current order mixes operations, sales, and property setup awkwardly. New grouping in `StoreOwnerLayout.tsx`:

```text
MANAGE
  Hotel Admin (setup progress chip)
  Profile
  Orders
  Payment & Payouts

HOTEL OPERATIONS                ← daily running
  Front Desk          (was buried below)
  Reservations
  Calendar & Availability
  Rooms & Rates
  Rate Plans & Availability
  Guests
  Housekeeping
  Maintenance

GUEST SERVICES                  ← what guests see / request
  Guest Inbox
  Guest Requests
  Add-ons & Packages
  Dining & Meal Plans
  Experiences & Tours
  Transport & Transfers
  Spa & Wellness
  Concierge Tasks      ← NEW
  Lost & Found         ← NEW

PROPERTY                        ← setup / identity (NEW group)
  Property Profile
  Amenities & Policies
  Policies & Rules
  Photos & Gallery     ← NEW (delegates to Property Profile media)

SALES & GROWTH
  Promotions & Discounts
  Channel Manager
  Reviews & Guest Feedback
  Marketing & Ads
  Live Stream
  Reports
  Customers

TEAM
  Hotel Staff
  Employees (collapsible: Payroll / Schedule / Time Clock / Attendance / Training / Documents / Rules)

(Footer)
  Settings
  Software & Apps
  Back to App
  Sign Out
```

Renames: **"Hotel Operations" entry → "Dashboard"** (it's the overview, not a duplicate header). Move **Front Desk to the top of operations** (it's the most-used screen).

## 2. Polish the Promotions screen (the one you screenshotted)

Right now the page has 3 stat tiles, a small empty card, and a flat add button. Upgrade to v2026 high-density layout:

- 4 stat tiles instead of 3: Active / Total redemptions / Code-based / **Revenue impact (from `lodging_promotions.redemptions_used × avg discount`)**
- Filter chips above the table: **All · Code · Early bird · Last minute · Length of stay · Member · Mobile**
- Quick-create presets row ("Early-bird 15%", "Last-minute 10%", "3+ nights free breakfast") that pre-fill the editor
- Add a **"Pair with rate plan"** select inside the editor → writes `rate_plan_id` so promos auto-attach
- Show inline performance bar per row (used / total)

## 3. Cross-section workflow connectors ("side-to-side")

Add a small `LodgingQuickJump` strip at the top of every operations section: 5 contextual chips that route to the next logical step (Front Desk → Today's arrivals → Housekeeping board → Guest Inbox → Reservations). Implemented once in `LodgingOperationsShared.tsx`, consumed by every section so flow is consistent.

## 4. Four new add-on modules (real, Supabase-backed)

| Module | Sidebar slot | Purpose |
|---|---|---|
| **Concierge Tasks** | Guest Services | Track guest-side requests beyond rooms (book taxi, restaurant reservation, gift). Table: `lodging_concierge_tasks`. |
| **Lost & Found** | Guest Services | Log items, owner contact, status (found / claimed / shipped). Table: `lodging_lost_found`. |
| **Photos & Gallery** | Property | Centralized media manager that re-uses property profile media bucket — drag-reorder, mark hero, alt text. |
| **Revenue Pulse** widget | Dashboard | Top of `LodgingOverviewSection`: today's arrivals, occupancy, ADR, RevPAR, unpaid balances — pulled from existing `useLodgeReports` (no new tables). |

New tables `lodging_concierge_tasks` and `lodging_lost_found` follow the same pattern as `lodging_experiences` (store_id, RLS by store ownership, soft-delete `active`).

## 5. Real-data audit + safety pass

- Verify every section's empty states route to a real "create" action (not a dead text block) — fix any that don't via `LodgingNeedsSetupEmptyState`.
- Add `useHostLodgingOpsToasts` (already exists) wiring to **all** lodging sections — currently only some pages mount it.
- Confirm RLS on the 2 new tables (owner can CRUD own store; staff with `lodging_staff` membership can read).

## 6. Icon corrections

- Dashboard: `LayoutDashboard` (currently uses `Hotel`, conflicts with "Hotel Admin" chip)
- Front Desk: `KeyRound` ✓ keep
- Concierge Tasks: `BellRing`
- Lost & Found: `Search`
- Photos & Gallery: `Images`
- Revenue Pulse: `TrendingUp`

---

## Technical notes

**Files touched**
- `src/components/admin/StoreOwnerLayout.tsx` — reorder `navItems`, rename, new icons
- `src/lib/admin/storeTabRouting.ts` — add `lodge-concierge`, `lodge-lostfound`, `lodge-gallery`
- `src/pages/admin/AdminStoreEditPage.tsx` — 3 new `<TabsContent>` blocks, title map entries
- `src/components/admin/store/lodging/LodgingPromotionsSection.tsx` — 4-tile stats, filter chips, presets, performance bar, rate-plan link
- `src/components/admin/store/lodging/LodgingOperationsShared.tsx` — add `LodgingQuickJump` strip
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx` — Revenue Pulse header
- New: `LodgingConciergeTasksSection.tsx`, `LodgingLostFoundSection.tsx`, `LodgingGallerySection.tsx`
- Migration: 2 new tables + RLS policies

**No mock data** — all new modules read/write Supabase from day one via the existing `useLodgingCatalog` hook pattern.

**Nothing removed.** Every existing tab keeps working; this is purely additive + reordering.

---

Approve and I'll implement in this order: (1) sidebar reorder + renames + icons, (2) Promotions polish, (3) QuickJump strip, (4) DB migration + 3 new sections, (5) Revenue Pulse on Dashboard.
