
Plan to finish the Hotel/Resort admin so it is visibly complete, not just technically wired

1. Make Hotel/Resort completion visible from the app the user is actually seeing
   - Add a clear Hotel/Resort Admin card on `/feed` and `/app/home` for eligible store owners.
   - The card will show:
     - Store name
     - Completion percentage
     - Next action
     - “Open Hotel Admin”
     - “Run QA”
     - “View QA Report”
   - If the user is not on the hidden admin route, they will still see that the Hotel/Resort update exists and can open it in one click.

2. Upgrade `/hotel-admin` into a true completion launch hub
   - Replace the simple launcher with a full “Hotel/Resort Operations Center”.
   - Show:
     - Completion score
     - QA score
     - Last QA run time
     - All 20 hotel sections
     - Next best action
     - Direct buttons to key workflows:
       - Rooms
       - Rate Plans
       - Reservations
       - Front Desk
       - Add-ons
       - Guest Requests
       - Reports
       - QA Checklist
   - If no lodging store is found, show a clear “Create or select Hotel/Resort store” state instead of looking unfinished.

3. Make the QA checklist auto-run and show proof immediately
   - Update `/admin/lodging/qa-checklist` so it does not look empty before clicking.
   - On page load:
     - Run route checks
     - Run sidebar checks
     - Run data readiness checks
     - Run empty-state audit
     - Run deep-link checks
   - Keep the “Run QA” button for manual re-checks, but the page will already display results.
   - Add a prominent final status:
     - “QA Passed”
     - “QA Passed with setup warnings”
     - “QA Failed”
   - Separate technical pass/fail from business setup warnings, so missing real hotel data does not look like broken code.

4. Fix the current “not complete” perception in QA results
   - Some QA checks currently mark setup data as `fail` when rooms/rates/profile are missing.
   - Change this to:
     - Code/system issues = fail
     - Missing hotel setup data = warning / action needed
   - This prevents the update from appearing broken when the owner simply has not added rooms or rates yet.

5. Add a visible “Completion Proof” section
   - Add a new panel on the QA page and Hotel Admin hub:
     - “What is completed”
     - “What needs your hotel data”
     - “What actions to take next”
   - Include completed proof rows:
     - `/hotel-admin` route available
     - QA checklist available
     - 20 sidebar sections registered
     - Deep-link tab routing enabled
     - Setup wizard enabled
     - PDF/print report enabled
     - Empty-state audit enabled
     - Unit test fixtures added
     - E2E coverage added
   - Include remaining setup rows based on real data:
     - Rooms missing
     - Rates missing
     - Property profile incomplete
     - Add-ons missing
     - No reservations yet

6. Strengthen every lodging section so none look placeholder
   - Review all 20 sidebar tabs and improve sections that still feel thin.
   - Every section will have:
     - Real data counts where available
     - Clear empty state
     - Direct fix button
     - “What this section does” explanation
     - Link to related tabs
   - Tabs to verify and polish:
     - Hotel Operations
     - Rooms & Rates
     - Rate Plans & Availability
     - Reservations
     - Calendar & Availability
     - Guests
     - Front Desk
     - Housekeeping
     - Maintenance
     - Add-ons & Packages
     - Guest Requests
     - Dining & Meal Plans
     - Experiences & Tours
     - Transport & Transfers
     - Spa & Wellness
     - Amenities & Policies
     - Property Profile
     - Policies & Rules
     - Reviews & Guest Feedback
     - Reports

7. Make the Setup Wizard more obvious and action-focused
   - Add a large “Next best action” panel at the top of Hotel Overview.
   - Show:
     - Current setup step
     - Why it matters
     - Direct fix button
     - Secondary review button
   - Step order:
     - Add rooms
     - Add inventory
     - Add base rates
     - Set availability
     - Complete property profile
     - Add policies
     - Add add-ons
     - Open guest requests
     - Open front desk

8. Improve the exportable QA report
   - Update PDF/print report to include:
     - Completion percentage
     - QA pass/warning/fail totals
     - Code/system checks
     - Setup-data warnings
     - Deep-link URLs
     - Empty-state audit results
     - Owner next actions
   - Add a print-only layout so the report looks professional and not like a raw admin page.

9. Replace source-only E2E checks with real route-render checks where possible
   - Keep deterministic source checks as backup.
   - Add stronger Playwright checks that verify:
     - Each critical `?tab=` URL resolves to the right tab.
     - The selected lodging section is visible.
     - The content area is not blank.
     - The sidebar selected state matches the URL.
   - Critical tested URLs:
     - `/admin/stores/:storeId?tab=lodge-overview`
     - `/admin/stores/:storeId?tab=lodge-rate-plans`
     - `/admin/stores/:storeId?tab=lodge-addons`
     - `/admin/stores/:storeId?tab=lodge-guest-requests`
   - If authenticated store data is unavailable, keep fallback deterministic checks but make that limitation visible in the QA report.

10. Add a “Hotel Admin Complete” status badge in owner navigation
   - In the Store Owner sidebar completion center, show:
     - Completion percentage
     - QA status
     - Last checked time
     - “Continue setup”
     - “Run QA”
   - This ensures the user sees the Hotel/Resort work as complete from normal navigation, not only from hidden admin URLs.

11. Validation after implementation
   - Run unit tests:
     - Lodging category fixtures
     - Tab query fixtures
     - QA helper
     - Sidebar empty-state audit
   - Run build.
   - Confirm routes exist:
     - `/hotel-admin`
     - `/admin/lodging/qa-checklist`
     - `/admin/stores/:storeId?tab=lodge-overview`
   - Confirm the QA page auto-runs and displays results immediately.
   - Confirm the Hotel Admin launch hub clearly shows completion state.
   - Confirm `/feed` or `/app/home` provides a visible Hotel/Resort entry point.
   - Confirm missing hotel setup data appears as “Needs setup”, not as broken implementation.

Files to update

- `src/pages/admin/HotelAdminLaunchPage.tsx`
  - Convert into full Hotel/Resort Operations Center.

- `src/pages/admin/AdminLodgingQAChecklistPage.tsx`
  - Auto-run QA, improve result grouping, add completion proof, improve report.

- `src/lib/lodging/lodgingQa.ts`
  - Separate system failures from setup-data warnings.

- `src/components/admin/StoreOwnerLayout.tsx`
  - Add stronger visible Hotel Admin Complete / QA status panel.

- `src/pages/app/AppHome.tsx`
  - Add clearer Hotel/Resort admin entry card.

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Ensure all tab content remains wired and visible.

- Lodging section components in `src/components/admin/store/lodging/`
  - Polish any section that still looks incomplete or placeholder-like.

- `tests/e2e/lodging-deeplinks.spec.ts`
  - Upgrade checks from source-only to real route render checks where possible.

Expected result

The Hotel/Resort work will no longer look hidden or unfinished. The user will see a clear Hotel/Resort entry point, a completed operations hub, an auto-running QA checklist, exportable proof, and direct next actions for any real setup data still missing.
