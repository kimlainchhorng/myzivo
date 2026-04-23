
Plan to finish and make the Hotel/Resort sidebar/add-on update visible and fully working

1. Verify why it still looks incomplete in the preview
   - Check the active preview route and store category flow.
   - Confirm the new hotel/resort sidebar only appears when editing a store with category:
     - Hotel
     - Resort
     - Guesthouse / B&B
   - If the preview is landing on `/index`, login, or a non-lodging store, add a clearer path/action so you can reach the upgraded Hotel/Resort admin screen without confusion.

2. Make the sidebar upgrade more obvious and easier to access
   - Add a stronger “Hotel Operations” entry/state so the new lodging sections are visible immediately.
   - Improve mobile sidebar spacing and labels so the added items do not feel hidden.
   - Keep the groups clear:
     - Manage
     - Hotel Ops
     - Guest Services
     - Sales & Growth
     - Team
   - Make sure active tab highlighting works for every new lodging item.

3. Finish any missing wiring for the new sections
   - Re-check every added lodging tab:
     - Overview
     - Add-ons & Packages
     - Dining & Meal Plans
     - Experiences & Tours
     - Transport & Transfers
     - Spa & Wellness
     - Policies & Rules
     - Reviews & Guest Feedback
   - Confirm every sidebar click changes the tab correctly.
   - Confirm every “next action” button jumps to the correct existing workflow.
   - Preserve the current mobile drawer close behavior after clicking a section.

4. Improve the new sections so they feel complete, not placeholder-like
   - Add clearer empty states explaining what the owner should add next.
   - Add more useful summary cards for hotel/resort operations.
   - Add “Open Rooms & Rates”, “Open Reservations”, and “Edit Property Profile” CTAs only where they actually work.
   - Avoid fake controls or buttons that do nothing.

5. Expand and polish the add-on workflow further
   - Re-check the room add-on preset catalog and make sure all names are correct hotel/resort terminology.
   - Add any missing high-value presets if not already present:
     - Room service
     - Welcome fruit basket
     - Airport VIP meet & greet
     - Private driver
     - Resort day pass
     - Spa package
     - Sauna access
     - Gym day pass
     - Kids club
     - Extra towels
     - Luggage storage
     - Wake-up call
   - Make sure each preset uses a supported billing type:
     - stay
     - night
     - guest
     - person_night
   - Make sure every preset has a valid Lucide icon slug.

6. Add a small completion/health check inside the lodging admin UI
   - Add an “Operations setup” summary to Hotel Overview showing:
     - Rooms configured
     - Active reservations
     - Active add-ons
     - Property profile status
     - Policies status
     - Guest services status
   - This will make it clear from the UI that the hotel/resort upgrade is active and connected.

7. Validate everything after implementation
   - Build the project.
   - Check TypeScript errors.
   - Confirm all lodging sidebar tabs render.
   - Confirm all add-on presets save into room records.
   - Confirm the updated UI is visible in a hotel/resort/guesthouse store admin page.
   - If preview still opens on the wrong page, provide the exact route/button path to view the completed update.

Files to update:
- `src/components/admin/StoreOwnerLayout.tsx`
- `src/pages/admin/AdminStoreEditPage.tsx`
- `src/components/admin/store/lodging/LodgingOperationsShared.tsx`
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
- `src/components/admin/store/lodging/LodgingAddOnsSection.tsx`
- `src/components/admin/store/lodging/LodgingDiningSection.tsx`
- `src/components/admin/store/lodging/LodgingExperiencesSection.tsx`
- `src/components/admin/store/lodging/LodgingTransportSection.tsx`
- `src/components/admin/store/lodging/LodgingWellnessSection.tsx`
- `src/components/admin/store/lodging/LodgingPoliciesSection.tsx`
- `src/components/admin/store/lodging/LodgingReviewsSection.tsx`
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx`
- `src/components/lodging/addonIcons.tsx`
