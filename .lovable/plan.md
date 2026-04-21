

# Five Admin Hardening Tasks

Compliance, audit, and reliability hardening for the moderation + masked-call subsystems just shipped.

---

## 1. Admin Test Checklist Page — `/admin/qa/moderation`

A self-contained QA harness so you can verify the full moderation loop without leaving the admin area.

- New page `AdminModerationQAPage`:
  - **Step 1**: Input box for `ride_request_id` (with a "pick recent ride" dropdown that lists last 10 rides with messages)
  - **Step 2**: "Open chat in admin mode" button → mounts `TripChatSheet` with `adminMode` and the chosen ride
  - **Step 3**: Live checklist with realtime checkmarks:
    - ✅ Message visible regardless of status
    - ✅ Approve button updates `moderation_status='clean'` (verified via realtime)
    - ✅ Block button updates `moderation_status='blocked'`
    - ✅ Matching `admin_actions` row appears (subscribed to `admin_actions` filtered to current admin + last 60s)
  - Each check auto-flips green when the corresponding event is observed; red if not seen within 5s of the action
- Route registered in `App.tsx` behind `RequireAdmin`

---

## 2. CSV Export of Message Moderation Actions

- New button "Export CSV" on `/admin/moderation/messages` (top-right)
- Filters reused from current page (status, date range)
- Calls new edge function `export-moderation-actions-csv`:
  - Admin-gated via `has_role('admin')`
  - Joins `admin_actions` (where `action_type IN ('approve_message','block_message')`) with `trip_messages` for the moderated body + sender
  - Streams CSV: `message_id, ride_request_id, sender_id, decision, admin_id, decided_at, reason, message_excerpt`
  - Returns `text/csv` with `Content-Disposition: attachment; filename="moderation-{date}.csv"`
- Frontend triggers download via blob URL

---

## 3. Audit Log + Admin View for Masked Call Closures

**Database**
- New table `call_session_closure_audit`:
  - `id uuid pk`, `ride_request_id uuid`, `twilio_proxy_session_sid text`, `closure_source text` (`trigger` | `cron` | `manual` | `terminal_status_guard`), `twilio_status text` (`closed` | `not_found` | `error`), `twilio_response_code int`, `error_message text`, `attempt_number int default 1`, `created_at timestamptz default now()`
  - RLS: SELECT for admin only; INSERT via service role from edge functions

**Edge function changes**
- `close-ride-call-session` and `close-trip-call-sessions` (cron) both write an audit row per attempt with the Twilio response status
- `closure_source` set per caller

**Admin UI**
- New page `/admin/operations/call-closures`:
  - Table: ride id, session SID, source, twilio status, attempt #, error (if any), timestamp
  - Filters: source, status (success/error), date range (24h / 7d / 30d)
  - Row click → expands to show full error message + retry button (admin manual close)
  - Realtime subscription so new closures appear live

---

## 4. Retry Mechanism for Twilio Teardown

Wrap Twilio close calls with bounded exponential backoff so transient 5xx / network failures don't leave sessions open.

- New shared helper inside `close-ride-call-session/index.ts` and reused via copy in `close-trip-call-sessions`:
  - `closeWithRetry(sessionSid)` — up to 3 attempts, delays 500ms / 1.5s / 4s
  - Retry on: network error, HTTP 5xx, HTTP 429
  - No retry on: 404 (already closed), 401/403 (credential issue — alert)
  - Each attempt writes its own `call_session_closure_audit` row with `attempt_number`
- Final failure path:
  - Marks the `trip_call_sessions` row with `closure_failed_at = now()` (new column) so it's surfaced in the admin audit view
  - The 5-min cron picks it up again and retries from scratch — provides a second-tier safety net
- Schema addition: `trip_call_sessions.closure_failed_at timestamptz null`, `trip_call_sessions.closure_attempts int default 0`

---

## 5. Server-Validated `adminMode` in `TripChatSheet`

Today `adminMode` is a prop — anyone who can render the component with that prop set can see admin controls (client-side bypass risk).

- Inside `TripChatSheet`, **always** re-verify admin role server-side before honoring `adminMode`:
  - On mount, call `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })`
  - Local state `verifiedAdmin: boolean` starts `false`
  - Render admin controls (status pills, Approve/Block buttons, all-messages view) only when `adminMode && verifiedAdmin`
- All admin-only network calls (the `admin-moderate-message` invoke) already enforce this server-side, but UI gating prevents misleading affordances for non-admins
- Also guards against prop drilling mistakes in future code
- Add a one-line console warning (dev only) if `adminMode=true` but `verifiedAdmin=false` after 2s, to surface accidental misuse during development

---

## Technical Details

**New edge functions**
- `export-moderation-actions-csv` — admin-gated CSV streaming

**Updated edge functions**
- `close-ride-call-session` — retry loop + audit insert
- `close-trip-call-sessions` (cron) — retry loop + audit insert

**Updated components**
- `src/components/rides/TripChatSheet.tsx` — server-verified admin gate
- `src/pages/admin/AdminMessageModerationPage.tsx` — CSV export button

**New pages**
- `src/pages/admin/AdminModerationQAPage.tsx` → `/admin/qa/moderation`
- `src/pages/admin/AdminCallClosuresPage.tsx` → `/admin/operations/call-closures`

**Database migration**
- `call_session_closure_audit` table + RLS (admin SELECT, service role INSERT)
- `trip_call_sessions.closure_failed_at`, `trip_call_sessions.closure_attempts` columns

**Routes (App.tsx)**
- `/admin/qa/moderation` (admin)
- `/admin/operations/call-closures` (admin)

---

## Build Order

1. Migration: `call_session_closure_audit` + new `trip_call_sessions` columns
2. Retry helper + audit writes in both close-* functions
3. Admin call-closures audit page
4. CSV export function + button
5. Admin QA checklist page
6. Server-verified admin gate in `TripChatSheet`

Approve to switch to default mode and ship.

