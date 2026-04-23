
Plan to upgrade the Hotel/Resort sidebar and add missing working sections

1. Reorganize the sidebar for hotel/resort businesses
   - Keep existing working entries:
     - Profile
     - Orders
     - Payment & Payouts
     - Rooms & Rates
     - Reservations
     - Calendar & Availability
     - Guests
     - Front Desk
     - Housekeeping
     - Maintenance
     - Amenities & Policies
     - Property Profile
     - Reports
   - Add clearer hotel/resort-specific entries:
     - Overview
     - Add-ons & Packages
     - Dining & Meal Plans
     - Experiences & Tours
     - Transport & Transfers
     - Spa & Wellness
     - Policies & Rules
     - Reviews & Guest Feedback
   - Use correct hospitality names so the sidebar feels like a real hotel/resort operating system, not a generic store menu.

2. Make every new sidebar item open a real working page section
   - Add matching `TabsContent` entries in `AdminStoreEditPage`.
   - Create lightweight but functional sections instead of empty/dead pages.
   - Each section will have:
     - A clean header
     - Helpful summary cards
     - Search/filter controls where useful
     - Empty states with clear next actions
     - Buttons that jump to the correct existing workflow when full editing already exists elsewhere.

3. Add a dedicated “Add-ons & Packages” workflow
   - Create a hotel/resort add-ons manager that reads room add-ons from existing `lodge_rooms.addons`.
   - Show add-ons grouped by category:
     - Food & drink
     - Stay flexibility
     - Transport
     - Wellness
     - Experiences
     - Celebration
     - Services
   - Show useful counts:
     - Total active add-ons
     - Rooms using add-ons
     - Free vs paid add-ons
     - Guest-visible active add-ons
   - Add quick actions:
     - Manage room add-ons
     - Open Rooms & Rates
     - Open Reservations add-on workflow
   - Avoid adding fake buttons that do nothing.

4. Expand the room add-on preset catalog
   - Add more hotel/resort add-on presets with correct names and categories, such as:
     - Breakfast buffet
     - Lunch set menu
     - Dinner set menu
     - Kids meal
     - Floating breakfast
     - Romantic dinner
     - Airport pickup
     - Airport drop-off
     - Ferry transfer
     - Private boat transfer
     - Scooter rental
     - Car rental
     - Early check-in
     - Late check-out
     - Extra bed
     - Baby crib
     - Pet fee
     - Spa massage
     - Couples massage
     - Yoga session
     - Snorkeling tour
     - Island hopping tour
     - Fishing trip
     - Sunset cruise
     - Birthday cake
     - Flower bouquet
     - Honeymoon setup
     - Laundry service
     - Daily housekeeping
     - Beach towel rental
     - Parking
   - Ensure all presets use supported `per` values:
     - `stay`
     - `night`
     - `guest`
     - `person_night`
   - Ensure icon slugs match `addonIcons.tsx` or add missing icon mappings.

5. Improve sidebar usability
   - Split hotel/resort navigation into clearer groups:
     - Manage
     - Hotel Ops
     - Guest Services
     - Sales & Growth
     - Team
   - Keep the active state visible.
   - Keep mobile drawer behavior working.
   - Preserve current sidebar scroll behavior.
   - Do not break existing tabs or routes.

6. Add resort-specific operating sections
   - Dining & Meal Plans:
     - Summarize meal-related add-ons and room meal plans.
     - Link to Rooms & Rates and Amenities & Policies.
   - Experiences & Tours:
     - Summarize tours/activities from add-ons.
     - Link to add-on setup.
   - Transport & Transfers:
     - Summarize transfer/rental add-ons.
     - Link to add-on setup.
   - Spa & Wellness:
     - Summarize wellness add-ons and facilities.
     - Link to Amenities & Policies.
   - Policies & Rules:
     - Show check-in/out, cancellation, deposit, child, pet, and house-rule summary from lodging profile data.
     - Link to Property Profile / Amenities & Policies for editing.
   - Reviews & Guest Feedback:
     - Add a clean placeholder-ready section that can later connect to real review data.
     - For now, show reservation/guest follow-up guidance and no dead controls.

7. Keep existing hotel/resort workflows connected
   - Sidebar buttons and section CTA buttons will dispatch the existing `lodge-set-tab` event or use `setActiveTab`.
   - “Manage add-ons” will route users to the Rooms & Rates editor where add-ons are currently saved.
   - Add-on workflow will continue using the existing reservation detail add-on timeline.

Technical details

Files to update:
- `src/components/admin/StoreOwnerLayout.tsx`
  - Add new hotel/resort sidebar items and better grouping.
  - Use correct hospitality labels and icons.

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Add titles for new lodging tabs.
  - Import new lodging section components.
  - Add `TabsContent` for every new sidebar item so every item works.

- `src/components/admin/store/lodging/LodgingRoomsSection.tsx`
  - Expand the add-on preset list.
  - Clean up add-on names/categories.
  - Make quick-add presets more complete for hotels and resorts.

- `src/components/lodging/addonIcons.tsx`
  - Add missing Lucide icon mappings for new add-on slugs.

New components to add:
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
- `src/components/admin/store/lodging/LodgingAddOnsSection.tsx`
- `src/components/admin/store/lodging/LodgingDiningSection.tsx`
- `src/components/admin/store/lodging/LodgingExperiencesSection.tsx`
- `src/components/admin/store/lodging/LodgingTransportSection.tsx`
- `src/components/admin/store/lodging/LodgingWellnessSection.tsx`
- `src/components/admin/store/lodging/LodgingPoliciesSection.tsx`
- `src/components/admin/store/lodging/LodgingReviewsSection.tsx`

Data approach:
- Reuse existing tables and JSON fields first:
  - `lodge_rooms.addons`
  - `lodge_rooms.seasonal_rates`
  - `lodge_rooms.amenities`
  - `lodge_property_profile`
  - `lodge_reservations`
- No database migration is required for this upgrade unless you later want full CRUD tables for reviews, spa appointments, tours, or restaurant menus.

Validation:
- Confirm every new sidebar item opens a real section.
- Confirm existing sidebar items still work.
- Confirm add-on presets save correctly inside room records.
- Confirm no new dead buttons are introduced.
- Run a production build after implementation.
