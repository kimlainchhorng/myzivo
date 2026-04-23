
Plan to make the Hotel/Resort update visibly complete and easy to access

1. Fix the main reason it looks unfinished
   - The current preview route is `/index`, which shows the regular mobile app home, not the Hotel/Resort admin screen.
   - Add a clear route path and entry point so the completed Hotel/Resort admin can be opened directly from the preview instead of looking hidden.
   - Keep the existing admin route:
     - `/admin/stores/:storeId`
   - Add tab deep-link support:
     - `/admin/stores/:storeId?tab=lodge-overview`
     - `/admin/stores/:storeId?tab=lodge-rate-plans`
     - `/admin/stores/:storeId?tab=lodge-addons`
     - `/admin/stores/:storeId?tab=lodge-guest-requests`
   - When a sidebar item or checklist item is clicked, update the URL `tab` parameter so refresh/back navigation keeps the same Hotel/Resort section open.

2. Add a visible “Hotel / Resort Admin” entry from the mobile app home
   - On mobile `/index`, add a compact partner/admin card only for logged-in users who own a store.
   - If the user owns a Hotel, Resort, or Guesthouse store, show:
     - “Hotel / Resort Admin”
     - Store name
     - Setup progress
     - Button: “Open Hotel Operations”
   - The button opens:
     - `/admin/stores/{storeId}?tab=lodge-overview`
   - If the user owns a non-lodging store, keep the existing store/partner behavior and do not show hotel-specific wording.

3. Add a proper owner-store lookup hook
   - Create or reuse a hook that checks `store_profiles.owner_id = current user id`.
   - Return:
     - Store id
     - Store name
     - Store category
     - Whether it is lodging
   - Use normalized lodging categories:
     - `hotel`
     - `resort`
     - `guesthouse`
     - `guesthouse / b&b`
     - `b&b`
   - This avoids the upgrade only being visible when the user manually knows the admin URL.

4. Strengthen the Hotel/Resort dashboard completion state
   - Add a top “Hotel admin is active” status strip inside `LodgingOverviewSection`.
   - Show exactly what has been enabled:
     - Hotel sidebar sections
     - Rate plans
     - Guest requests
     - Add-ons manager
     - Front desk
     - Housekeeping
     - Reports
     - Folio & charges
   - Add clear “Next step” CTA buttons:
     - Complete setup checklist
     - Add room/rates
     - Add guest add-ons
     - Open front desk

5. Make the sidebar progress real, not just text
   - Replace the static sidebar text “9-step checklist in Hotel Overview” with actual progress:
     - Example: `Setup progress: 4/9 ready`
   - Pass setup progress from the store editor into `StoreOwnerLayout`, or compute a lightweight progress count using existing lodging data.
   - Keep it compact for the 428px mobile preview.

6. Make incomplete setup obvious but not broken
   - If no rooms exist yet, Hotel Overview should show:
     - “Hotel admin is installed. Add your first room to start.”
   - If rooms exist but no rates, show:
     - “Rooms added. Add base rates next.”
   - If rates exist but no add-ons, show:
     - “Rates ready. Add guest services next.”
   - This will make it clear the feature is complete, even if business data is not fully configured yet.

7. Polish the new Hotel/Resort sections for “complete” feel
   - Review these sections and add stronger headers/empty states where needed:
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
   - Ensure every button routes somewhere real.
   - Remove or reword anything that feels like a placeholder.

8. Improve direct navigation from Partner Login
   - When a lodging store owner signs in through `/partner-login`, redirect them directly to:
     - `/admin/stores/{storeId}?tab=lodge-overview`
   - Keep non-lodging partners going to their normal dashboard.
   - If a store setup is incomplete, still route through `/store/setup` as currently intended.

9. Add a small admin/store list indicator
   - In `/admin/stores`, show a badge for Hotel/Resort/Guesthouse stores:
     - “Hotel Admin Ready”
   - Add a quick action:
     - “Open Hotel Operations”
   - This gives admins a visible way to confirm the Hotel/Resort upgrade is installed.

10. Validate after implementation
   - Confirm `/index` shows the Hotel/Resort admin entry for a lodging store owner.
   - Confirm `/admin/stores/:storeId?tab=lodge-overview` opens Hotel Overview directly.
   - Confirm every Hotel/Resort sidebar item updates the URL and renders the correct section.
   - Confirm refresh keeps the selected Hotel/Resort tab.
   - Confirm mobile sidebar still scrolls and closes after tapping a section.
   - Run a production build and fix any TypeScript errors.

Files to update

- `src/pages/admin/AdminStoreEditPage.tsx`
  - Add URL `?tab=` support.
  - Keep active tab synced with sidebar/checklist clicks.
  - Default lodging stores to `lodge-overview`.

- `src/components/admin/StoreOwnerLayout.tsx`
  - Replace static setup text with real progress.
  - Keep Hotel/Resort sidebar items visible and mobile-friendly.

- `src/pages/app/AppHome.tsx`
  - Add visible “Hotel / Resort Admin” card for lodging store owners on `/index`.

- `src/pages/PartnerLogin.tsx`
  - Redirect lodging store owners directly to Hotel Overview.

- `src/pages/admin/AdminStoresPage.tsx`
  - Add “Hotel Admin Ready” badge and “Open Hotel Operations” action for lodging stores.

- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
  - Add stronger completion/active status messaging and next-step CTAs.

- `src/components/admin/store/lodging/LodgingSetupChecklist.tsx`
  - Reuse progress calculation for the sidebar/mobile entry where needed.

Optional new hook

- `src/hooks/useOwnerStoreProfile.ts`
  - Fetch the logged-in user’s owned store profile.
  - Normalize lodging category detection.
  - Used by mobile home and partner/admin entry points.
