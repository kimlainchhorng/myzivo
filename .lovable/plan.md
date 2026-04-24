
Plan to complete the Hotel/Resort QA system with Run QA, exportable report, E2E checks, deterministic fixtures, and empty-state audits

1. Add a one-click “Run QA” button on the QA checklist page
   - Update `src/pages/admin/AdminLodgingQAChecklistPage.tsx`.
   - Add local QA state:
     - Not run
     - Running
     - Passed
     - Failed
   - When clicked, compute checks immediately in the browser using current store/lodging data:
     - Route checks
     - Sidebar tab registration checks
     - Deep-link URL checks
     - Data readiness checks
     - Empty-state/fix-button checks
   - Display each result as pass/fail with:
     - Check name
     - Status badge
     - Detail text
     - Direct fix/open button when applicable
   - Keep the current summary cards, but make them reflect the latest QA run instead of static text only.

2. Create a reusable QA engine
   - Add a shared helper:
     - `src/lib/lodging/lodgingQa.ts`
   - It will return structured QA results:
     - `overallStatus`
     - `passedCount`
     - `failedCount`
     - `warningCount`
     - `checks[]`
     - `failingChecks[]`
     - `deepLinks[]`
     - `emptyStateAudit[]`
   - Inputs will include:
     - Store id
     - Store category
     - Completion data
     - Lodging tab registry
     - Existing rooms/profile/addons/reservations
   - The QA page, tests, and report export will all use this same helper so results stay consistent.

3. Add exportable QA report from the QA checklist page
   - Add buttons:
     - “Export PDF”
     - “Print Report”
   - Use existing frontend dependencies (`jspdf`, optionally `html2canvas`) to generate a client-side report.
   - Report will include:
     - Store name/id
     - Completion percentage
     - Passed/failed QA totals
     - Failing checks
     - Remaining setup items
     - Deep-link URLs:
       - `/hotel-admin`
       - `/admin/stores/{storeId}?tab=lodge-overview`
       - `/admin/stores/{storeId}?tab=lodge-rate-plans`
       - `/admin/stores/{storeId}?tab=lodge-addons`
       - `/admin/stores/{storeId}?tab=lodge-guest-requests`
       - `/admin/lodging/qa-checklist`
   - Add a print-only report section with clean spacing and no navigation clutter.

4. Add deterministic fixtures for categories and tab query strings
   - Add:
     - `src/test/fixtures/lodgingCategoryFixtures.ts`
     - `src/test/fixtures/lodgingTabFixtures.ts`
   - Category fixtures will include valid lodging variants:
     - Hotel
     - Hotels
     - Resort
     - Resorts
     - Guesthouse
     - Guest House
     - Guesthouse / B&B
     - Bed and Breakfast
     - B&B
     - Mixed case, extra spaces, symbols
   - Non-lodging fixtures will include:
     - Restaurant
     - Grocery
     - Auto repair
     - Spa
     - Empty/null/undefined
   - Tab fixtures will include:
     - Valid lodging tabs
     - Valid base tabs
     - Invalid tabs
     - Missing tab
     - Full query-string examples like `?tab=lodge-overview`.

5. Upgrade existing unit tests to use fixtures
   - Update:
     - `src/hooks/useOwnerStoreProfile.test.ts`
     - `src/lib/admin/storeTabRouting.test.ts`
   - Add tests for:
     - Category normalization
     - Lodging detection
     - Non-lodging rejection
     - Query-string parsing
     - Missing tab fallback
     - Invalid tab fallback
     - Lodging tab blocked for non-lodging stores
   - Add test coverage for helper functions used by the QA page.

6. Strengthen tab routing helper for full query strings
   - Update `src/lib/admin/storeTabRouting.ts`.
   - Add helpers:
     - `getTabFromSearch(search: string)`
     - `resolveStoreTabFromSearch(search: string, isLodgingStore: boolean)`
     - `buildStoreTabUrl(storeId: string, tab: string)`
   - Keep current behavior:
     - Lodging store with no tab defaults to `lodge-overview`.
     - Non-lodging store with no tab defaults to `profile`.
     - Invalid lodging tab falls back safely.
     - Lodging tabs never render for non-lodging stores.

7. Add automated end-to-end deep-link checks
   - Add Playwright configuration if missing:
     - `playwright.config.ts`
   - Add E2E spec:
     - `tests/e2e/lodging-deeplinks.spec.ts`
   - Tests will verify that refresh/deep-link routes render without blank content:
     - `/admin/stores/{storeId}?tab=lodge-overview`
     - `/admin/stores/{storeId}?tab=lodge-rate-plans`
     - `/admin/stores/{storeId}?tab=lodge-addons`
     - `/admin/stores/{storeId}?tab=lodge-guest-requests`
   - Add stable test selectors to admin content where needed:
     - `data-testid="lodging-tab-lodge-overview"`
     - `data-testid="lodging-tab-lodge-rate-plans"`
     - `data-testid="lodging-tab-lodge-addons"`
     - `data-testid="lodging-tab-lodge-guest-requests"`
   - If authenticated data is unavailable in local E2E, include a documented mocked/storage-state path and keep unit-level routing tests deterministic.

8. Audit every lodging sidebar tab for meaningful empty states
   - Add a registry:
     - `src/lib/lodging/lodgingSidebarAudit.ts`
   - For every lodging tab, define:
     - Tab id
     - Human label
     - Expected empty-state title/body
     - Required fix button label
     - Required fix tab
   - Include all lodging sections:
     - Overview
     - Rooms
     - Rate Plans
     - Reservations
     - Calendar
     - Guests
     - Front Desk
     - Housekeeping
     - Maintenance
     - Add-ons
     - Guest Requests
     - Dining
     - Experiences
     - Transport
     - Wellness
     - Amenities
     - Property
     - Policies
     - Reviews
     - Reports
   - The QA page’s “Run QA” button will check this registry and show pass/fail results.

9. Update lodging section empty states and fix buttons
   - Review and update lodging components so every thin/empty section has:
     - Clear empty title
     - Short explanation
     - Direct fix button
     - Correct target tab
   - Target files include:
     - `LodgingRoomsSection.tsx`
     - `LodgingRatePlansSection.tsx`
     - `LodgingAddOnsSection.tsx`
     - `LodgingGuestRequestsSection.tsx`
     - `LodgingDiningSection.tsx`
     - `LodgingExperiencesSection.tsx`
     - `LodgingTransportSection.tsx`
     - `LodgingWellnessSection.tsx`
     - `LodgingAmenitiesSection.tsx`
     - `LodgingPoliciesSection.tsx`
     - `LodgingReviewsSection.tsx`
     - `LodgingReportsSection.tsx`
   - Add `data-testid` attributes where the QA/E2E checks need stable section detection.

10. Add visible QA results to the completion center
   - Keep the sidebar compact.
   - Add a small “Run QA”/“QA Checklist” entry that opens `/admin/lodging/qa-checklist`.
   - Show the latest QA summary when available:
     - Passed count
     - Failed count
     - “Fix required” if any critical checks fail.

11. Validation after implementation
   - Run unit tests:
     - Category fixture tests
     - Tab-routing fixture tests
     - QA helper tests
     - Empty-state audit tests
   - Run E2E checks for lodging deep links if the environment can provide a lodging store/auth state.
   - Run production build.
   - Confirm:
     - `/admin/lodging/qa-checklist` loads.
     - “Run QA” updates pass/fail results immediately.
     - Export PDF downloads a readable QA report.
     - Print view contains completion percentage, failing checks, and deep-link URLs.
     - Every lodging sidebar tab has real content or a meaningful empty state.
     - Every empty state has a direct fix button to the correct tab.
     - Refreshing `?tab=...` does not show blank content.
