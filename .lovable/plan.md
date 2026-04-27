## Hotel & Resort upgrade — Phase 8 (complete) — sweep closed

### Done

Added `LodgingSectionStatusBanner` to the final 5 sections that previously had QuickJump but no banner:

- `LodgingConciergeTasksSection` — Open + In progress count, fix → Front Desk
- `LodgingHousekeepingSection` — Open tasks (`status !== "completed"`), fix → Rooms
- `LodgingInboxSection` — Unread guest messages (`unreadCount`), fix → Reservations
- `LodgingLostFoundSection` — Items holding (`stats.holding`), fix → Front Desk
- `LodgingReservationsSection` — Pending change requests (`pendingRequests.length`), fix → Front Desk

### Verification

- `tsc --noEmit -p tsconfig.app.json` → clean
- `rg -L "LodgingQuickJump"` → 0 missing
- `rg -L "LodgingSectionStatusBanner"` → 0 missing
- **28/28 lodging section files** now carry both components
- Supabase smoke check on store `7322b460-2c23-4d3d-bdc5-55a31cc65fab`:
  - `lodging_concierge_tasks`: 0
  - `lodging_lost_found`: 0
  - `lodge_reservation_change_requests`: 0
  → Queries resolve; banners render `0` cleanly when empty.

### Status

The v2026 lodging consistency sweep is **fully closed across 8 phases**. Every lodging admin section now ships with the same QuickJump rail (13 destinations) and a status banner with a section-specific live KPI + cross-section "fix" CTA. No remaining polish items.

### Files modified (6)

- `src/components/admin/store/lodging/LodgingConciergeTasksSection.tsx`
- `src/components/admin/store/lodging/LodgingHousekeepingSection.tsx`
- `src/components/admin/store/lodging/LodgingInboxSection.tsx`
- `src/components/admin/store/lodging/LodgingLostFoundSection.tsx`
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx`
- `.lovable/plan.md`
