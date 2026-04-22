

# Hotels & Resort — Filtering, exporting, lock attribution & schema-aware diffs

Five focused refinements that round out the diagnostics + Stripe-safety story.

## 1. Filterable Actions panel in the wiring-check history

In `AdminLodgingWiringCheckPage.tsx`, the Actions tab (last 50 remediation rows) gets a compact filter bar above the list:

- **Admin email** — free-text search. Resolved by joining `lodging_wiring_remediation_actions.admin_id` against `profiles` (already public). Add a one-time `admin_emails` lookup map fetched alongside the actions; filter is a case-insensitive substring on the resolved email.
- **Run id** — text input matching `run_id` prefix (8-char minimum). Auto-fills when the admin clicks a row's run id (a new clickable chip per action that also scrolls the Runs tab to that row).
- **Check id** — text input matching `check_id` substring.
- **Action type** — segmented control (`All / Copy fix / Copy diagnostic / Open in editor / Mark resolved`).

All filters live in component state + URL query (`?admin=&run=&check=&type=`) so the view is shareable. A `Clear filters` ghost button appears when any filter is active. Counts in the tab label switch from `({total})` to `({filtered}/{total})` while filters are applied.

Each row also gains the run id as a small mono chip (`v{schema}·{runId.slice(0,8)}`) to make grouping obvious.

## 2. CSV export on the webhook events admin page

In `AdminLodgingWebhookEventsPage.tsx`:

- New `Export CSV` button in the header (left of `Refresh`), disabled while no rows are loaded.
- Util `src/lib/admin/webhookEventsCsv.ts` (new) — builds an Excel-friendly CSV (UTF-8 BOM, CRLF, RFC4180 quoting) with columns:
  `received_at_iso, event_created_at_iso, stripe_event_id, event_type, processing_status, reservation_id, stripe_payment_intent_id, stripe_session_id, error_message`
- Export uses the **currently filtered** rows (the same `data` the table renders), so what the admin sees is what they download.
- Filename: `lodging-webhook-events-{YYYYMMDD-HHmm}.csv`. Uses Blob + `URL.createObjectURL` (no new deps).
- Sticky toast: "Exported {N} events".

## 3. Surface lock attribution in the 423 retry-in-progress UI

The deposit edge function already returns `{ retry_after_seconds, locked_since, lock_owner_hint }`. We currently ignore the hint and don't expose the underlying `lodging_deposit_retry_attempts` row id. Upgrade both ends:

**API** (`create-lodging-deposit/index.ts`)
- Persist a `client_attempt_id` (and an `admin_id` if the caller is authenticated) on every `lodging_deposit_retry_attempts` row.
- When a 423 fires, look up the most recent **in-progress** attempt for that reservation and include in the response:
  - `lock_attempt_id` — the conflicting attempt's row id (uuid).
  - `lock_started_at` — the attempt's `started_at`.
  - `lock_owner_hint` — `'self'` if the conflicting attempt's `client_attempt_id` matches the current request's, else `'other'` (replaces the always-`other` heuristic).
  - `lock_admin_hint` — last 4 chars of admin id when present (privacy-preserving), else `null`.

**Migration**
- Add `client_attempt_id text` and `admin_id uuid` columns to `lodging_deposit_retry_attempts`.

**UI** (`LodgingPaymentBadge.tsx`)
- Extend `RetryResult` with the new fields.
- The `lockedAlert` block now shows two extra lines:
  - `Owner: {self|other tab}` with a `User` (self) or `Users` (other) Lucide icon.
  - `Attempt: {attemptId.slice(0,8)} · started {timeAgo}`.
- When `lock_owner_hint === 'self'`, swap the title to "Same-tab retry already running" so the admin understands their previous click is still pending — and skip the "auto-re-enable" sub-copy (it would be misleading).

## 4. Per-failure related Stripe events panel

Each failing wiring-check card with `isWebhookCheck(c) === true` (and any failure that includes a payment-intent reference) currently only shows a generic "Webhook events" link. Upgrade it to a contextual top-3 list:

- The `lodging_wiring_report()` RPC already runs in admin context. Add a server-side `related_event_ids text[]` field on each check it returns: for any check tied to a specific `stripe_payment_intent_id` or reservation, run a `LIMIT 3 ORDER BY received_at DESC` lookup on `lodging_stripe_webhook_events`. For broader checks (e.g., "no events received in last 24h") it returns the latest 3 by `event_type` matching the check's anchor.
- In the page, render an inline `Recent related events` strip under failing cards:
  - Up to 3 chips: `{event_type} · {timeAgo}` — each is a `Link` to `/admin/lodging/webhook-events?event_id={evt_…}` (new query param).
  - The events page reads `event_id` and adds it as a fourth filter (exact match on `stripe_event_id`) — auto-clearable.
- If the RPC returns an empty list, show a muted "No related events found" line with the existing generic Webhook log link as fallback.

## 5. Schema-version aware diff view

The history Runs tab currently shows a single delta column (`+N` / `-N`). After the schema bump in the previous round, mixed-version diffs are misleading. Rework:

- Group rows by `schema_version`, newest version first. Each group gets a thin header: `Schema v2 · 7 runs` with an info `i` tooltip ("Diffs are computed within a schema version").
- Within a group, the delta column is computed against the previous run **of the same version**. Cross-version boundaries render `—` (em dash) with a small `Schema mismatch — diff suppressed` muted caption on the boundary row.
- Sparkline keeps the chronological order but colour-codes each bar by version (`v2` = current emerald, older = neutral grey) and adds a 1px notch where the version changes.
- The `lodging-wiring-monitor` already skips cross-version diffs for alerting; mirror that on the UI by tagging suppressed rows with `data-suppressed="true"` for E2E coverage.

## File map

**Created**
- `src/lib/admin/webhookEventsCsv.ts` — webhook CSV builder + downloader.

**Modified**
- `src/pages/admin/AdminLodgingWiringCheckPage.tsx` — Actions filters bar, schema-grouped runs view, related-events strip on failing cards, query-string sync.
- `src/pages/admin/AdminLodgingWebhookEventsPage.tsx` — Export CSV button, `event_id` URL filter, exact `stripe_event_id` match.
- `src/components/lodging/LodgingPaymentBadge.tsx` — extended `RetryResult`, owner/attempt sub-lines in the locked alert.
- `supabase/functions/create-lodging-deposit/index.ts` — record `client_attempt_id` + `admin_id` on attempts; return `lock_attempt_id`, `lock_started_at`, refined `lock_owner_hint`, `lock_admin_hint` on 423.

**Migration**
- Add `client_attempt_id text`, `admin_id uuid` to `lodging_deposit_retry_attempts` + index `(reservation_id, started_at desc) where completed_at is null` for fast lock-owner lookup.
- Update `lodging_wiring_report()` to attach `related_event_ids` (and matching `event_types` parallel array) to each check, capped at 3.

## Notes

- No new npm/Deno dependencies.
- All UI follows v2026 high-density tokens (`text-[11px]`, `rounded-xl`, semantic tokens, Lucide-only icons).
- The webhook CSV uses the same schema-versioning convention as the wiring-check CSV (`# schema_version=1`) so downstream consumers can detect format changes.
- `related_event_ids` lookups are bounded (`LIMIT 3` per failing check), so the report RPC stays well under its current latency budget.

