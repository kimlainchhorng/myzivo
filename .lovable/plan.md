## Hotel & Resort upgrade — Phase 7

Phase 6 closed 10 operational sections. An audit shows 4 lodging sections still lack the v2026 consistency pattern: **Overview, Property Profile, Gallery, Payouts**. Additionally, `LodgingQuickJump` only surfaces 6 chips out of ~24 lodging tabs, so cross-section navigation is uneven. This phase finishes the consistency sweep and broadens QuickJump.

### 1. Apply pattern to the final 4 sections

For each, add `<LodgingQuickJump active="…">` and `<LodgingSectionStatusBanner>` at the top of the returned `SectionShell` body:

- `LodgingOverviewSection.tsx` — `active="lodge-overview"`, banner shows total rooms + active reservations, fix → Reservations
- `LodgingPropertyProfileSection.tsx` — `active="lodge-property"`, banner shows profile completeness % (use existing `PropertyCompletenessMeter` data), fix → Gallery
- `LodgingGallerySection.tsx` — `active="lodge-gallery"`, banner counts uploaded photos, fix → Property Profile
- `LodgingPayoutsSection.tsx` — `active="lodge-payouts"`, banner shows pending payout total (money-formatted), fix → Reports

### 2. Expand `LodgingQuickJump` chip set

Current chip list (6) is incomplete. Add the most-used operational tabs so the chip rail matches sidebar reality:

```text
Front Desk · Reservations · Housekeeping · Inbox · Concierge · Lost & Found
+ Overview · Calendar · Guests · Rooms · Rate Plans · Reports · Property
```

Keep the rail horizontally scrollable (already `overflow-x-auto`); no layout change needed. Use Lucide icons consistent with each section's existing icon (Hotel, CalendarDays, Users, BedDouble, Tags, BarChart3, Building2).

### 3. Verification (mandatory)

Run in order, report inline:

1. `tsc --noEmit -p tsconfig.app.json` — must be clean
2. `rg -L "LodgingQuickJump" src/components/admin/store/lodging/Lodging*Section.tsx` — must return zero results (every section has it)
3. `rg -L "LodgingSectionStatusBanner" src/components/admin/store/lodging/Lodging*Section.tsx` — must return zero results
4. Supabase smoke check on store `7322b460-2c23-4d3d-bdc5-55a31cc65fab`: query `lodge_reservations`, `lodge_rooms`, `lodge_payouts`, `store_media` row counts to confirm banners will render real numbers
5. Reload `/admin/stores/7322b460…?tab=lodge-overview` and review preview console logs for new errors

### Files (planned)

Modified (6):
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx`
- `src/components/admin/store/lodging/LodgingGallerySection.tsx`
- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx`
- `src/components/admin/store/lodging/LodgingQuickJump.tsx`
- `.lovable/plan.md`

No new components. No schema changes. No edge functions. No new imports beyond the 2 standard ones per section file.

### Outcome

After Phase 7, **all 28 lodging section files** carry the same QuickJump rail and status banner, and the rail itself surfaces 13 jump targets instead of 6 — closing the consistency sweep and making cross-section navigation symmetrical from any tab.
