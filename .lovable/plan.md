## Hotel & Resort upgrade — Phase 5

Phase 5 closes the consistency gap left after Phases 1–4 by bringing the 8 untouched lodging sections up to the v2026 standard, replacing the cached `redemptions_used` counter with a live aggregate from `lodge_reservations`, and running the mandatory verification pass.

### 1. Cross-section consistency sweep

Apply the same 4-element pattern already standard in Front Desk / Reservations / Inbox / Concierge / Lost & Found / Housekeeping / Promotions / Overview:

1. `<LodgingQuickJump active="…">` at the top of the panel
2. `<LodgingSectionStatusBanner>` summarizing live counts (active / inactive / total / setup hint)
3. Real `useLodgingCatalog` hook (already present in all 8 — verified) — confirm no mock arrays
4. Empty state via `<LodgingNeedsSetupEmptyState>` with primary + secondary actions

Sections to update:
- `LodgingChannelManagerSection.tsx` — quick-jump `lodge-channels`, banner counts active connections, empty-state CTAs to Rooms + Rate Plans
- `LodgingWellnessSection.tsx` — quick-jump `lodge-wellness`, banner counts services, empty-state CTAs to Add Service + Amenities
- `LodgingDiningSection.tsx` — quick-jump `lodge-dining`, banner counts meal plans, empty-state CTAs to Add Plan + Rate Plans
- `LodgingExperiencesSection.tsx` — quick-jump `lodge-experiences`, banner counts experiences, empty-state CTAs to Add Experience + Gallery
- `LodgingTransportSection.tsx` — quick-jump `lodge-transport`, banner counts transfers, empty-state CTAs to Add Transfer + Front Desk
- `LodgingStaffSection.tsx` — quick-jump `lodge-staff`, banner counts staff, empty-state CTAs to Add Member + Housekeeping
- `LodgingAmenitiesSection.tsx` — quick-jump `lodge-amenities`, banner counts amenities + policies set, empty-state CTA to Policies
- `LodgingPromotionsSection.tsx` — already has stat tiles; add `LodgingQuickJump` + `LodgingSectionStatusBanner` to match peers

### 2. Promotions — live redemption counts

The current Total redemptions tile sums `lodging_promotions.redemptions_used`, a denormalized counter that is only incremented if reservations write back to it. Replace with a single grouped query against `lodge_reservations`:

```sql
select promotion_code, count(*)
from lodge_reservations
where store_id = $1 and promotion_code is not null
group by promotion_code
```

- Map results into a `Record<code, count>` keyed by uppercase code
- Feed the per-row `Used` column and the Total redemptions stat from this map
- Fall back to `redemptions_used` if the query errors (defensive)

### 3. Verification (mandatory)

Run in order, report inline:

1. `tsc --noEmit` — must be clean
2. Open `/admin/lodging/qa-checklist` for store `7322b460-2c23-4d3d-bdc5-55a31cc65fab` (the store currently in preview) — capture pass / warning / fail counts
3. Run `tests/e2e/lodging-deeplinks.spec.ts` via `npx playwright test`
4. Spot-check live data with `supabase--read_query`:
   - `lodging_concierge_tasks` carries `source_message_id` for any inbox-bridged task
   - `lodge_reservations` shows the walk-in row created in Phase 4
   - `lodging_lost_found.photo_url` resolves to a public Storage URL
   - `lodging_promotions` redemption query returns expected aggregate

If any check fails, fix and re-run before declaring complete.

### Files

Modified (10):
- `src/components/admin/store/lodging/LodgingChannelManagerSection.tsx`
- `src/components/admin/store/lodging/LodgingWellnessSection.tsx`
- `src/components/admin/store/lodging/LodgingDiningSection.tsx`
- `src/components/admin/store/lodging/LodgingExperiencesSection.tsx`
- `src/components/admin/store/lodging/LodgingTransportSection.tsx`
- `src/components/admin/store/lodging/LodgingStaffSection.tsx`
- `src/components/admin/store/lodging/LodgingAmenitiesSection.tsx`
- `src/components/admin/store/lodging/LodgingPromotionsSection.tsx`
- `.lovable/plan.md`

No schema changes. No new components. Awaiting approval to implement.
