
Plan: upgrade the Hotel/Resort admin to the next operational step

1. Add a clearer “Next Setup Steps” dashboard to Hotel Overview
   - Add a top checklist card that tells the owner what is complete and what still needs setup:
     - Rooms & rates
     - Availability calendar
     - Check-in/check-out times
     - Property profile
     - Policies & rules
     - Add-ons & packages
     - Housekeeping
     - Maintenance
     - Reports
   - Each checklist row will have a status badge and a working button that jumps to the right hotel section.
   - This will make it obvious what is already completed and what still needs action.

2. Add “Rate Plans & Availability” as the next hotel/resort sidebar item
   - Add a new sidebar item under Hotel Operations:
     - Rate Plans & Availability
   - Create a working section for:
     - Base rate
     - Weekend rate
     - Weekly/monthly discount
     - Seasonal rates
     - Minimum stay
     - Maximum stay
     - No-arrival weekdays
     - Room inventory/unit count
   - Reuse existing `lodge_rooms` fields first, so no database migration is required.
   - Add clear empty states when no rooms exist yet.

3. Improve Add-ons & Packages into a more complete manager
   - Add filters for add-on category:
     - All
     - Food & drink
     - Stay flexibility
     - Transport
     - Wellness
     - Experiences
     - Celebration
     - Services
   - Add search by add-on name or room name.
   - Add status filters:
     - Active
     - Hidden
     - Free
     - Paid
   - Add a clearer “where to edit” action for each add-on:
     - “Edit in Rooms & Rates”
   - Keep add-ons saved inside room records for now.

4. Add a “Guest Requests” workspace
   - Add a sidebar item under Guest Services:
     - Guest Requests
   - Create a working dashboard that summarizes guest service work from existing reservation/add-on data:
     - Pending add-on requests
     - Approved services
     - Failed/cancelled service requests
     - Completed guest services
   - Include recommended next actions:
     - Review reservation
     - Open front desk
     - Manage add-ons
   - Avoid fake controls; buttons will route to existing working pages.

5. Add a “Folio & Charges” view for reservations
   - Use existing `lodge_reservation_charges` table and reservation totals.
   - Add a clean section inside reservation detail showing:
     - Room rate
     - Extras/add-ons
     - Tax
     - Paid amount
     - Balance due
     - Additional charges
   - Add loading and empty messages.
   - If charge creation already works through existing data, expose it clearly; if not, keep it read-only with a proper “charges not added yet” state.

6. Modernize Front Desk, Housekeeping, and Reports screens
   - Front Desk:
     - Show today’s arrivals, in-house guests, and departures with check-in/check-out time labels.
     - Add better empty messages instead of just “None”.
   - Housekeeping:
     - Add summary cards for clean, dirty, in progress, inspected, and out of service.
     - Add room search/filter by status.
   - Reports:
     - Add clearer revenue cards:
       - Room revenue
       - Extras revenue
       - Tax
       - Paid vs unpaid
     - Keep CSV export working.

7. Make the mobile sidebar easier to understand
   - Keep the Hotel / Resort Admin banner.
   - Add a small “Setup progress” count in the banner.
   - Make the new next-step sections visible without feeling hidden on the small 428px mobile preview.
   - Preserve drawer close behavior and active tab highlighting.

8. Keep routing/state reliable
   - Add all new tabs to `AdminStoreEditPage.tsx`.
   - Add all new titles to the lodging title map.
   - Use the existing `lodge-set-tab` event for cross-section navigation.
   - Ensure direct sidebar clicks, overview checklist buttons, and next-action cards all open the correct section.

Files to update

- `src/components/admin/StoreOwnerLayout.tsx`
  - Add new hotel/resort sidebar items:
    - Rate Plans & Availability
    - Guest Requests
  - Improve Hotel / Resort Admin banner with setup progress.

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Add tab titles and `TabsContent` entries for the new sections.

- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
  - Add the new “Next Setup Steps” checklist and completion status.

- `src/components/admin/store/lodging/LodgingAddOnsSection.tsx`
  - Add filters, search, grouped status, and edit-routing actions.

- `src/components/admin/store/lodging/LodgingFrontDeskSection.tsx`
  - Improve time display, empty states, and today workflow layout.

- `src/components/admin/store/lodging/LodgingHousekeepingSection.tsx`
  - Add summary cards and filters.

- `src/components/admin/store/lodging/LodgingReportsSection.tsx`
  - Add stronger revenue/folio reporting cards.

New files to add

- `src/components/admin/store/lodging/LodgingRatePlansSection.tsx`
  - Rate plans, seasonal pricing, inventory, stay restrictions, and availability readiness.

- `src/components/admin/store/lodging/LodgingGuestRequestsSection.tsx`
  - Guest service/add-on request operations dashboard.

- `src/components/admin/store/lodging/LodgingSetupChecklist.tsx`
  - Reusable setup checklist used by Hotel Overview and sidebar progress.

- `src/hooks/lodging/useLodgeReservationCharges.ts`
  - Read reservation charge rows from `lodge_reservation_charges`.

Optional reservation detail update

- `src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx`
  - Add “Folio & Charges” card using reservation totals and `lodge_reservation_charges`.

Validation after implementation

- Confirm new sidebar items appear for Hotel, Resort, Guesthouse, and B&B stores.
- Confirm every new sidebar item opens a real working section.
- Confirm all buttons route to existing working workflows.
- Confirm mobile drawer remains scrollable and closes after tab selection.
- Confirm add-on filters/search work.
- Confirm front desk and reservation detail show check-in/check-out times.
- Run a production build and fix any TypeScript errors.
