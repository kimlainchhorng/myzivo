
Plan to complete the Hotel/Resort admin update with QA page, tests, real progress, wizard, and fully loaded sections

1. Add a one-click Hotel/Resort QA checklist page
   - Create a new admin page:
     - `/admin/lodging/qa-checklist`
   - Show a clear completion dashboard with:
     - Updated features list
     - Build/test status placeholders populated from in-app checks
     - Route/deep-link checks
     - Sidebar section coverage
     - Data readiness checks
     - Remaining issues / incomplete setup items
   - Add one-click buttons:
     - Open Hotel Overview
     - Open Rooms
     - Open Rate Plans
     - Open Add-ons
     - Open Guest Requests
     - Open Wiring Check
   - Add a compact status summary:
     - “Complete”
     - “Needs setup data”
     - “Needs attention”
   - Link this QA page from:
     - Hotel Overview
     - Store owner sidebar completion center
     - Hotel Operations quick menu

2. Create reusable lodging completion logic from real fields
   - Move the current progress rules into a dedicated utility so every screen uses the same source of truth.
   - Compute progress from:
     - Rooms exist
     - Active room inventory exists
     - Base rates exist
     - Availability/stay rules exist
     - Check-in/check-out times exist
     - Property profile exists
     - Policies/rules exist
     - Add-ons/packages exist
     - Housekeeping readiness
     - Reservation/report readiness
   - Return:
     - Complete count
     - Total count
     - Percent
     - Ready items
     - Incomplete items
     - Next best action
     - Direct fix tab for each incomplete item

3. Upgrade the sidebar completion center
   - Replace the simple progress text with a real “Completion Center”.
   - Show:
     - Progress bar
     - `X/Y complete`
     - Top 2–3 incomplete setup items
     - Direct fix buttons, for example:
       - Add rooms
       - Add base rates
       - Complete property profile
       - Add add-ons
   - Keep it compact and scroll-friendly for the current 428px mobile preview.
   - All buttons will use the existing `lodge-set-tab` / `onTabChange` flow and update the `?tab=` URL.

4. Implement a stronger Setup Wizard
   - Update `LodgingSetupChecklist.tsx` into a real wizard-style component.
   - Add:
     - Current step / next best action
     - Ready vs needs setup states
     - Direct fix button per step
     - “Review” button for completed steps
   - Next best action rules:
     - No rooms → Add rooms
     - Rooms but no inventory/rates → Rate Plans & Availability
     - Rates but weak property profile → Property Profile
     - No add-ons → Add-ons & Packages
     - No guest requests/reservations → Guest Requests / Reservations
     - Everything ready → Front Desk
   - Use the same shared completion utility so Overview, Sidebar, QA page, and Wizard never disagree.

5. Add missing or incomplete Hotel/Resort admin sections
   - Confirm every sidebar tab has a real `TabsContent` and loads live data:
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
   - For any section that is too thin, add:
     - Live stats from existing hooks/data
     - Clear empty state
     - Direct fix buttons
     - No placeholder wording
   - Ensure every sidebar item fully renders without blank content.

6. Strengthen URL tab deep-linking and tab safety
   - Extract the tab-routing logic from `AdminStoreEditPage.tsx` into a testable helper:
     - Valid lodging tabs
     - Valid base tabs
     - Default tab for lodging stores
     - Safe fallback for invalid tabs
     - Prevent lodging tabs on non-lodging stores
   - Keep behavior:
     - `/admin/stores/:storeId?tab=lodge-overview` opens Overview
     - `/admin/stores/:storeId?tab=lodge-rate-plans` opens Rate Plans
     - Invalid lodging tab redirects to Overview
     - Lodging tab on non-lodging store redirects to Profile
     - No tab on lodging store defaults to Overview

7. Add unit tests to prevent regressions
   - Add tests for lodging store category detection:
     - Hotel
     - Hotels
     - Resort
     - Resorts
     - Guesthouse
     - Guest House
     - Guesthouse / B&B
     - Bed and Breakfast
     - B&B
     - Mixed case / extra spaces / symbols
     - Non-lodging categories return false
   - Add tests for URL tab deep-linking helper:
     - Valid lodging tab is accepted
     - Invalid lodging tab falls back to `lodge-overview`
     - Lodging tab on non-lodging store falls back to `profile`
     - Missing tab on lodging store defaults to `lodge-overview`
     - Missing tab on non-lodging store defaults to `profile`
   - Use existing Vitest setup already present in the project.

8. Add QA links and visible completion proof
   - Add “QA Checklist” button to:
     - Hotel Overview top status panel
     - Hotel Operations quick menu
     - Sidebar completion center
   - The QA page will show:
     - “All sidebar tabs registered”
     - “Deep links enabled”
     - “Setup wizard enabled”
     - “Real progress enabled”
     - “Unit tests added”
     - “Remaining setup data needed” based on actual store data

Files to add

- `src/pages/admin/AdminLodgingQAChecklistPage.tsx`
  - One-click Hotel/Resort QA checklist and completion status page.

- `src/lib/lodging/lodgingCompletion.ts`
  - Shared real-field completion rules, incomplete items, progress, and next best action.

- `src/lib/admin/storeTabRouting.ts`
  - Testable URL tab/deep-link validation helper.

- `src/hooks/useOwnerStoreProfile.test.ts`
  - Unit tests for lodging category detection.

- `src/lib/admin/storeTabRouting.test.ts`
  - Unit tests for URL tab deep-linking behavior.

Files to update

- `src/App.tsx`
  - Add `/admin/lodging/qa-checklist` route.

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Use shared tab-routing helper.
  - Use shared completion helper.
  - Add QA Checklist quick-menu button.
  - Ensure every lodging tab remains wired to a real section.

- `src/components/admin/StoreOwnerLayout.tsx`
  - Upgrade Hotel/Resort completion center with real incomplete items and fix buttons.
  - Add QA Checklist button.

- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
  - Use shared completion helper.
  - Add stronger Setup Wizard and QA Checklist entry.
  - Show next best action from real data.

- `src/components/admin/store/lodging/LodgingSetupChecklist.tsx`
  - Convert checklist into a richer wizard-ready component.
  - Show incomplete items and direct fix buttons.

- `src/components/admin/store/lodging/LodgingRatePlansSection.tsx`
  - Improve readiness indicators and direct fix actions.

- `src/components/admin/store/lodging/LodgingGuestRequestsSection.tsx`
  - Improve live request/readiness state and empty-state actions.

- `src/components/admin/store/lodging/LodgingDiningSection.tsx`
- `src/components/admin/store/lodging/LodgingExperiencesSection.tsx`
- `src/components/admin/store/lodging/LodgingTransportSection.tsx`
- `src/components/admin/store/lodging/LodgingWellnessSection.tsx`
- `src/components/admin/store/lodging/LodgingAmenitiesSection.tsx`
- `src/components/admin/store/lodging/LodgingPoliciesSection.tsx`
- `src/components/admin/store/lodging/LodgingReviewsSection.tsx`
  - Ensure each section has live data, meaningful empty states, and direct fix/navigation buttons.

Validation after implementation

- Run unit tests for category detection and tab routing.
- Run production build.
- Confirm `/admin/lodging/qa-checklist` loads.
- Confirm every Hotel/Resort sidebar item opens real content.
- Confirm completion center shows real incomplete items.
- Confirm Setup Wizard opens the correct next tab.
- Confirm deep links and refresh behavior work for lodging tabs.
- Confirm invalid tabs never show blank content.
