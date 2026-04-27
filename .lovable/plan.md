## Hotel & Resort upgrade — Phase 6

Phase 5 closed 8 of the lodging sections. This phase finishes the consistency sweep across the remaining 10 sections and runs verification.

### 1. Cross-section consistency sweep — final 10 sections

Add `<LodgingQuickJump active="…">` and `<LodgingSectionStatusBanner>` to the top of each:

- `LodgingAddOnsSection.tsx` — quick-jump `lodge-addons`, banner counts active add-ons, fix → Rate Plans
- `LodgingCalendarSection.tsx` — quick-jump `lodge-calendar`, banner counts blocked dates / rooms, fix → Reservations
- `LodgingGuestRequestsSection.tsx` — quick-jump `lodge-guest-requests`, banner counts open requests, fix → Concierge
- `LodgingGuestsSection.tsx` — quick-jump `lodge-guests`, banner counts in-house guests, fix → Front Desk
- `LodgingMaintenanceSection.tsx` — quick-jump `lodge-maintenance`, banner counts open tickets, fix → Housekeeping
- `LodgingPoliciesSection.tsx` — quick-jump `lodge-policies`, banner counts taxes & fees configured, fix → Amenities
- `LodgingRatePlansSection.tsx` — quick-jump `lodge-rate-plans`, banner counts active rate plans, fix → Rooms
- `LodgingReportsSection.tsx` — quick-jump `lodge-reports`, banner shows current period, fix → Reservations
- `LodgingReviewsSection.tsx` — quick-jump `lodge-reviews`, banner shows total reviews + avg rating, fix → Property Profile
- `LodgingRoomsSection.tsx` — quick-jump `lodge-rooms`, banner counts active rooms, fix → Rate Plans

For sections without `SectionShell` (Calendar, Guests, Maintenance, Reports, Rooms), insert at the top of the returned wrapper div (same pattern used for Amenities in Phase 5).

### 2. Verification (mandatory)

Run in order, report inline:

1. `tsc --noEmit -p tsconfig.app.json` — must be clean
2. Spot-check each updated section file with `rg` to confirm both `LodgingQuickJump` and `LodgingSectionStatusBanner` appear
3. `supabase--read_query` smoke check on the 4 source tables for store `7322b460-2c23-4d3d-bdc5-55a31cc65fab` to confirm queries resolve
4. Review preview console logs for any new errors

### Files (planned)

Modified (11):
- 10 lodging section files listed above
- `.lovable/plan.md`

No new components. No schema changes. No import-map churn beyond the 2 added imports per file.
