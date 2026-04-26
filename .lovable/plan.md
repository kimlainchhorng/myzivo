## Hotels & Resorts — Phase 4 (Final Completion Pass)

Phases 1–3 shipped: 8 new tables, 6 stub tabs converted to editors (Dining, Experiences, Wellness, Transport, Policies, Reviews), and 3 new tabs (Promotions, Channel Manager, Payouts). This phase finishes the remaining items from the original plan.

---

### 1. iCal sync (Channel Manager backend)

Two edge functions to make the Channel Manager actually move data:

- **`lodging-ical-import`** — Fetches external iCal feeds from `lodging_channel_connections.ical_import_url`, parses VEVENTs, and writes blocked dates into `room_availability` (status = `blocked`, source = channel name). Updates `last_sync_at` and `status`. Triggered manually from the UI ("Sync now" button) and on a daily cron.
- **`lodging-ical-export`** — Public endpoint `/functions/v1/lodging-ical-export?token=...` that serves a valid `.ics` feed of all confirmed reservations + manual blocks for the room matching `ical_export_token`. No auth (token is the secret).

Wire the Channel Manager UI's "Sync now" button to invoke the import function and surface success/error toasts.

### 2. Guest Inbox / Messaging (`lodge-inbox`)

New tab under OPERATIONS. One thread per reservation, scoped to the property:

- New table `lodging_messages` (store_id, reservation_id, guest_id, sender_role, body, attachments jsonb, read_at).
- Inbox UI: left list of reservations with unread badge + last-message preview; right pane is the thread (guest bubbles vs. staff bubbles, send box, quick replies for "Pre-arrival info", "Wi-Fi", "Late checkout").
- Templates: pre-arrival, in-stay check, post-stay thank-you (manual send for now; auto-send is out of scope).

### 3. Lodging-aware Staff / Employees (`lodge-staff`)

The current `employees` tab is generic and shows zeros for hotels. Add a hospitality-shaped wrapper that reuses `store_employees`:

- New section component `LodgingStaffSection.tsx` that lists employees with hotel role chips: **Front Desk**, **Housekeeping**, **Maintenance**, **F&B**, **Spa**, **Concierge**, **Manager**.
- Quick-add dialog with role + shift (Morning / Afternoon / Night) + phone.
- Workload column: # of housekeeping tasks assigned today (Housekeeping role) / # of check-ins handled (Front Desk).
- Wires the Housekeeping tab's "assign to" dropdown to the same staff list (already noted in plan polish).

Stored on existing `store_employees` table with a `lodging_role` and `shift` column added via migration — no new table needed.

### 4. Operational polish

- **Overview**: rewrite "Next best action" to point at the new editors (Dining, Promotions, Channel Manager) when those are empty.
- **Calendar**: drag handle on reservation bars to extend stay (updates `check_out`); colored legend (Confirmed / Pending / Blocked / OTA); range block-out dialog.
- **Reservations**: quick-filter chips (Today arrivals / In-house / Departing / Unpaid / VIP); "Export CSV" button; "Send confirmation" action on row.
- **Front Desk**: walk-in booking shortcut (opens new-reservation dialog pre-set to today); late-checkout request approval inline.
- **Housekeeping**: assign dropdown sourced from new Staff tab; priority flag toggle; photo upload field on task completion (uses existing storage).
- **Property Profile**: add Wi-Fi SSID + password (guest-visible flag), local emergency contacts (police/medical), languages spoken, accepted ID types.
- **Setup Checklist & Completeness Meter**: include the new sections (Promotions optional, Channel Manager optional, Staff required for >5 rooms) so progress % reflects reality.

### 5. Backend changes

Single migration:

- `lodging_messages` table + RLS (store owner / admin read/write; guest can read their own thread via `guest_id`).
- `store_employees` add columns `lodging_role text`, `shift text`.
- `room_availability` add columns `source text` (manual / booking_com / airbnb / expedia / agoda) and `external_uid text` for iCal dedupe.

### 6. Out of scope (still)

- Real-time PMS (Opera/Cloudbeds) — iCal only.
- Auto-scheduled review/messaging emails — manual triggers only.
- Group/multi-property dashboard.

---

### Build order

1. Migration: `lodging_messages`, `store_employees` columns, `room_availability` columns.
2. Edge functions `lodging-ical-import` and `lodging-ical-export`; wire "Sync now" in Channel Manager.
3. Guest Inbox section + tab registration.
4. Lodging Staff section + tab registration; feed Housekeeping assign dropdown.
5. Polish pass: Overview NBA, Calendar drag/legend, Reservations filters/export, Front Desk walk-in, Housekeeping assign/photo, Property Profile Wi-Fi/emergency.
6. Update setup checklist & completeness meter.

Approve to ship this batch.
