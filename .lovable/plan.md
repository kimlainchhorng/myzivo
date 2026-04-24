
Plan to finish the Front Desk completion experience with shared empty states, real-time stats, PDF export, and verification page

1. Add a shared “Needs setup” empty-state component
   - Create a reusable lodging component:
     - `src/components/admin/store/lodging/LodgingNeedsSetupEmptyState.tsx`
   - It will provide one consistent finished look for blank lodging screens:
     - Status badge: “Section installed”
     - Title
     - Explanation text
     - “No live records yet” / “Ready for hotel data” language
     - Primary action button
     - Secondary action button
     - Optional QA/report action
     - Optional “Next best action” banner
   - Use existing project styling:
     - Compact high-density layout
     - Lucide icons only
     - Emerald/primary accents
     - Rounded bordered cards
   - It will route by dispatching the existing `lodge-set-tab` event, so buttons open exact lodging tabs without a page reload.

2. Reuse the shared empty state across lodging blank screens
   - Replace duplicated dashed empty panels in priority lodging sections with the shared component:
     - `LodgingFrontDeskSection.tsx`
     - `LodgingReservationsSection.tsx`
     - `LodgingCalendarSection.tsx`
     - `LodgingGuestRequestsSection.tsx`
     - `LodgingGuestsSection.tsx`
     - `LodgingReportsSection.tsx`
     - Any other lodging section still using a plain blank/dashed empty state
   - Each empty screen will show:
     - What is installed
     - Why the area is empty
     - What setup action to take next
     - Direct primary/secondary navigation buttons

3. Add “Next best action” banners inside empty Front Desk columns
   - Update `src/components/admin/store/lodging/LodgingFrontDeskSection.tsx`.
   - Each empty Front Desk state will include a clear action banner:
     - No arrivals today:
       - Primary: `Create / review reservations` → `lodge-reservations`
       - Secondary: `Open rooms` → `lodge-rooms`
     - No in-house guests:
       - Primary: `Review reservations` → `lodge-reservations`
       - Secondary: `Open rate plans` → `lodge-rate-plans`
     - No departures today:
       - Primary: `Review departures` → `lodge-reservations`
       - Secondary: `Open guest requests` → `lodge-guest-requests`
   - Add contextual setup guidance when underlying setup is missing:
     - No rooms → route to `lodge-rooms`
     - No rate plans / rates → route to `lodge-rate-plans`
     - No reservations → route to `lodge-reservations`
     - No guest requests → route to `lodge-guest-requests`

4. Connect Front Desk live stats to backend events
   - Update the Front Desk to use real-time invalidation for:
     - `lodge_reservations`
     - `lodge_reservation_change_requests`
   - Reuse the existing Supabase realtime pattern already present in `useHostLodgingOpsToasts`.
   - Add or extend a hook so Front Desk stats update automatically without refresh:
     - Reservations inserted/updated/deleted update:
       - Arrivals
       - In-house
       - Departures
       - Active reservations
     - Change requests inserted/updated/deleted update:
       - Guest requests
   - Keep React Query as the source of truth:
     - Realtime event invalidates the relevant query keys
     - Existing hooks refetch current data safely
   - No new database tables are required.

5. Add guest request count to Front Desk stats
   - Update `LodgingFrontDeskSection.tsx` to call `useStoreChangeRequestInbox(storeId)`.
   - Add a fifth stat card:
     - `Open guest requests`
   - Include this count in:
     - Status banner
     - “What this section does” panel
     - PDF report
     - Completion Verification page

6. Add one-click “Export Front Desk QA Report (PDF)”
   - Add a button on the Front Desk screen:
     - `Export Front Desk QA Report`
   - Generate a client-side PDF using the existing `jspdf` dependency.
   - Report contents:
     - Store name/id
     - Generated timestamp
     - Current Front Desk operational stats:
       - Today’s arrivals
       - In-house guests
       - Today’s departures
       - Active reservations
       - Open guest requests
     - Current completion percentage
     - Latest QA status from `runLodgingQa`
     - System failures
     - Setup warnings
     - Deep-link URLs for:
       - Front Desk
       - Rooms
       - Rate Plans
       - Reservations
       - Guest Requests
       - QA Checklist
   - Save as:
     - `front-desk-qa-report.pdf`

7. Share report-building logic where possible
   - Add a small helper:
     - `src/lib/lodging/frontDeskQaReport.ts`
   - It will format:
     - Operational stats
     - QA checks
     - Setup warnings
     - Deep links
   - Front Desk PDF export and the verification page can both use the same formatted data so results stay consistent.

8. Add an in-app “Completion Verification” page
   - Create:
     - `src/pages/admin/AdminLodgingCompletionVerificationPage.tsx`
   - Add route:
     - `/admin/lodging/completion-verification`
   - Page will auto-run Front Desk and lodging QA checks on load.
   - Show separate sections:
     - Technical/system status
     - Front Desk checks
     - Setup warnings
     - Live operational stats
     - Empty-state audit status
     - Deep-link verification
   - Clear status labels:
     - `System passed`
     - `Setup needed`
     - `System failure`
   - Include buttons:
     - `Open Front Desk`
     - `Open Rooms`
     - `Open Rate Plans`
     - `Open Reservations`
     - `Open Guest Requests`
     - `Run QA Checklist`
     - `Export Front Desk QA Report`

9. Add Front Desk-specific QA checks
   - Extend `src/lib/lodging/lodgingQa.ts` or add a companion helper:
     - `src/lib/lodging/frontDeskQa.ts`
   - Checks will include:
     - Front Desk route exists
     - `lodge-frontdesk` tab resolves correctly
     - Front Desk section has a rendered panel/test id
     - Live stats can be computed from reservation data
     - Guest request count can be computed from inbox data
     - Empty Front Desk states include primary and secondary fix actions
     - Missing data is classified as setup warning, not system failure
   - Preserve current separation:
     - Code/routing/sidebar problems = `fail`
     - Missing rooms/rates/reservations/requests = `warning`

10. Add entry points to verification
   - Add a “Completion Verification” button/link in:
     - `LodgingFrontDeskSection.tsx`
     - `AdminLodgingQAChecklistPage.tsx`
     - `HotelAdminLaunchPage.tsx`
     - Store owner lodging completion/sidebar area if there is room
   - This gives the owner one obvious place to prove the Front Desk is complete.

11. Update tests
   - Add unit tests for the shared empty-state action configuration:
     - Primary/secondary tabs are correct
     - Front Desk empty states map to the correct setup tabs
   - Add QA helper tests for:
     - Front Desk stats calculation
     - System failures vs setup warnings
     - Deep-link URL generation
   - Update existing lodging QA tests if the QA result shape is extended.

12. Validation after implementation
   - Run lodging unit tests.
   - Run QA helper tests.
   - Run production build.
   - Confirm at the current route:
     - `/admin/stores/7322b460-2c23-4d3d-bdc5-55a31cc65fab?tab=lodge-frontdesk`
   - Verify:
     - Empty Front Desk columns use the shared finished “Needs setup” design.
     - Next best action banners route to exact setup tabs.
     - Front Desk stats update after reservation/request changes without refresh.
     - “Export Front Desk QA Report (PDF)” downloads a readable report.
     - `/admin/lodging/completion-verification` loads and separates setup warnings from system failures.
     - Missing live hotel data no longer looks like unfinished implementation.

Expected result

The Front Desk and related lodging sections will no longer look incomplete when there is no live hotel data. Every blank state will use the same polished “Needs setup” component, live operating numbers will refresh automatically from backend events, the owner can export a Front Desk QA PDF in one click, and the new Completion Verification page will clearly prove what is technically complete versus what still needs hotel setup data.
