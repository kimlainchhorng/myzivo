

# Two Real Gaps to Close

Audit shows four of the five asks are already shipped end-to-end. Two genuine gaps remain.

---

## Already Live (no work needed)

- **Admin refunds workflow** — `/admin/payments/refunds` supports approve / partial / deny, shows `stripe_refund_id`, and `process-refund` writes a `financial_ledger` entry with the **exact approved amount** (negative cents) plus an `admin_actions` audit row.
- **Partial-approval ledger accuracy** — `process-refund` uses the capped `amount` (not the requested amount) for both the Stripe call and the ledger insert.
- **Signed receipt download** — `ReceiptDownloadButton` is mounted in expanded trip rows of `RideTripHistory.tsx` and calls `get-receipt-signed-url` for completed rides.

I'll skip these and ship the two outstanding items.

---

## 1. Inline Moderation in `TripChatSheet` (admin view)

Today admins can only moderate from `/admin/moderation/messages`. Add inline review when an admin opens any trip chat.

- New prop on `TripChatSheet`: `adminMode?: boolean` (auto-detected via `has_role('admin')` cached in `useAuth`)
- When `adminMode`:
  - Show all messages regardless of `moderation_status` (bypass the current sender-only filter)
  - Each message bubble gains a status pill: `clean` (emerald), `pending` / `pending_review` (amber), `blocked` (red)
  - For non-clean messages, show two icon buttons under the bubble: **Approve** (Check) → sets `moderation_status='clean'`; **Block** (ShieldAlert) → sets `moderation_status='blocked'`
  - Both actions call a new edge function `admin-moderate-message` that verifies `has_role('admin')` and updates the row + writes an `admin_actions` audit entry
- Realtime subscription already in place will propagate the status change to the rider/driver instantly
- New route flag: open `TripChatSheet` from the admin moderation page row → "Open in chat context" so admins see surrounding messages

---

## 2. Immediate Call-Session Closure on Ride Terminal Status

Today sessions only close via the 5-min cron. Add an immediate trigger.

- New Postgres trigger `trg_close_call_sessions_on_ride_end` on `ride_requests` AFTER UPDATE:
  - Fires when `NEW.status` transitions into `('completed','cancelled','no_show','expired')`
  - Uses `pg_net.http_post` to invoke a new edge function `close-ride-call-session` with `{ ride_request_id }`
- New edge function `close-ride-call-session`:
  - Looks up `trip_call_sessions` row for the ride
  - Calls Twilio Proxy API to close the session (`Status=closed`)
  - Sets `expires_at = now()` and clears `twilio_proxy_session_sid` so further dial attempts re-allocate or fail cleanly
- Existing cron-based `close-trip-call-sessions` stays as a safety net for missed triggers (network failures, etc.)
- Update `create-masked-call-session` to refuse creation when ride is in a terminal status (defense in depth)

---

## Technical Details

**New edge functions**
- `admin-moderate-message` — admin-gated approve/block for `trip_messages`
- `close-ride-call-session` — single-ride immediate Twilio session teardown

**Updated files**
- `src/components/rides/TripChatSheet.tsx` — admin mode, status pills, approve/block controls
- `supabase/functions/create-masked-call-session/index.ts` — terminal-status guard

**Database migration**
- Trigger function `public.notify_close_call_session()` calling `net.http_post` to the new edge function
- AFTER UPDATE trigger on `ride_requests` filtered to terminal-status transitions
- Requires `pg_net` extension (already enabled per prior cron work)

**Auth**
- `admin-moderate-message` validates JWT + `has_role(uid, 'admin')`
- `close-ride-call-session` accepts service-role auth from the trigger; rejects anonymous calls

---

## Build Order

1. Database trigger + `close-ride-call-session` function (closes safety gap first)
2. `admin-moderate-message` function
3. `TripChatSheet` admin mode UI

Approve to switch to default mode and ship.

