## Hotel & Resort upgrade — Phase 8

Phase 7 self-noted that 5 sections from earlier phases carry `LodgingQuickJump` but never received `LodgingSectionStatusBanner`. This phase closes that gap so all 28 lodging section files share the full v2026 pattern, then re-runs verification.

### 1. Add `LodgingSectionStatusBanner` to the 5 remaining sections

Insert immediately after the existing `<LodgingQuickJump>`:

- `LodgingConciergeTasksSection.tsx` — `Concierge Tasks`, icon `BellRing`, count `Open + In progress` = `stats.open + stats.inProgress`, fix → `lodge-frontdesk`
- `LodgingHousekeepingSection.tsx` — `Housekeeping`, icon `Sparkles`, count `Open tasks` = tasks where `status !== "completed"`, fix → `lodge-rooms`
- `LodgingInboxSection.tsx` — `Guest Inbox`, icon `MessageSquareText`, count `Unread from guests` = `unreadCount`, fix → `lodge-reservations`
- `LodgingLostFoundSection.tsx` — `Lost & Found`, icon `Search`, count `Items holding` = `stats.holding`, fix → `lodge-frontdesk`
- `LodgingReservationsSection.tsx` — `Reservations`, icon `CalendarRange`, count `Pending change requests` = `pendingRequests.length`, fix → `lodge-frontdesk`

For Housekeeping, the QuickJump sits inside a nested branch — derive `openTaskCount` once at the top of the component (e.g. `tasks.filter(t => t.status !== "completed").length`) and pass to the banner placed right under the QuickJump.

### 2. Verification (mandatory)

1. `tsc --noEmit -p tsconfig.app.json` — must be clean
2. `rg -L "LodgingSectionStatusBanner" src/components/admin/store/lodging/Lodging*Section.tsx` — must return zero results (28/28 covered)
3. `rg -L "LodgingQuickJump" src/components/admin/store/lodging/Lodging*Section.tsx` — must remain zero
4. Supabase smoke check on store `7322b460-2c23-4d3d-bdc5-55a31cc65fab`: count `lodge_concierge_tasks`, `lodge_housekeeping_tasks`, `lodging_messages`, `lodge_lost_found_items`, `lodge_reservation_change_requests` to confirm banners can render real numbers
5. Reload `/admin/stores/7322b460…?tab=lodge-housekeeping` and review preview console logs for new errors

### Files (planned)

Modified (6):
- `src/components/admin/store/lodging/LodgingConciergeTasksSection.tsx`
- `src/components/admin/store/lodging/LodgingHousekeepingSection.tsx`
- `src/components/admin/store/lodging/LodgingInboxSection.tsx`
- `src/components/admin/store/lodging/LodgingLostFoundSection.tsx`
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx`
- `.lovable/plan.md`

No new components. No schema changes. No edge functions. Only the standard `LodgingSectionStatusBanner` import per file.

### Outcome

After Phase 8, the v2026 lodging consistency sweep is fully closed: **28/28 sections** carry both QuickJump and the status banner — no exceptions, no follow-up polish needed.
