## Hotels & Resorts — Phase 5 (Operational Polish)

Phase 4 finished iCal sync, Guest Inbox, and Hotel Staff. Phase 5 closes out the original "Operational polish" list so day-to-day hotel runners get fast, focused tools on the seven heaviest tabs.

---

### 1. Reservations — power-user filters & exports

- Quick-filter chip row above the table: **All / Today's arrivals / In-house / Departing today / Unpaid / VIP / Cancelled**.
- "Export CSV" button → downloads the current filtered set (number, guest, room, dates, status, total, balance).
- New row action **Send confirmation** → opens a prefilled mailto with reservation details (no new edge function needed).
- Search box (guest name / number / phone).

### 2. Calendar — visual upgrades

- Color legend strip at the top (Confirmed / Pending / Checked-in / Blocked / OTA-imported).
- Reservation bars get a right-edge drag handle to extend stay (updates `check_out` + `nights`).
- "Block date range" dialog (room → start → end → reason) writing into `lodge_room_blocks` per day.
- OTA-imported blocks (from `lodging_room_blocks`) shown with channel-colored badges so owners can tell where a block came from.

### 3. Front Desk — speed shortcuts

- Sticky "Walk-in booking" button → opens the existing new-reservation dialog pre-filled with today's date and a generated number.
- Per-row inline approve/decline for late-checkout requests (writes to `lodge_reservation_change_requests`).
- Key-card status pill per checked-in reservation (Issued / Returned) with one-tap toggle stored in reservation `notes` (no schema change).

### 4. Housekeeping — staff-aware

- "Assign to" dropdown sourced from the new **Hotel Staff** tab, filtered to `lodging_role = housekeeping`. Persists to `lodge_housekeeping.assignee_id`.
- Priority flag toggle (high / normal) stored in `notes` JSON tail (no migration needed).
- Photo upload on completion using the existing `lodging-uploads` bucket; URL stored in `notes`.

### 5. Property Profile — guest essentials

Add a new "Guest essentials" card with:
- Wi-Fi SSID + password (with "show on guest screens" toggle).
- Local emergency contacts (police, medical, fire — each name + phone).
- Languages spoken at front desk (multi-select chips, reusing existing `languages` column).
- Accepted ID types (Passport / National ID / Driver's license — checkboxes).

Stored in `lodge_property_profile.contact` JSONB (already exists, just extend the shape).

### 6. Overview — accurate "Next best action"

The current NBA points at read-only-style targets. Rewrite the priority chain to point at the new editors:

1. No rooms → **Rooms & Rates**
2. Rooms but no rates → **Rate Plans**
3. No meal plans → **Dining & Meal Plans**
4. No staff (≥5 rooms) → **Hotel Staff**
5. No channel connections → **Channel Manager**
6. No promotions → **Promotions & Discounts**
7. Reviews waiting on reply → **Reviews**

### 7. Setup checklist & completion meter

`src/lib/lodging/lodgingCompletion.ts` should include the new sections so progress % reflects reality:

- Promotions: optional (not required, but counts toward "polish" tier).
- Channel Manager: optional.
- Hotel Staff: required for properties with ≥5 rooms.
- Guest essentials (Wi-Fi + emergency): required.

### 8. Backend changes

No new tables. One small migration only:

- `lodge_housekeeping`: ensure `assignee_id` indexes exist (already a column).
- No schema changes for Property Profile (extends existing `contact` JSONB).

Everything else is UI + write logic against existing tables.

### 9. Out of scope (still)

- Real-time PMS integrations (Opera/Cloudbeds).
- Auto-scheduled review/messaging emails — manual triggers only.
- Multi-property group dashboard.
- Native restaurant/spa POS billing.

---

### Build order

1. Reservations: filters + CSV + confirmation action + search.
2. Calendar: legend + drag-extend + block-range dialog + OTA badges.
3. Front Desk: walk-in shortcut + late-checkout approval + key-card pill.
4. Housekeeping: staff-driven assign + priority + photo upload.
5. Property Profile: Guest essentials card.
6. Overview: rewrite NBA priority chain.
7. Setup checklist & completion meter: include new sections.

Approve to ship Phase 5.
