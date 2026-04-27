## Hotels & Resorts Audit — what's complete and what's not

I audited every layer (tabs, components, hooks, RLS, edge functions, DB tables). The system is ~95% wired, but I found two real bugs that block end-to-end workflows.

### What IS complete and working

- **25 lodging tabs** in `LODGING_TAB_IDS` — all match a component file and a sidebar entry in `StoreOwnerLayout.tsx`.
- **All 24 lodging tables** exist in the database (rooms, reservations, guests, housekeeping, maintenance, dining, experiences, transport, wellness, amenities, property_profile, policies, reviews, promotions, channel connections, payouts, messages, etc.).
- **13 lodging edge functions** deployed (deposits, refunds, change requests, receipts, iCal import/export, Stripe webhook, wiring monitor, etc.).
- **Hooks layer** (`useLodgingCatalog`, `useRoomAvailability`, `useLodgeBlocks`, etc.) wired to React Query.
- **Channel Manager** UI calls `lodging-ical-import` and exposes the public `lodging-ical-export` URL.

### Bugs found (need fixing)

**1. Guest Inbox and Hotel Staff tabs render blank**
Both tabs are listed in the registry, sidebar, and title map, AND the section components exist (`LodgingInboxSection.tsx`, `LodgingStaffSection.tsx`), BUT `AdminStoreEditPage.tsx` is missing the `<TabsContent value="lodge-inbox">` and `<TabsContent value="lodge-staff">` entries. Clicking either tab today shows an empty area.

**2. Two parallel room-blocks tables — iCal sync is disconnected from the app**
The database has both `lodge_room_blocks` and `lodging_room_blocks`. The split:
- App + booking-validation functions read/write `lodge_room_blocks` (availability, change requests, add-on eligibility, guest trip page, `useLodgeBlocks`, `useRoomAvailability`).
- `lodging-ical-import`, `lodging-ical-export`, and `LodgingCalendarSection` use `lodging_room_blocks`.

Result: iCal-imported OTA blocks don't actually prevent bookings, manual blocks made in the Calendar UI don't block reservations, and the iCal export feed misses real blocks. The Channel Manager looks like it works but doesn't actually protect inventory.

### Plan to fix

1. **Wire the missing tab content** in `AdminStoreEditPage.tsx`: add `<TabsContent value="lodge-inbox">…<LodgingInboxSection />` and `<TabsContent value="lodge-staff">…<LodgingStaffSection />` inside the lodging tabs block.

2. **Consolidate to a single `lodge_room_blocks` table** (the one already used by booking validation):
   - Migration: add any columns the iCal flow needs (`source` text — e.g. 'manual' / 'ical' / OTA name, `external_uid` text for iCal dedupe, unique index on `(room_id, block_date)`), copy any existing rows from `lodging_room_blocks` into `lodge_room_blocks`, then drop `lodging_room_blocks`.
   - Update `lodging-ical-import/index.ts`, `lodging-ical-export/index.ts`, and `LodgingCalendarSection.tsx` to read/write `lodge_room_blocks`.
   - Keep RLS aligned with the existing policies on `lodge_room_blocks`.

3. **Quick verification pass** after the fix: open Inbox + Staff tabs, run a Channel Manager sync, confirm imported blocks appear in the Calendar legend and that a booking attempt on a blocked date is rejected.

### Out of scope (already complete)

Tabs/components/hooks/RLS for the other 23 sections, deposits/refunds/Stripe webhook, completion meter, setup checklist, wiring monitor.
