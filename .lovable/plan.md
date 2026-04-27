## Hotel & Resort Admin — Next Upgrade (Phase 2)

Building on Phase 1 (sidebar reorganization + Concierge/Lost & Found tables), this phase adds **revenue intelligence**, **cross-section flow**, and **polishes the new sections** so everything is real-data, connected, and in the right place.

---

### 1. Revenue Pulse on Dashboard (real data)

Add a top-of-dashboard widget on `LodgingOverviewSection` showing live KPIs:
- **Occupancy %** — last 7 / 30 days (from `useLodgeReports`)
- **ADR** (Average Daily Rate)
- **RevPAR** (Revenue per Available Room)
- **Active stays today** + **arrivals today** + **departures today**
- 4 mini stat tiles + sparkline-style bar for last 14 days occupancy

All values computed client-side from existing `reservations` + `rooms` data — no mocks.

### 2. Cross-Section Quick-Jump (workflow connectivity)

Inject a shared `LodgingQuickJump` chip row at the top of the operational sections (Front Desk, Reservations, Housekeeping, Concierge, Lost & Found, Guest Inbox). Lets staff hop side-to-side without going back to the sidebar.

Chips: Front Desk · Reservations · Housekeeping · Concierge · Inbox — current section highlighted.

### 3. Promotions Section Overhaul

Upgrade `LodgingPromotionsSection` from basic table to a real management UI:
- 4 stat tiles: Active · Total Redemptions · Code-based · Expiring soon (next 14d)
- **Filter chips**: All · Early Bird · Last Minute · LOS · Mobile · Member · Code
- **Preset templates** in the editor: "Early Bird 15%", "Last Minute 10%", "Stay 3 Nights Save", "Member-only 20%" — one-click prefill
- Link promo → `rate_plan_id` (optional) so it applies to specific rate plans
- Better empty state with preset gallery

### 4. Concierge Tasks & Lost & Found Polish

- Add **Quick-Jump** chips at top
- Add stat tiles (Open · In progress · Completed today · High priority)
- Add filter chips by status
- Wire "Create from Guest Inbox message" deep-link (passes guest name + room)
- Lost & Found: add photo upload (uses existing `user-stories` bucket pattern), claim-by-date, owner contact

### 5. Photos & Gallery — make it real

Currently `LodgingGallerySection` redirects to property profile. Convert to actual gallery manager:
- Grid of all property photos (cover, room photos, amenity photos) pulled from `lodging_property_profiles` + `lodge_rooms.photos`
- Drag-reorder cover photo
- Bulk caption / alt-text editor
- "Set as cover" / "Hide" toggles

### 6. Sidebar refinements (move things to the right place)

- Move **Hotel Staff** out of "Sales & Growth" into a new **TEAM** section right above Sales (more logical)
- Move **Reports** to be the last item under TEAM/Insights group
- Rename "Reviews & Guest Feedback" → "Guest Reviews" (shorter)
- Add badge count on Guest Inbox (unread), Concierge (open tasks), Lost & Found (unclaimed)

### 7. Software & Apps icon — keep refined

Already updated last turn. No changes needed; just confirm `LayoutDashboard / BellRing / Brush / Navigation / Hotel` mapping is preserved.

---

### Technical notes

**No new tables needed** — everything reuses existing schemas:
- `lodging_promotions` already has `rate_plan_id` link capacity (add column if missing via migration)
- `lodging_concierge_tasks` + `lodging_lost_found` from Phase 1
- `useLodgeReports` already computes occupancy/ADR/RevPAR

**Files to create**
- `src/components/admin/store/lodging/LodgingQuickJump.tsx` — shared chip nav
- `src/components/admin/store/lodging/RevenuePulseCard.tsx` — KPI widget
- `src/components/admin/store/lodging/PromoPresets.ts` — preset templates

**Files to modify**
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx` — mount RevenuePulseCard
- `src/components/admin/store/lodging/LodgingPromotionsSection.tsx` — overhaul UI
- `src/components/admin/store/lodging/LodgingConciergeTasksSection.tsx` — add QuickJump + stats + filters
- `src/components/admin/store/lodging/LodgingLostFoundSection.tsx` — add QuickJump + stats + photo upload
- `src/components/admin/store/lodging/LodgingGallerySection.tsx` — full gallery manager
- `src/components/admin/store/lodging/LodgingFrontDeskSection.tsx` + `LodgingReservationsSection.tsx` + `LodgingHousekeepingSection.tsx` + `LodgingInboxSection.tsx` — mount QuickJump at top
- `src/components/admin/StoreOwnerLayout.tsx` — sidebar regroup + badge counts
- `supabase/migrations/...` — add `rate_plan_id uuid` to `lodging_promotions` if not present, add `photos jsonb` to `lodging_lost_found`

**Real data, no mocks** — all KPI values, filters, and counts read from Supabase via existing hooks. RLS already enforced via `is_store_owner()`.

---

Approve to proceed with implementation in order: (1) shared QuickJump → (2) Revenue Pulse → (3) Promotions overhaul → (4) Concierge/L&F polish → (5) Gallery → (6) Sidebar refinements.
