

# Hotels & Resort — Wiring report exports, payment liveness, idempotency & monitoring

Five upgrades that finish the diagnostics + Stripe-safety story.

## 1. CSV export of the wiring-check report

In `AdminLodgingWiringCheckPage.tsx`:

- New `Export CSV` button in the page header (next to `Re-run`).
- Util `src/lib/admin/wiringReportCsv.ts` builds CSV with columns:
  `run_at_iso, group, check_id, name, pass, severity, message, fix_sql`
  Header row + UTF-8 BOM so Excel opens it cleanly. `fix_sql` is wrapped in quotes with `"` escaped.
- File name: `lodging-wiring-report-{YYYYMMDD-HHmm}.csv`, downloaded via Blob + `URL.createObjectURL`.
- Also persist the latest report snapshot to a new table `lodging_wiring_report_runs (id, ran_at, summary jsonb, pass_count int, fail_count int, ran_by uuid)` on every run, so monitoring (item 5) has history to diff against.

## 2. Loading + last-event marker on `LodgingPaymentBadge`

Two new visual states:

- **Processing**: while a Stripe webhook is mid-flight (detected when `payment_status` is one of the transitional values `pending`, `processing`, OR when `stripe_last_event_at` is within the last 8 s). Renders a spinning `Loader2` chip "Processing Stripe update…" in muted tone.
- **Last event timestamp**: small `Clock` micro-caption under the badge: `"Updated {timeAgo} · {event_type}"` (e.g. "Updated 12s ago · payment_intent.succeeded"). Hidden if no events yet.

Schema additions (migration):
- `lodge_reservations.stripe_last_event_at timestamptz`
- `lodge_reservations.stripe_last_event_type text`

`stripe-lodging-webhook` writes both on every handled event (in addition to the existing payment_status update).

The badge already subscribes via `useReservationLive`, so the spinner clears the moment the webhook commits.

## 3. Wiring-check failures show failing SQL + "Open in editor"

Enhance the existing `lodging_wiring_report()` RPC and the page UI:

- RPC already returns `fix` (remediation SQL). Add two more JSON fields per check:
  - `failing_query` — the exact diagnostic SQL that produced the failing result (e.g. `SELECT relrowsecurity FROM pg_class WHERE oid = 'public.lodge_reservations'::regclass`).
  - `editor_url` — built server-side as `https://supabase.com/dashboard/project/slirphzzwcogdbkeicff/sql/new?content={url-encoded SQL}`.
- In `AdminLodgingWiringCheckPage.tsx` each failing card now shows:
  - A `<details>` "Show failing query" → mono `<pre>` with copy button.
  - A primary `Open in SQL editor` button (opens `editor_url` in new tab) preloaded with the **fix** SQL (not the diagnostic) so the admin can run it immediately.
  - Existing copy-fix button stays.

## 4. Stronger idempotency on deposit retry

Lock down `create-lodging-deposit` against race-condition double-charges:

- **DB**: add `lodge_reservations.payment_lock_token text` + `payment_lock_expires_at timestamptz`. Function uses an **advisory lock** keyed by `hashtext('lodge_dep_' || reservation_id)` for the duration of the call (Postgres `pg_try_advisory_xact_lock`). If lock fails → return `423 Locked` with `{ retry_after: 2 }`.
- **Idempotency-Key**: pass `Idempotency-Key: lodge_dep_{reservation_id}_{attempt_hash}` on every `stripe.checkout.sessions.create` and `stripe.paymentIntents.update` call. `attempt_hash` = sha256 of `(reservation_id, deposit_cents, mode, current_payment_status)` — same inputs → same key → Stripe returns the same Session even on duplicate POSTs.
- **Re-check after acquire**: re-read `payment_status` inside the lock and re-apply the existing `TERMINAL_PAYMENT_STATES` guard, so a webhook that arrives between the client click and the function entry can't be overridden.
- **Client**: the badge's retry handler already disables itself while in flight; add a 5 s cool-down + dedupe via a `retryInFlightRef` ref so rapid taps don't spawn parallel calls.

## 5. Automated wiring-report monitoring + alerts

A scheduled run that diffs against the last snapshot and notifies on any change.

- **Edge function** `lodging-wiring-monitor`:
  - Calls `lodging_wiring_report()` via service role.
  - Inserts a new `lodging_wiring_report_runs` row.
  - Loads the previous run; computes a per-check diff (`pass→fail`, `fail→pass`, `still_failing` after N runs).
  - On any **new failure** or **regression** (was-pass, now-fail), sends an alert through the existing `send-admin-alert` channel (Telegram + email) with the check name, message, and a link to `/admin/lodging/wiring-check`.
  - "Recovered" alerts when fail→pass.
- **pg_cron**: schedule every 15 min via the `pg_cron` + `pg_net` pattern (existing project uses these per the schedule-jobs guide).
- **CI hook**: a one-shot GitHub-style script `scripts/wiring-check.ts` that hits the same edge function and exits non-zero on any failure — documented in the page footer ("Use in CI: `deno run scripts/wiring-check.ts`"). Optional, no GH Actions file added (project doesn't appear to manage one).
- **History panel** at the bottom of `AdminLodgingWiringCheckPage`: last 10 runs as a sparkline + table (`ran_at`, `pass`, `fail`, delta vs prior).

## File map

**Created**
- `src/lib/admin/wiringReportCsv.ts` — CSV builder + download.
- `supabase/functions/lodging-wiring-monitor/index.ts` — scheduled diff + alert.
- `scripts/wiring-check.ts` — optional CI runner.

**Modified**
- `src/pages/admin/AdminLodgingWiringCheckPage.tsx` — Export CSV button, failing-SQL `<details>`, Open-in-editor button, history panel.
- `src/components/lodging/LodgingPaymentBadge.tsx` — processing spinner state, last-event caption.
- `supabase/functions/stripe-lodging-webhook/index.ts` — write `stripe_last_event_at` + `stripe_last_event_type` on every event.
- `supabase/functions/create-lodging-deposit/index.ts` — advisory lock, Idempotency-Key headers, in-lock re-check, 423 on contention.

**Migration**
- Add `stripe_last_event_at timestamptz`, `stripe_last_event_type text`, `payment_lock_token text`, `payment_lock_expires_at timestamptz` to `lodge_reservations`.
- Create table `lodging_wiring_report_runs` with RLS (admin-only via existing `has_role(uid,'admin')`).
- Update `lodging_wiring_report()` RPC to include `failing_query` + `editor_url` per check.
- Schedule `lodging-wiring-monitor` via `pg_cron` every 15 min (separate insert query — not in the migration, since it embeds the project ref + anon key per the scheduling guide).

## Technical notes

- Stripe SDK already supports `{ idempotencyKey }` as a per-request option on `sessions.create` / `paymentIntents.*` — no SDK upgrade needed.
- Advisory locks are transaction-scoped (`pg_try_advisory_xact_lock`) — they auto-release on function exit, so no orphaned locks even if the function crashes.
- `lodging_wiring_report_runs` only retains the last 200 runs (a `BEFORE INSERT` trigger trims the tail) to keep storage bounded.
- All UI follows v2026 high-density tokens (Lucide only, `text-[11px]`, `rounded-xl`).
- No new npm dependencies.

