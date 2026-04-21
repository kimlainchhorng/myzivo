

# Five Operational Workstreams

Building admin oversight, in-trip safety, and post-trip financial controls.

---

## 1. Admin Trip Density & Cancellation Heatmap

New route `/admin/operations/heatmap` — Google Maps overlay visualizing operational hotspots.

- Edge function `admin-trip-heatmap` — aggregates `ride_requests` by H3-style geohash buckets (lat/lng rounded to 3 decimals ≈ 110m grid), grouped by `created_at` window
- Returns two layers: `completed_trips` (intensity = count) and `cancellations` (intensity = count, separate color)
- Filters: 7d / 30d toggle, time-of-day slider, vehicle class
- Map renders Google Maps `HeatmapLayer` with two overlays (emerald for trips, red for cancellations)
- Side panel: top 10 cancellation hotspots with cancel rate %, top 10 demand hotspots with avg fare
- CSV export of bucket data

---

## 2. In-Trip Chat + Masked Calling + Moderation

Extends existing `unified-chat-hub` pattern, scoped to active rides.

**Chat**
- New table `trip_messages` (ride_request_id, sender_id, sender_role [rider/driver], body, moderation_status, created_at)
- RLS: only rider + assigned driver of that ride can read/write; auto-archive 24h after `completed`
- Realtime subscription on `trip_messages` filtered by ride id
- New component `TripChatSheet` rendered in `RideTrackingPage` (rider) and driver job screen
- Reuses existing `chatContentSafety.ts` for outgoing sanitization + URL risk scoring

**Masked calling (Twilio Programmable Voice proxy)**
- New table `trip_call_sessions` (ride_request_id, twilio_proxy_session_sid, rider_proxy_number, driver_proxy_number, expires_at)
- Edge function `create-masked-call-session` — uses Twilio Proxy API to allocate a session with rider+driver as participants; both see Twilio number, real numbers stay hidden
- Tap-to-call button in `TripChatSheet` → calls function → `tel:` link with proxy number
- Auto-expire session 30 min after trip completion

**Moderation**
- Edge function `moderate-trip-message` — lightweight keyword + URL safety check + Lovable AI Gateway (`google/gemini-2.5-flash`) classification for harassment/scam/PII
- Messages flagged as `pending_review` are visible to sender but hidden from recipient until cleared; `blocked` messages return error to sender
- New admin queue at `/admin/moderation/messages` to review flagged content

---

## 3. Driver Rating & Abuse Review + Temporary Flagging

New route `/admin/drivers/moderation`.

- New table `driver_flags` (driver_id, reason, flagged_by, flagged_until, active, related_report_id)
- New table `abuse_reports` (reporter_id, reported_user_id, ride_request_id, category [unsafe_driving/harassment/no_show/other], description, status [open/reviewing/resolved/dismissed], resolution_notes)
- Page lists in three tabs:
  1. **Low ratings** — joins `ride_requests.driver_rating <= 2` with driver profile, last 30d, sortable by frequency
  2. **Abuse reports** — open queue with report details + ride context
  3. **Active flags** — currently flagged drivers with countdown to auto-unflag
- Action buttons: Dismiss, Warn (sends notification via existing push engine), Flag 24h / 7d / 30d / Permanent
- Update `dispatch-ride` to filter out drivers with active rows in `driver_flags` where `flagged_until > now()`
- Audit log entry to `admin_actions` table for every moderation decision

---

## 4. PDF Receipts (Rides + Orders)

Server-side generation, emailed automatically + downloadable from history.

- New edge function `generate-trip-receipt` — uses `pdf-lib` (Deno-compatible) to render branded ZIVO PDF with:
  - Header: ZIVO logo, "Receipt", trip ID, date
  - Trip details: pickup → dropoff, distance, duration, vehicle, driver name + photo
  - Line items: base fare, distance, time, surcharge (3.5% KH card), discounts, ZIVO+ benefits
  - Payment breakdown: subtotal, taxes, total, payment method (Visa •••• 4242)
  - Footer: support contact, legal disclaimer
- Stores PDF in private storage bucket `trip-receipts` (path: `{user_id}/{ride_id}.pdf`)
- Triggered by:
  - `stripe-ride-webhook` on `payment_intent.succeeded` (manual capture)
  - Order completion event (existing order flow)
- Sends email via existing Lovable Email infrastructure (`send-transactional-email`) with PDF attachment, subject "Your ZIVO ride receipt — {date}"
- Frontend: download button in ride/order history calls signed URL endpoint
- Reuses existing `BookingReceiptCard` styling for visual consistency
- New table `receipts` (id, type [ride/order], reference_id, user_id, pdf_path, email_sent_at, total_cents)

---

## 5. Refund Request Flow + Ledger

Rider-initiated, admin-reviewed, Stripe-executed, ledger-tracked.

**Tables**
- `refund_requests` (id, ride_request_id OR order_id, requester_id, reason_category [overcharge/no_service/safety/other], description, requested_amount_cents, status [pending/approved/partial/denied/processed], decided_by, decided_at, stripe_refund_id)
- `financial_ledger` (id, user_id, ride_request_id, entry_type [charge/refund/payout/fee/surcharge], amount_cents, currency, balance_after_cents, stripe_reference, created_at) — append-only audit trail

**Flow**
- Rider tab in ride history: "Request refund" → form with category + reason + amount (capped at trip total)
- Edge function `submit-refund-request` — validates trip is `completed`, within 30 days, no existing pending request; inserts row + notifies admin
- Admin queue at `/admin/payments/refunds` — shows request, ride context, payment intent, rider history
- Approve/partial/deny actions:
  - Approved → edge function `process-refund` calls Stripe `refunds.create` against the PaymentIntent, writes refund ledger entry, emails rider, updates `ride_requests.payment_status = 'refunded'` (or `partial_refund`)
  - Denied → emails rider with reason
- Auto-ledger entries:
  - On `payment_intent.succeeded` (charge entry)
  - On refund (refund entry)
  - On driver payout (payout entry)
  - On platform fee (fee entry)
- Rider-facing "Transactions" view at `/account/transactions` reads from `financial_ledger`

---

## Technical Details

**New tables**
- `trip_messages`, `trip_call_sessions` (RLS: trip participants only)
- `driver_flags`, `abuse_reports` (RLS: admin write, driver reads own flags)
- `receipts` (RLS: owner read, service role write)
- `refund_requests` (RLS: requester + admin)
- `financial_ledger` (RLS: owner read, service role write only — append-only)

**New storage bucket**
- `trip-receipts` (private, signed URLs only)

**New edge functions**
- `admin-trip-heatmap`, `create-masked-call-session`, `moderate-trip-message`
- `generate-trip-receipt`, `submit-refund-request`, `process-refund`

**Updated edge functions**
- `dispatch-ride` — exclude flagged drivers
- `stripe-ride-webhook` — trigger receipt generation + ledger entries

**Secrets needed**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PROXY_SERVICE_SID` (for masked calling — will request after approval)
- Lovable AI Gateway already available for moderation

**Pages**
- `/admin/operations/heatmap`
- `/admin/moderation/messages`
- `/admin/drivers/moderation`
- `/admin/payments/refunds`
- `/account/transactions`
- Refund request modal in ride history

---

## Build Order

1. Driver moderation + flagging (immediate safety value, blocks bad actors from dispatch)
2. PDF receipts + ledger foundation (compliance + financial baseline)
3. Refund flow (depends on ledger)
4. In-trip chat + moderation (Twilio masked calling needs secrets)
5. Admin heatmap (read-only analytics, lowest risk)

Approve to switch to default mode and ship. Twilio secrets requested when workstream 4 begins.

