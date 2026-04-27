## Hotel & Resort upgrade — Phase 4

Phase 4 closes the remaining real-data gaps from Phase 3, ships the deferred Lost & Found photo uploader, adds two operational power-tools (walk-in booking + arrivals search), and runs an end-to-end verification pass.

### 1. Lost & Found photo uploader (deferred from Phase 3)
Replace the plain "Photo URL" text input in `LodgingLostFoundSection.tsx` with a real uploader using the existing `user-stories` Supabase Storage bucket (same pattern as Gallery/Stories).
- Drag-drop + click-to-upload, JPG/PNG/HEIC, 8 MB cap.
- Shows live preview, "Replace" and "Remove" controls.
- Stores public URL into `lodging_lost_found.photo_url`.
- Renders the photo as a thumbnail in the catalog table (new "Photo" column, 40×40 rounded).

### 2. Front Desk power tools
- **Walk-in booking dialog** wired to the existing `lodge-set-tab` event currently labeled "Walk-in booking" — today it just jumps to Reservations. Replace with a real inline walk-in sheet that creates a `lodge_reservations` row with status `checked_in`, today as check_in, tomorrow as check_out, captures guest name, room, adults/children, and rate. Optimistically refreshes the board.
- **Search bar** above the 3-column board to filter Arrivals/In-house/Departures by guest name or room number.
- **Quick rebook** button on each Departures card → pre-fills a new reservation for the same guest +1 night.

### 3. Inbox → Concierge task: confirmation + link-back
Phase 3 added the bridge but with no feedback. Add:
- Toast confirmation `"Concierge task created"` with an "Open task" action that jumps to `lodge-concierge` and highlights the new row for 2 s.
- Store the source `message_id` on the concierge task (new nullable column `source_message_id uuid`) so the task card shows "From inbox message".

### 4. Sidebar badges — realtime refresh
`useLodgingSidebarBadges` currently caches 5 min. Subscribe to Supabase Realtime on `lodging_messages`, `lodging_concierge_tasks`, `lodging_lost_found`, and `lodge_reservations` (filtered by `store_id`) and invalidate the badge query on insert/update so counts move live without a manual refresh.

### 5. Promotions — real redemption counts
The Phase 2 stat tiles use placeholder `redemptions` from `lodging_promotions.redemption_count`. Replace with a live aggregate from `lodge_reservations` joined on `promotion_code`, computed in a single `rpc` or grouped `select` so multiple promos resolve in one round-trip.

### 6. Cross-section consistency sweep
Audit every lodging section for these required pieces and fix any miss:
- `LodgingQuickJump active="…"` at the top
- Real `useLodgingCatalog` (or specific hook) — no mock arrays
- Empty state via `LodgingNeedsSetupEmptyState` with both primary + secondary actions
- `LodgingSectionStatusBanner` summarizing live counts
- Sections to re-check explicitly: Channel Manager, Wellness, Dining, Experiences, Transport, Staff, Amenities — these have not been touched since Phase 1.

### 7. Verification (mandatory after build)
Run in order:
1. `tsc --noEmit` — must be clean.
2. Open `/admin/lodging/qa-checklist` for a real store ID and capture pass/fail/warning counts in the response.
3. Run the existing Playwright spec `tests/e2e/lodging-deeplinks.spec.ts`.
4. Spot-check live data with `supabase--read_query` for a real store: confirm uploaded Lost & Found `photo_url` resolves, walk-in reservation appears in the board, and a created concierge task carries `source_message_id`.

Report results inline in the build summary, with explicit pass/fail per item. If any verification fails, fix and re-run before declaring complete.

### Files (planned)
- New SQL migration: `lodging_concierge_tasks.source_message_id` (nullable uuid + index)
- Modified: `LodgingLostFoundSection.tsx`, `LodgingFrontDeskSection.tsx`, `LodgingInboxSection.tsx`, `LodgingPromotionsSection.tsx`, `useLodgingSidebarBadges.ts`
- New: `src/components/admin/store/lodging/WalkInBookingSheet.tsx`, `src/components/admin/store/lodging/LostFoundPhotoUploader.tsx`
- Touch-ups (consistency sweep): up to 7 lodging section files

Awaiting approval to implement.