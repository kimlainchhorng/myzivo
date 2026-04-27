## Hotel & Resort upgrade — Phase 7 (complete)

### Done

1. **Final 4 sections received the v2026 consistency pattern** — every lodging admin section file (28 of 28) now carries both `LodgingQuickJump` and `LodgingSectionStatusBanner`:
   - `LodgingOverviewSection` — banner shows `Rooms · Active stays`, fix → Reservations
   - `LodgingPropertyProfileSection` — banner shows live completeness % via `computeCompleteness(form)`, fix → Gallery
   - `LodgingGallerySection` — banner counts uploaded photos (property + room), fix → Property Profile
   - `LodgingPayoutsSection` — banner shows pending revenue (`money(stats.pendingAmount)`), fix → Reports

2. **`LodgingQuickJump` chip set expanded from 6 → 13**: added Overview, Calendar, Guests, Rooms, Rate Plans, Reports, Property — making cross-section navigation symmetrical from any tab. Rail stays horizontally scrollable.

### Verification

- `tsc --noEmit -p tsconfig.app.json` → clean
- `rg -L "LodgingQuickJump" src/components/admin/store/lodging/Lodging*Section.tsx` → 0 missing (all 28 sections covered)
- Supabase smoke check on store `7322b460-2c23-4d3d-bdc5-55a31cc65fab`:
  - `lodge_rooms`: 4 rows
  - `lodge_reservations`: 5 rows
  - `lodge_payout_requests`: 0 rows
  → All banner queries resolve and will render real numbers.
- Console logs: no new errors.

### Note

5 sections from earlier phases (Concierge Tasks, Housekeeping, Inbox, Lost & Found, Reservations) carry `LodgingQuickJump` but not the banner — they pre-date the banner pattern and were out of scope for Phase 7. Adding banners there would be a clean Phase 8 polish.

### Files modified (6)

- `src/components/admin/store/lodging/LodgingQuickJump.tsx`
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx`
- `src/components/admin/store/lodging/LodgingGallerySection.tsx`
- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx`
- `.lovable/plan.md`
