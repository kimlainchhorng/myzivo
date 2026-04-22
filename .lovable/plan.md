

# Marketing & Ads — Pass 3: Hardening, observability, onboarding & attribution reliability

Six focused workstreams that secure the cron loop, add operator visibility, smooth out the "first campaign" path, give admins a real attribution audit surface, and make promo tracking durable across network failures.

---

## 1. Cron security — remove embedded bearer, switch to PG-side secret

**Problem today:** `Authorization: Bearer zivo_cron_a3f9k2b8m5n1p7q4r6s8t0v2w` is hardcoded in a migration that runs on every remix.

**Fix:**
- Store the secret in Postgres via `vault.create_secret('marketing_cron_secret', '<rotated value>')` (or a private `app_settings` table with admin-only RLS if vault unavailable).
- Rewrite the cron job to read it at runtime: `current_setting('app.cron_secret', true)` populated by an `ALTER DATABASE ... SET app.cron_secret = ...` executed via the **insert tool** (not migration), so it never appears in migration history.
- Edge function `marketing-automations-tick` keeps its existing `CRON_SECRET` env check — both sides read from a non-committed source.
- Rotate the previously committed token (mark the old value as compromised, generate a new one for both sides).
- Add a `cron.job_run_details`-based health row read by the new debug panel (#2).

## 2. Admin debug panel for `marketing-automations-tick`

New route **`/admin/marketing/automations-debug`** (admin-gated via `has_role`):
- **Header KPI strip:** last run timestamp, last success/failure status, runs in last 24h, average duration, success rate %.
- **Recent runs table** (last 50): timestamp, status, HTTP code, duration ms, response body preview (truncated), error message. Sourced from `cron.job_run_details` joined to `cron.job` where `jobname='marketing-automations-tick'`.
- **Per-tick stats** (last 50 ticks): `automations_processed`, `enrollments_created`, `steps_advanced`, `completed` — read from a new `marketing_automation_tick_log` table the edge function writes to on every run (insert single row at end).
- **Live log tail:** "View edge function logs" deep-link button to the Supabase dashboard logs URL.
- **Manual trigger button:** admin-only `POST` to the function with the runtime secret, useful for ad-hoc runs.

New table:
```sql
create table marketing_automation_tick_log (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  duration_ms int not null default 0,
  ok boolean not null default true,
  automations_processed int not null default 0,
  enrollments_created int not null default 0,
  steps_advanced int not null default 0,
  completed int not null default 0,
  error_message text
);
create index on marketing_automation_tick_log (ran_at desc);
```
RLS: admins read; service role writes.

## 3. "Set up channel" onboarding in New Campaign flow

When the operator picks a channel in `NewCampaignChannelPicker` (or step 1 of the wizard) and that channel isn't yet configured for the store:

- **Push:** detect missing → check `store_notification_channels` for `channel='push' and status='connected'` (or use existing `device_tokens` registry presence as proxy). If none → mount `<ChannelSetupStep channel="push">` between picker and wizard. CTA: "Enable push notifications" → registers the operator's own device + writes a row to `store_notification_channels` so the channel becomes "active" for the store.
- **Email:** missing → ask for sender name + reply-to email → writes to `store_notification_channels` (`provider='resend'`, `from_email`, `reply_to`). Provider key already a project secret; no new secret needed.
- **SMS:** missing → ask for sender ID/phone, region (US/KH/Other) → writes config row. Warn if Twilio sender not provisioned and link to the SMS compliance page.
- **In-app:** auto-enabled (no setup needed) — skip step.

After setup row inserted → invalidate `["store-channels", storeId]` → wizard opens normally with the channel preselected.

New table (or extend existing if present):
```sql
create table if not exists store_notification_channels (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  channel text not null check (channel in ('push','email','sms','inapp')),
  status text not null default 'pending' check (status in ('pending','active','disabled','failed')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, channel)
);
```
RLS: store owners + admins read/write their own rows.

New components:
- `src/components/admin/marketing/ChannelSetupStep.tsx` — channel-specific setup forms.
- `src/hooks/useStoreNotificationChannels.ts` — read + upsert config.

Edits:
- `NewCampaignChannelPicker.tsx` — disabled state per unconfigured channel with "Set up" badge that opens setup before wizard.
- `CreateMarketingCampaignWizard.tsx` — step 1 verifies channel readiness before allowing Next.

## 4. Admin promo redemptions audit page

New route **`/admin/marketing/promo-redemptions`** (admin-gated):
- **Filters:** date range, promo code (autocomplete), user email/phone search, store, attributed campaign.
- **Searchable table** columns: redeemed_at · promo code · user (avatar+name+email) · order id (link) · discount · order total · attributed campaign · channel.
- **Totals strip:** total redemptions, total discount given, total attributed revenue, conversion event count, avg order value.
- **Conversion events tab:** parallel view of `marketing_campaign_events where event_type='converted'` joined to orders + promos.
- **CSV export:** uses existing `performanceCsvExport.ts` pattern; exports current filtered view.
- **Row click:** opens existing `PromoRedemptionsDrawer` (extended) with the promo's full timeline including attribution events.

New components:
- `src/pages/admin/PromoRedemptionsAdminPage.tsx`
- `src/components/admin/marketing/PromoRedemptionsTable.tsx`
- `src/components/admin/marketing/PromoRedemptionsFilters.tsx`
- `src/hooks/useAdminPromoRedemptions.ts` (joins `marketing_promo_redemptions` + `marketing_promo_codes` + `profiles` + `marketing_campaign_events`)

Route registered in admin nav under "Marketing → Redemptions".

## 5. Queued retry for `track-promo-redemption`

**Problem:** when the post-checkout `supabase.functions.invoke('track-promo-redemption', ...)` call fails (network blip, function cold start), attribution is lost.

**Fix — durable client-side queue + server-side reconciliation:**

Client side:
- New `src/lib/promoRedemptionQueue.ts`:
  - On invoke failure, push payload to `localStorage` key `zivo_promo_redemption_queue` (array of `{ payload, attempts, last_attempt_at, order_id }`).
  - On app boot + every 60s + on `online` event, drain queue with exponential backoff (max 5 attempts), removing on success and after 24h of failures.
  - Idempotency: include client-generated `idempotency_key = sha256(order_id + promo_code)`.
- `useEatsOrder.ts` updated to call `enqueuePromoRedemption()` which tries immediately then queues on failure.

Server side:
- `track-promo-redemption` accepts `idempotency_key`, checks `marketing_promo_redemptions.idempotency_key` unique index — returns existing row id if duplicate (safe replays).
- New nightly cron job `marketing-promo-attribution-reconcile` (5-minute schedule): scans `food_orders` from last 48h with non-null `promo_code` that have **no matching** `marketing_promo_redemptions` row → invokes `track-promo-redemption` server-side. Catches anything the client never managed to queue (e.g. user closed tab before retry).
- Uses same vault-stored cron secret pattern from #1.

Schema:
```sql
alter table marketing_promo_redemptions
  add column if not exists idempotency_key text;
create unique index if not exists ux_promo_redemptions_idem
  on marketing_promo_redemptions (idempotency_key)
  where idempotency_key is not null;
```

New edge function:
- `supabase/functions/marketing-promo-attribution-reconcile/index.ts`

## 6. Polish & glue

- Admin nav: add "Automation Debug" + "Promo Redemptions" entries under Marketing section.
- `MarketingChannelTile` shows a tiny "Setup required" pill if the channel has no `store_notification_channels` row yet.
- Toast on successful manual tick trigger from debug panel.
- All new admin routes lazy-loaded.
- a11y: all new tables get sortable headers with proper `aria-sort`.

---

## Files

**New**
- `src/pages/admin/AutomationsDebugPage.tsx`
- `src/pages/admin/PromoRedemptionsAdminPage.tsx`
- `src/components/admin/marketing/ChannelSetupStep.tsx`
- `src/components/admin/marketing/AutomationsTickHealthStrip.tsx`
- `src/components/admin/marketing/AutomationsTickRunsTable.tsx`
- `src/components/admin/marketing/PromoRedemptionsTable.tsx`
- `src/components/admin/marketing/PromoRedemptionsFilters.tsx`
- `src/hooks/useAutomationsTickHealth.ts`
- `src/hooks/useAdminPromoRedemptions.ts`
- `src/hooks/useStoreNotificationChannels.ts`
- `src/lib/promoRedemptionQueue.ts`
- `supabase/functions/marketing-promo-attribution-reconcile/index.ts`

**Edited**
- `supabase/functions/marketing-automations-tick/index.ts` — write to `marketing_automation_tick_log` at end of each run, capture errors
- `supabase/functions/track-promo-redemption/index.ts` — accept + dedupe on `idempotency_key`
- `src/components/admin/marketing/NewCampaignChannelPicker.tsx` — surface "Set up" state per channel
- `src/components/admin/marketing/CreateMarketingCampaignWizard.tsx` — gate next step on channel readiness
- `src/components/admin/marketing/MarketingChannelTile.tsx` — "Setup required" pill
- `src/hooks/useEatsOrder.ts` — route through `enqueuePromoRedemption`
- `src/App.tsx` (or admin router) — register two new admin routes
- `src/components/admin/AdminNav.tsx` (or equivalent) — two new Marketing entries

**Migrations**
- `<ts>_marketing_phase4_pass3.sql` — `marketing_automation_tick_log`, `store_notification_channels`, `marketing_promo_redemptions.idempotency_key` + unique index
- Cron job rewrite using `current_setting('app.cron_secret', true)` for both `marketing-automations-tick` and the new `marketing-promo-attribution-reconcile` — registered via **insert tool**, not migration

**Secrets / config**
- Rotate `CRON_SECRET` (runtime secret) and set `app.cron_secret` in Postgres via insert tool — same value, two locations, never in migration history
- No new external secrets

## Build order

1. Migration: `marketing_automation_tick_log`, `store_notification_channels`, `idempotency_key` + unique index, RLS.
2. Insert tool: `ALTER DATABASE postgres SET app.cron_secret = '<new>'` + re-register both cron jobs reading via `current_setting`.
3. Rotate `CRON_SECRET` runtime secret (ask user to confirm rotation value, then update edge function env).
4. Edit `marketing-automations-tick` to log to `marketing_automation_tick_log`.
5. New `marketing-promo-attribution-reconcile` edge function + cron registration.
6. Edit `track-promo-redemption` for idempotency.
7. Client `promoRedemptionQueue.ts` + integrate into `useEatsOrder.ts`.
8. `useStoreNotificationChannels` hook + `ChannelSetupStep` + wire into picker/wizard.
9. `useAutomationsTickHealth` + `AutomationsDebugPage` + register route.
10. `useAdminPromoRedemptions` + `PromoRedemptionsAdminPage` + register route.
11. Admin nav entries + `MarketingChannelTile` "Setup required" pill.
12. CSV export reuse + a11y sweep on new tables.

## Recommendation

These six items are independent enough to ship in two slices:

- **Slice A (security + reliability — ships invisible value first):** steps 1–7 (cron secret rotation, tick logging, reconcile job, idempotent redemption + client queue).
- **Slice B (operator UX — visible new surfaces):** steps 8–12 (channel setup, debug page, admin redemptions page, nav, polish).

Reply "all", "Slice A", "Slice B", or specific step numbers to proceed.

