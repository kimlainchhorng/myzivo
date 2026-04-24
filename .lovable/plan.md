
Plan to make the Hotel/Resort update feel fully complete and visible in the app

1. Add a dedicated Hotel/Resort launch screen
   - Create a clear Hotel/Resort Operations home page instead of relying only on hidden admin tabs.
   - Add route:
     - `/hotel-admin`
   - If the logged-in user owns a Hotel, Resort, Guesthouse, or B&B store, automatically open their store admin:
     - `/admin/stores/{storeId}?tab=lodge-overview`
   - If no lodging store is found, show a helpful page:
     - “No Hotel / Resort store connected yet”
     - Button: “Set up Hotel / Resort”
     - Button: “Go to Partner Login”
   - This prevents the update from looking missing when the preview opens on `/index`.

2. Add a visible Hotel/Resort button at the top of `/index`
   - Move the “Hotel / Resort Admin” owner card higher on the mobile home page, near the top under the search area.
   - Make it more obvious with:
     - Hotel / Resort Admin title
     - Store name
     - Setup progress
     - “Open Hotel Operations” button
     - “Rooms”, “Rates”, “Guest Requests” quick chips
   - If the owner store data is still loading, show a small skeleton/loading state instead of nothing.
   - If the user is not logged in or no owner store is detected, show a compact “Partner Admin” shortcut that opens `/partner-login`.

3. Add a sidebar “completion center”
   - In the Hotel/Resort sidebar banner, add:
     - Real setup progress
     - “Continue setup” button
     - “Open Overview” button
   - Keep it compact for the 428px mobile preview.
   - Make sure it is visible before the long section list so the user immediately sees the hotel admin is installed.

4. Add a stronger Hotel Overview completion dashboard
   - Add a top “Hotel / Resort Admin Installed” panel with:
     - Admin sections enabled
     - Deep links enabled
     - Setup checklist enabled
     - Rate plans enabled
     - Guest requests enabled
     - Folio & charges enabled
   - Add one clear “Next best action” based on the property state:
     - No rooms → “Add first room”
     - Rooms but no rates → “Add base rates”
     - Rates but no add-ons → “Add guest services”
     - Everything ready → “Open front desk”
   - Keep all buttons wired to real existing tabs.

5. Add a visual “Hotel Operations” quick menu inside the admin page
   - At the top of `AdminStoreEditPage.tsx` for lodging stores, add a horizontal quick menu:
     - Overview
     - Rooms
     - Rates
     - Reservations
     - Front Desk
     - Add-ons
     - Guest Requests
     - Reports
   - This makes the update visible even if the mobile sidebar is closed.
   - Each quick item updates the `?tab=` URL and opens the correct section.

6. Improve direct URL support and tab safety
   - Keep current `?tab=` deep links.
   - Add validation so invalid or non-lodging tab names do not show a blank tab.
   - If a user opens:
     - `/admin/stores/:storeId?tab=lodge-rate-plans`
   - and the store is lodging, it opens correctly.
   - If the store is not lodging, redirect safely to `profile`.
   - If no `tab` is provided for lodging stores, default to `lodge-overview`.

7. Make every lodging section feel less placeholder-like
   - Review and polish:
     - Hotel Overview
     - Rate Plans & Availability
     - Add-ons & Packages
     - Guest Requests
     - Dining & Meal Plans
     - Experiences & Tours
     - Transport & Transfers
     - Spa & Wellness
     - Policies & Rules
     - Reviews & Guest Feedback
   - Add better empty states that explain exactly what the owner should do next.
   - Add real navigation buttons only where the destination exists.
   - Remove wording that feels unfinished, like “coming later” or vague placeholders.

8. Add a Hotel/Resort setup wizard mode
   - Add a “Setup Wizard” card to Hotel Overview.
   - The wizard will guide the owner through:
     - Property profile
     - Rooms
     - Rates
     - Availability
     - Policies
     - Add-ons
     - Housekeeping
     - Front desk
     - Reports
   - Each step has:
     - Ready / Needs setup status
     - Short description
     - Button to open the right tab
   - Reuse the existing `LodgingSetupChecklist` logic so it stays connected to real data.

9. Add admin/testing visibility tools
   - Add an admin-only “Hotel Admin Check” button from the hotel overview or store list.
   - It opens the existing lodging wiring check page:
     - `/admin/lodging/wiring-check`
   - Add quick links for:
     - Open Hotel Overview
     - Open Rate Plans
     - Open Guest Requests
     - Open Reservations
   - This gives a visible way to confirm the hotel system is wired.

10. Fix owner-store detection edge cases
   - Improve `useOwnerStoreProfile.ts` to handle:
     - Multiple owned stores
     - Lodging category variants:
       - Hotel
       - Hotels
       - Resort
       - Resorts
       - Guesthouse
       - Guest House
       - Guesthouse / B&B
       - Bed and Breakfast
       - B&B
     - Category values with extra spaces or different capitalization
   - Prefer lodging store first when multiple stores exist.
   - Return loading and empty states so the home card does not silently disappear.

11. Validation after implementation
   - Confirm `/index` clearly shows a Hotel/Resort or Partner Admin entry.
   - Confirm `/hotel-admin` works as a direct entry point.
   - Confirm `/admin/stores/:storeId?tab=lodge-overview` opens Hotel Overview.
   - Confirm invalid tab names do not produce blank pages.
   - Confirm the mobile sidebar remains scrollable and closes after tapping a tab.
   - Confirm the top quick menu opens every major lodging section.
   - Confirm every button routes to a real working tab/page.
   - Run a production build and fix TypeScript errors.

Files to update

- `src/pages/app/AppHome.tsx`
  - Move and strengthen Hotel/Resort Admin entry.
  - Add fallback Partner Admin entry when no lodging owner store is detected.

- `src/hooks/useOwnerStoreProfile.ts`
  - Improve lodging category normalization.
  - Support multiple owned stores and prefer lodging stores.

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Add tab validation.
  - Add top Hotel Operations quick menu.
  - Strengthen default lodging tab behavior.

- `src/components/admin/StoreOwnerLayout.tsx`
  - Add compact completion center in the sidebar.
  - Add Continue Setup / Open Overview actions.

- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
  - Add stronger installed/active dashboard.
  - Add next-best-action logic.
  - Add Setup Wizard card.

- `src/components/admin/store/lodging/LodgingSetupChecklist.tsx`
  - Reuse checklist as wizard-style setup steps.
  - Improve compact mode for sidebar/home use.

- `src/components/admin/store/lodging/LodgingAddOnsSection.tsx`
  - Improve empty states and button wording.

- `src/components/admin/store/lodging/LodgingRatePlansSection.tsx`
  - Improve rate readiness messaging and next actions.

- `src/components/admin/store/lodging/LodgingGuestRequestsSection.tsx`
  - Improve request workspace empty states and reservation links.

New file to add

- `src/pages/admin/HotelAdminLaunchPage.tsx`
  - Direct `/hotel-admin` entry route for owners and preview access.

- Optional: `src/components/admin/store/lodging/LodgingOperationsQuickMenu.tsx`
  - Reusable top quick menu for lodging admin tabs.

Route update

- `src/App.tsx`
  - Add:
    - `/hotel-admin`
  - Keep existing:
    - `/admin/stores/:storeId`
    - `/admin/stores/:storeId?tab=lodge-overview`
