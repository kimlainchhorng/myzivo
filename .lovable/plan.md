

# Five Follow-Up Workstreams

Building on the MVP foundation just shipped. All five tasks are independent and can ship in one batch.

---

## 1. Admin Ads Analytics Page

New route `/admin/ads/analytics` — unified view across Google + Meta.

- Reads from `ad_campaigns` (spend, impressions, clicks) and `conversion_events` (revenue, event types) tables already created
- Joins `conversion_events` to `ride_requests` via `external_id` to attribute revenue to actual dispatched trips
- Top KPI row: Total Spend, Total Revenue, ROAS, Conversions, Cost-per-Trip
- Per-platform breakdown cards (Google vs Meta) with the same metrics
- Table of recent conversion events (event_name, source, value, ride link, sent_at)
- Date range filter (7d / 30d / 90d), CSV export button
- Pattern mirrors existing `AdsStudioAnalytics.tsx` for consistency

---

## 2. Driver Onboarding — Document Upload & Verification Checklist

New page in driver app: `/driver/onboarding/documents`.

- New table `driver_documents` (driver_id, doc_type, file_url, status [pending/approved/rejected], reviewed_by, rejection_reason, uploaded_at)
- Required document types: Driver's License (front + back), Vehicle Registration, Insurance, Profile Photo, Vehicle Photo
- Storage bucket `driver-documents` (private, RLS: driver writes own, admin reads all)
- Checklist UI with status pills (Not uploaded / Pending review / Approved / Rejected with reason)
- Upload uses existing direct-to-Storage pattern (>4MB) per memory
- Block "Go Online" toggle in driver app until all docs are `approved` — gate via `useDriverVerification` hook
- Admin review queue at `/admin/drivers/verification` — approve/reject with reason

---

## 3. Share Trip Status (Live Pickup/ETA Link)

Public read-only tracking page anyone with a token can view.

- New table `trip_shares` (id, ride_request_id, share_token [unique], created_by, expires_at, revoked)
- Edge function `create-trip-share` — generates token, returns `https://hizivo.com/track/{token}`
- New public route `/track/:token` — shows driver name, vehicle, live ETA, map with driver marker, trip status
- Subscribes to `ride_requests` Realtime channel filtered by ride id resolved from token (server-side via edge function `get-shared-trip`)
- Auto-expires when ride status is `completed` or `cancelled`, or after 4 hours
- "Share my trip" button in `RideTrackingPage` → bottom sheet with copy link, native share (Web Share API + Capacitor Share), SMS/WhatsApp deep links

---

## 4. pg_cron Job for dispatch-escalate

pg_cron minimum interval is 1 second but practically scheduled per-minute via cron syntax. To run every 15s, schedule four staggered jobs.

- Enable `pg_cron` and `pg_net` extensions (if not already)
- Insert four cron entries: at `0`, `15`, `30`, `45` seconds of every minute, each calling `dispatch-escalate` via `net.http_post` with the project URL + anon key
- Uses the insert tool (not migration) because URL + key are project-specific per the scheduling guidance

---

## 5. Stripe Webhook Verification & Status Sync

`stripe-ride-webhook` function already exists. Needs registration + verification.

- Confirm `STRIPE_WEBHOOK_SECRET` is wired (already added)
- Endpoint URL: `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/stripe-ride-webhook`
- Required events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `payment_intent.amount_capturable_updated` (already handled in code)
- Add new admin diagnostics page `/admin/payments/webhook-status` showing last 50 webhook deliveries, ride payment status distribution, mismatch alerts (rides with PaymentIntent but no webhook update >5min old)
- New table `webhook_events` (event_id unique, event_type, ride_request_id, status, raw_payload, received_at) — populated by webhook for audit + idempotency
- Update `stripe-ride-webhook` to write to `webhook_events` and skip duplicates by `event_id`

User must register the webhook URL in Stripe Dashboard → Developers → Webhooks → Add endpoint, selecting the four events above. Plan includes a one-screen "Setup Stripe Webhook" admin guide page with the URL pre-formatted to copy.

---

## Technical Details

**New tables**
- `driver_documents` (RLS: driver own + admin all)
- `trip_shares` (RLS: creator own + public select via token-resolving edge function only)
- `webhook_events` (RLS: admin only; service role inserts)

**New storage bucket**
- `driver-documents` (private)

**New edge functions**
- `create-trip-share`, `get-shared-trip`

**Updated edge functions**
- `stripe-ride-webhook` — add idempotent `webhook_events` insert

**New routes**
- `/admin/ads/analytics`
- `/admin/drivers/verification`
- `/admin/payments/webhook-status`
- `/driver/onboarding/documents`
- `/track/:token` (public)

**Cron**
- 4× pg_cron entries staggered 0/15/30/45s for `dispatch-escalate`

**Hooks**
- `useDriverVerification` — gates `Go Online` based on `driver_documents` approval

---

## Build Order

1. Webhook idempotency table + admin status page (closes the payments loop first)
2. pg_cron schedule (unblocks autonomous dispatch)
3. Driver document upload + admin verification queue
4. Share trip status (rider-facing)
5. Admin ads analytics page

Approve to switch to default mode and ship.

