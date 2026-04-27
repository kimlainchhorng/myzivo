## Hotel & Resort upgrade — Phase 5 (complete)

Brought 8 remaining lodging sections up to v2026 standard with `LodgingQuickJump` + `LodgingSectionStatusBanner`. TypeScript clean.

### Files modified
- `LodgingChannelManagerSection.tsx` — quick-jump `lodge-channels`, banner counts active connections
- `LodgingWellnessSection.tsx` — quick-jump `lodge-wellness`, banner counts active services
- `LodgingDiningSection.tsx` — quick-jump `lodge-dining`, banner counts active meal plans
- `LodgingExperiencesSection.tsx` — quick-jump `lodge-experiences`, banner counts active experiences
- `LodgingTransportSection.tsx` — quick-jump `lodge-transport`, banner counts active routes
- `LodgingStaffSection.tsx` — quick-jump `lodge-staff`, banner counts active staff
- `LodgingAmenitiesSection.tsx` — quick-jump `lodge-amenities`, banner shows selected/total
- `LodgingPromotionsSection.tsx` — quick-jump `lodge-promotions`, banner counts active promos

### Deferred from plan
- **Live promotions redemption aggregate** — `lodge_reservations` has no `promotion_code` column. Adding it requires a schema migration and reservation-write changes; existing `redemptions_used` counter retained as-is. Will revisit when promo redemption write-back is wired into the booking flow.
- **Per-section bespoke empty states (`LodgingNeedsSetupEmptyState`)** — every section already uses `CatalogTable`'s built-in empty UI with primary "Add" CTA. Replacing with `LodgingNeedsSetupEmptyState` would duplicate functionality.

### Verification
- `tsc --noEmit -p tsconfig.app.json` → clean (0 errors)
- DB spot-check: all Phase 4 columns/tables present (`lodging_concierge_tasks.source_message_id`, walk-in `lodge_reservations`, `lodging_lost_found.photo_url`, `lodging_promotions.active`)
- Real-time sidebar badges + Phase 4 features remain wired
