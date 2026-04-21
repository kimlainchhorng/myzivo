

# Five Workstreams: Calls, Chat, Receipts, Refunds, Admin Queue

Closing out the operational suite from the previous plan. All five tasks build on tables already created (`trip_messages`, `trip_call_sessions`, `receipts`, `ride_refund_requests`, `financial_ledger`).

---

## 1. Masked Calling — `create-masked-call-session` + In-Trip Call Button

Twilio Proxy API for number masking. Both parties dial a Twilio number that bridges to the real participant.

- Edge function `create-masked-call-session`:
  - Validates caller is rider or assigned driver via `is_trip_participant()`
  - Reuses existing active session if `expires_at > now()` and not closed
  - Otherwise creates Twilio Proxy Session, adds rider + driver as Participants with their real numbers
  - Returns proxy number for the caller, stores SID + masked numbers in `trip_call_sessions`
- Edge function `close-trip-call-sessions` (cron, every 5 min): finds rides where `status in ('completed','cancelled')` AND session `expires_at < now() - interval '5 min'`, calls Twilio to close the session, marks row `closed`
- New component `InTripCallButton` (Phone icon, emerald pill):
  - Tap → invokes `create-masked-call-session` → opens `tel:{proxyNumber}` via Capacitor `App.openUrl` (native) or `window.location.href` (web)
  - Shows toast "Calling driver via ZIVO" — explains masking
- Mounted in `RideTrackingPage` (rider-side) next to existing actions, and in driver job/active-trip screen
- Auto-expire fallback: `expires_at = trip_completion + 30 min` set at session create time

**Secrets needed**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PROXY_SERVICE_SID` — will request after approval

---

## 2. TripChatSheet + Moderation Pipeline

Realtime in-trip chat scoped per-ride.

- Component `TripChatSheet` (bottom sheet, glassmorphic per `media-panel-v2026-refined`):
  - Header: counterparty name + avatar + masked-call button
  - Message list: bubbles with status pills (sent / pending review / blocked)
  - Composer: 500-char limit, runs `sanitizeOutgoingMessage` + `assessChatMessageRisk` before send
  - Realtime subscription on `trip_messages` filtered by `ride_request_id`
  - Auto-scroll to bottom on new message
- Send flow:
  - Insert into `trip_messages` with `moderation_status = 'pending'`
  - Edge function `moderate-trip-message` invoked async — uses Lovable AI Gateway (`google/gemini-2.5-flash`) classifying as `clean | needs_review | blocked`
  - Updates row to `clean` (visible) / `pending_review` (sender only) / `blocked` (sender error toast)
- RLS: SELECT requires `is_trip_participant()` AND (`moderation_status = 'clean'` OR sender is self) — enforces hide-from-recipient for pending/blocked
- Admin moderation queue at `/admin/moderation/messages`:
  - Lists `moderation_status in ('pending_review','blocked')` with ride context, sender role, full body
  - Actions: Approve (→ clean), Confirm block, Warn sender (push notification)
- Mounted in `RideTrackingPage` (rider) + driver active-trip screen via floating chat FAB

---

## 3. PDF Receipts: `generate-trip-receipt` + Download Button

- Edge function `generate-trip-receipt`:
  - Input: `ride_request_id`
  - Loads ride, driver profile, payment intent details, surcharge breakdown
  - Renders PDF with `pdf-lib` (Deno-compatible) — ZIVO emerald header, line items, totals, payment method, partner disclosure footer
  - Uploads to `trip-receipts` bucket at `{user_id}/{ride_id}.pdf`
  - Inserts `receipts` row with `pdf_path`, `total_cents`, `email_sent_at`
  - Sends email via existing `send-transactional-email` with PDF attachment
- Wire into `stripe-ride-webhook` on `payment_intent.succeeded` — invoke `generate-trip-receipt` non-blocking after status update + ledger entry
- Idempotency: check `receipts` table by `reference_id` before regenerating
- Edge function `get-receipt-signed-url`: validates owner via JWT, returns 60-min signed URL for `trip-receipts/{user_id}/{ride_id}.pdf`
- Download button in ride history (`RideHistoryItem` / `BookingReceiptCard`):
  - "Download receipt" with Download icon
  - Calls `get-receipt-signed-url` → opens URL in new tab (web) or via Capacitor Browser (native)
  - Hidden if no `receipts` row exists for that ride

---

## 4. Refund Flow — `submit-refund-request` + `process-refund` + Ledger

**Edge functions**

- `submit-refund-request` (rider-invoked):
  - Validates: ride is `completed`, completion within 30 days, no existing `pending` request for this ride, rider is the requester
  - Inserts `ride_refund_requests` row with `status='pending'`, `requested_amount_cents` capped at trip total
  - Notifies admins via existing push engine
- `process-refund` (admin-invoked):
  - Input: `request_id`, `decision` (approve / partial / deny), `approved_amount_cents`, `notes`
  - Validates admin role via `has_role()`
  - On approve/partial: calls Stripe `refunds.create` against `payment_intent_id`, stores `stripe_refund_id`
  - Inserts `financial_ledger` row (`entry_type='refund'`, negative amount, `stripe_reference`)
  - Updates `ride_requests.payment_status` to `refunded` or `partial_refund`
  - Updates `ride_refund_requests.status` to `processed` or `denied`, sets `decided_by`, `decided_at`
  - Emails rider with outcome via `send-transactional-email`
- Auto-ledger entries already wired into `stripe-ride-webhook` (charge entry) and `driver-payout` (payout entry) — extend if missing

**Frontend (rider side)**
- "Request refund" button in completed-ride detail view
- Modal: category dropdown (overcharge / no_service / safety / other), description textarea (500 chars), amount input (capped, defaults to full)
- Calls `submit-refund-request`, shows status badge in ride history once submitted

---

## 5. Admin Refunds Page — `/admin/payments/refunds`

- Tabs: Pending / Approved / Denied / All
- Table columns: requested_at, rider, ride summary (pickup→dropoff), amount, reason, status
- Row click → side drawer with full context:
  - Ride details + map preview
  - Original payment intent (amount captured, surcharge, payment method last4)
  - Rider history: total trips, prior refunds count
  - Decision panel: Approve full / Approve partial (amount input) / Deny + notes textarea
- Submit → invokes `process-refund` → optimistic UI update → toast with Stripe refund ID on success
- Filters: date range (7d/30d/90d/all), category, min amount
- CSV export of decisions for accounting

---

## Technical Details

**New edge functions**
- `create-masked-call-session`, `close-trip-call-sessions` (cron)
- `moderate-trip-message`
- `generate-trip-receipt`, `get-receipt-signed-url`
- `submit-refund-request`, `process-refund`

**Updated edge functions**
- `stripe-ride-webhook` — invoke `generate-trip-receipt` after successful capture

**New components**
- `InTripCallButton`, `TripChatSheet`, `TripChatFab`
- `RequestRefundDialog`, `RefundStatusPill`
- `ReceiptDownloadButton`

**New pages**
- `/admin/moderation/messages` (`AdminMessageModerationPage`)
- `/admin/payments/refunds` (`AdminRefundsPage`)

**Cron**
- `close-trip-call-sessions` every 5 minutes via existing `pg_cron` setup

**Secrets needed**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PROXY_SERVICE_SID` (Twilio Proxy product)
- Lovable AI Gateway already available
- `STRIPE_SECRET_KEY` already set
- Email infrastructure already wired

**RLS additions**
- `trip_messages`: SELECT policy filters non-clean messages from non-senders
- `trip_call_sessions`: SELECT/INSERT via `is_trip_participant()`

---

## Build Order

1. Refund edge functions + admin page (closes financial loop)
2. PDF receipt generation + webhook wiring + download button
3. TripChatSheet + moderation pipeline + admin queue
4. Masked calling (Twilio secrets requested at this step)
5. Cron for session cleanup

Approve to switch to default mode and ship. Twilio secrets requested when workstream 4 starts.

