

# Hotels & Resort — Audit trail, CI, webhook log & retry hardening

Five upgrades that close the loop on observability and Stripe-safety.

## 1. Audit trail of remediation actions

Every click on a wiring-check fix button is now persisted and surfaced in the history panel.

**Migration**
- New table `lodging_wiring_remediation_actions`:
  - `id uuid pk`, `created_at timestamptz default now()`
  - `admin_id uuid not null` (defaults to `auth.uid()`)
  - `run_id uuid` (nullable, references `lodging_wiring_report_runs.id` — the run the admin was viewing)
  - `check_id text not null`
  - `check_name text`
  - `action_type text not null` — one of `copy_fix_sql`, `copy_failing_query`, `open_sql_editor`, `mark_resolved`
  - `editor_url text` (nullable — only for `open_sql_editor`)
  - `metadata jsonb default '{}'::jsonb`
- RLS: insert allowed for any authenticated admin (`has_role(auth.uid(),'admin')`); select for admins only.
- Index `idx_lwra_run_id` and `idx_lwra_created_at desc`.

**Page** (`AdminLodgingWiringCheckPage.tsx`)
- New helper `logRemediation(action, check, extra?)` calls a tiny insert via the supabase client.
- Wire into the four action buttons on each failing card (Copy fix, Copy diagnostic, Open in editor, Mark resolved).
- History panel gets a third tab `Actions` listing the last 50 actions with admin email, action chip, check name, and a link to the run row that was active.

## 2. CI workflow + PR summary comment

Add a GitHub Actions workflow at `.github/workflows/wiring-check.yml`:

- Triggers on `pull_request` (paths: `supabase/**`, `src/lib/admin/**`, `src/pages/admin/AdminLodgingWiringCheckPage.tsx`, `scripts/wiring-check.ts`).
- Steps:
  1. `setup-deno@v1`
  2. Run `deno run --allow-net --allow-env scripts/wiring-check.ts` — env-injects `SUPABASE_URL` (literal hardcoded ref) + `SUPABASE_ANON_KEY` (from secrets).
  3. The script is upgraded to also write the report JSON + CSV to `./wiring-report.json` + `./wiring-report.csv` when `CI=true`.
  4. `actions/upload-artifact@v4` uploads the CSV (named `wiring-report-${{ github.sha }}`).
  5. A final step uses `actions/github-script@v7` to read the JSON and post a sticky PR comment via `octokit.issues.createComment` with:
     - PASS/FAIL summary line
     - Bullet list of failing check names + first 80 chars of message
     - Hint pointing to the artifact for the full CSV
- Workflow exits non-zero on any failing check, blocking merge by default (admin can override).

The script picks up `CI` and `GITHUB_OUTPUT` to emit `pass=N` / `fail=N` outputs for downstream steps.

## 3. Stripe webhook event log

Persist every processed Stripe event so wiring-check failures can deep-link to the underlying webhook trail.

**Migration**
- New table `lodging_stripe_webhook_events`:
  - `id uuid pk`
  - `stripe_event_id text not null unique` — Stripe's `evt_…` id; uniqueness gives idempotent inserts
  - `event_type text not null`
  - `event_created_at timestamptz` (Stripe's `created`)
  - `received_at timestamptz default now()`
  - `reservation_id uuid` (nullable; back-resolved from PI → `lodge_reservations`)
  - `stripe_payment_intent_id text`
  - `stripe_session_id text`
  - `processing_status text not null default 'received'` — `received | applied | skipped | error`
  - `error_message text`
  - `payload jsonb` — pruned event object (no PII beyond what Stripe already returns; capped to ~16KB by stripping `metadata` we don't need)
- Indexes on `event_type`, `reservation_id`, `received_at desc`.
- RLS: select only for admins; inserts only via service role (edge function).

**Edge function** (`stripe-lodging-webhook/index.ts`)
- After signature verify, immediately `INSERT … ON CONFLICT (stripe_event_id) DO NOTHING`. If the row was a duplicate, return `200 { received: true, dedup: true }` without re-applying side effects (idempotency at the function layer too, on top of Stripe's redelivery semantics).
- After the existing switch handler runs, update the row to `processing_status = 'applied'` (or `skipped` for unhandled types, or `error` + message on throw).

**Admin page** (`/admin/lodging/webhook-events` — new `AdminLodgingWebhookEventsPage.tsx`)
- Table of the last 200 events: time, type chip, reservation id (link), PI, status chip, error tooltip.
- Filters: by `event_type`, `processing_status`, free-text reservation id.
- Linked from the wiring-check page header ("View webhook log →").
- Each wiring-check failure card whose group is `webhook` or whose `check_id` references PI fields gets a small `View related webhook events` button that opens the page pre-filtered by that check's anchor (e.g. all events for reservations missing a PI).

## 4. Retry-flow hardening (UI + API)

Lock down the deposit retry path so duplicate intent is impossible and the user always sees why a retry is paused.

**API** (`create-lodging-deposit/index.ts`)
- Already uses `pg_try_advisory_xact_lock` from the previous round. Now:
  - Additionally maintain a row-level lock via `lodge_reservations.payment_lock_token` (random hex) + `payment_lock_expires_at = now() + interval '60 seconds'`. Set inside the same transaction. Refuse the request when an unexpired token already exists belonging to another caller.
  - When refused, return `423 Locked` with body `{ error: "retry_in_progress", retry_after_seconds, locked_since, lock_owner_hint: 'self'|'other' }` so the UI can choose its message.
  - Add a `dedup_key` derived from `(reservation_id, stripe_payment_intent_id || 'none', client_attempt_id)`; persist in a tiny `lodging_deposit_retry_attempts (id, dedup_key unique, reservation_id, started_at, completed_at, result text)` and `INSERT … ON CONFLICT DO NOTHING`. If conflict, return `200 { reused: true }` plus the cached `checkout_url` from the original Session.
- Stripe `Idempotency-Key` already passed; widen it to also include `client_attempt_id` so retries from a different tab share keys with the same tab but not across tabs (intentional — different tabs = different attempts but still merged by row lock).

**Migration**
- `lodging_deposit_retry_attempts` table + RLS (admins read; insert via service role).
- Index `idx_ldra_reservation_started` for the 5-minute lookback used by the retry handler.

**UI** (`LodgingPaymentBadge.tsx` + retry handler hook)
- Detect `423` and surface a clear inline `Alert`:
  - Title: "Retry already in progress"
  - Body: "Another retry started {N}s ago. We'll re-enable this button automatically." (uses `retry_after_seconds`).
  - Auto re-enable when the cooldown elapses; the existing `useReservationLive` subscription clears it the moment the webhook flips `payment_status` to a terminal state.
- Add a `data-testid="lodge-retry-locked"` for E2E coverage.
- Already has the 5 s client-side cool-down + `retryInFlightRef`; keep both.

## 5. Schema version on CSV + run snapshots

Make the report shape evolvable.

- Bump constant `WIRING_REPORT_SCHEMA_VERSION = 2` in `src/lib/admin/wiringReportCsv.ts`.
- CSV export:
  - Adds a leading metadata row before the header (Excel-friendly): `# schema_version=2\r\n# generated_at={iso}\r\n` (lines beginning with `#` are visually grouped at the top; users who care about strict CSV can `tail -n +3`).
  - New column `schema_version` appended to every data row so strict CSV consumers don't need to parse the comment lines.
- `lodging-wiring-monitor` edge function:
  - When inserting into `lodging_wiring_report_runs`, set `schema_version = 2` (new column).
- **Migration**: add `schema_version int not null default 1` to `lodging_wiring_report_runs`; backfill existing rows to 1; future runs land at 2. Update the diff logic to ignore runs with mismatched schema versions (to avoid spurious "regression" alerts after a format change).
- History panel surfaces the schema version in the run table as a tiny mono chip.

## File map

**Created**
- `.github/workflows/wiring-check.yml` — PR check + comment + artifact.
- `src/pages/admin/AdminLodgingWebhookEventsPage.tsx` — webhook log viewer.

**Modified**
- `scripts/wiring-check.ts` — write `wiring-report.json` + CSV, emit GH outputs.
- `src/lib/admin/wiringReportCsv.ts` — schema version, comment header, extra column.
- `src/pages/admin/AdminLodgingWiringCheckPage.tsx` — `logRemediation` calls, Actions tab in history, "View webhook log" link, webhook-events deep links on failing cards.
- `src/components/lodging/LodgingPaymentBadge.tsx` — handle 423, inline alert with countdown.
- `src/App.tsx` — register `/admin/lodging/webhook-events` route (lazy).
- `supabase/functions/stripe-lodging-webhook/index.ts` — insert into `lodging_stripe_webhook_events`, dedup by `stripe_event_id`, update processing status.
- `supabase/functions/create-lodging-deposit/index.ts` — row-lock token, `dedup_key` reuse, 423 with payload.
- `supabase/functions/lodging-wiring-monitor/index.ts` — set `schema_version` on runs, ignore cross-version diffs.

**Migration**
- `lodging_wiring_remediation_actions` + RLS + indexes.
- `lodging_stripe_webhook_events` + RLS + indexes.
- `lodging_deposit_retry_attempts` + RLS + indexes.
- `lodge_reservations.payment_lock_token`, `payment_lock_expires_at` already exist (added previous round); migration only fills gaps.
- Add `schema_version int default 1` to `lodging_wiring_report_runs`.

## Notes

- No new npm or Deno dependencies.
- All UI follows v2026 high-density tokens (Lucide only, `text-[11px]`, `rounded-xl`, semantic tokens — no raw colors).
- `lodging_stripe_webhook_events` is auto-pruned to last 30 days via a daily `pg_cron` job (will be scheduled in a follow-up SQL — not in the migration since it embeds anon key per the scheduling guide).
- The PR comment uses the default `GITHUB_TOKEN` so no secret setup is required beyond `SUPABASE_ANON_KEY`.

