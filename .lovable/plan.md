

# Marketing & Ads — Phase 4 finish: end-to-end flows wired

Five connected workstreams that take the existing UI shells (wizard, tiles, sub-tabs) and make every button complete a real database round-trip with correct status, realtime updates, and shareable output.

---

## 1. Ads campaign flow — full DB persistence

`CreateCampaignWizard` and `AdsCampaignRow` get real mutations.

- **Submit** → insert `store_ad_campaigns` with `status='pending_review'`, all wizard fields persisted (objective, targeting_json, creative_url, daily_budget_cents, schedule_start, schedule_end, platforms[]).
- **Save Draft** at any step → `status='draft'`, modal closes, row appears in list with "Resume" action that reopens wizard pre-filled at last completed step (`draft_step` int column).
- **Creative upload** → `user-posts` bucket at `ads/{store_id}/{uuid}.{ext}`, ≤8 MB, aspect validated against chosen format.
- **Wallet gate** — already scaffolded; finish by linking the inline "Add funds" CTA to scroll-and-focus the wallet card.
- **Platform gate** — disabled chips open `AdsConnectDialog` for that specific platform, then return to wizard with it preselected.
- **Row overflow menu** (`AdsCampaignRowMenu.tsx`, new) — Edit, Duplicate, Pause, Resume, Archive, Delete, all as mutations that invalidate `["store-ads-overview", storeId]`.
- **Realtime status toasts** — already subscribed; add toast on `status` transition (approved / rejected / paused_by_system).

**DB:** add `draft_step int default 0`, `archived_at timestamptz` to `store_ad_campaigns`.

## 2. Connection experience — OAuth + reconnect + disconnect + gates

`AdsConnectDialog` becomes the single entry point.

- **Continue with Meta / Google / TikTok** → calls existing `ads-oauth-start` edge function, opens popup, polls `store_ad_accounts` insert (5s interval, 60s timeout), closes on success, toast "Connected as {account_name}".
- **Manual fallback** form (account ID + name) inserts `status='pending_manual'`.
- **Per-tile actions** in `AdsPlatformTile`: Connect / Reconnect / Disconnect / View account. Disconnect deletes the row and recomputes the checklist + wizard platform availability instantly via cache invalidation.
- **Status pills**: `connected` (emerald), `pending_manual` (amber), `expired` (red, opens reconnect), `disconnected` (slate).
- **Wizard step 2** reads platform statuses live; expired platforms force reconnect before they can be selected.
- **Checklist** auto-derives "Connect at least one platform" from `store_ad_accounts.status='connected'` count.

## 3. Marketing tabs — every CTA completes a real action

Wire the four sub-tabs end-to-end:

**Overview**
- Replace flat header with `MarketingStatStrip` + `MarketingChannelTile` row + sticky "+ New Campaign" FAB (mobile) / button (desktop).
- "+ New Campaign" opens `CreateMarketingCampaignWizard`; submit/schedule/draft already wired — add the "Send test" action on each channel tile (writes to `marketing_test_sends`, invokes `send-marketing-campaign` with `is_test=true`).

**Audience**
- `SegmentsManager` → `+ New Segment` opens `SegmentBuilder`.
- New `useSegmentLiveCount` hook: debounced (400ms) count query against `profiles` + `orders` per condition group, shown as "≈ 1,247 customers" while editing.
- "Refresh now" updates `member_count` + `last_refreshed_at`.
- Segments appear as audience presets in **both** wizards (Marketing step 2, Ads step 2) via shared `<SegmentPicker>` component.

**Templates**
- `TemplatesLibrary` filterable by channel, shows `usage_count` + `last_used_at`.
- `TemplateEditor` channel-aware composer (subject+body / push / SMS char-counter / ad creative).
- Wizard step 3 gets "Use template" picker (fills form, queues `usage_count++` on send) and "Save as template" (writes new row).

**Flows**
- `AutomationsBuilder` saves `trigger_json` + `steps_json` to `marketing_automations`.
- `Activate` toggle flips `status='active'` + spawns initial enrollment via the new `marketing-automations-tick` edge function.
- Live "N customers in this flow" counter reads from `marketing_automation_enrollments`.
- Pause/Resume/Archive in row menu.

**Performance** — covered in #5.

## 4. Segments & Templates — shared across Ads and Marketing

- New `<SegmentPicker storeId channel?>` and `<TemplatePicker storeId channel>` components used by both wizards.
- `marketing_segments` gets `usage_count` (campaigns referencing it) + `synced_to_meta`/`synced_to_google` booleans.
- `marketing_templates` gets `usage_count` + `last_campaign_id` (already present in current types).
- Segment row shows: name · live member count · last refreshed · "Used in N campaigns" · sync status pills.
- Template row shows: name · channel · variables · usage count · "Last used in {campaign}".
- Optional "Sync to ad platforms" toggle on segments — calls `sync-segment-to-meta` / `sync-segment-to-google` edge functions (stub returns success with audience_id placeholder when platform creds aren't connected yet).

## 5. Performance reporting — date ranges, conversions, CSV export

`UnifiedPerformancePanel` upgrade:

- **Date range picker**: 7d / 30d / 90d / Custom (uses Shadcn Calendar in popover with `pointer-events-auto`).
- **KPI strip**: Spend, Revenue, ROAS, Conversions, CVR, CPA, AOV — all derived from `ads_studio_events` + `marketing_campaign_events` joined to `orders`.
- **Stacked area chart**: Ads vs Marketing vs Organic revenue over the range.
- **Funnel** (Recharts FunnelChart): Impression → Click → Add to cart → Purchase, with drop-off % between stages.
- **Top campaigns table**: sortable by ROAS / revenue / CTR / conversions, channel filter pills (All / Ads / Push / Email / SMS).
- **Channel mix donut**: revenue by channel.
- **Export CSV** button — generates two CSVs zipped client-side (`papaparse` already in tree, falls back to manual builder): `campaigns.csv` (one row per campaign with all KPIs) + `events.csv` (raw event list for the range). Filename `zivo-performance-{store}-{from}-{to}.zip`.
- **Share link** — copies a URL with the date range encoded as query params so the operator can paste into Slack/email and the recipient lands on the same view.

## 6. Polish & glue

- Pulsing dot on Ads / Marketing tab badges when: pending_review campaign exists, wallet < $10, expired connection, or scheduled send overdue.
- Skeleton → content cross-fade (replace snap) on all panels.
- `aria-live="polite"` on wizard step containers.
- Mobile FABs respect `safe-area-inset-bottom` (already a project standard — verify).
- Empty-state CTAs preselect the right modal (e.g., "Try a Welcome push" → wizard with Push + Welcome template chosen).

---

## Database additions

```sql
-- store_ad_campaigns: resume drafts + archive
alter table store_ad_campaigns
  add column if not exists draft_step int not null default 0,
  add column if not exists archived_at timestamptz;

-- segment usage tracking + sync flags
alter table marketing_segments
  add column if not exists usage_count int not null default 0,
  add column if not exists synced_to_meta boolean not null default false,
  add column if not exists synced_to_google boolean not null default false,
  add column if not exists external_audience_ids jsonb not null default '{}'::jsonb;

-- automation enrollment (new)
create table marketing_automation_enrollments (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references marketing_automations(id) on delete cascade,
  user_id uuid not null,
  current_step int not null default 0,
  next_run_at timestamptz not null default now(),
  status text not null default 'active', -- active|paused|completed|failed
  enrolled_at timestamptz not null default now(),
  unique (automation_id, user_id)
);

-- promo redemptions (new)
create table marketing_promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references marketing_promo_codes(id) on delete cascade,
  user_id uuid not null,
  order_id uuid,
  discount_cents int not null default 0,
  redeemed_at timestamptz not null default now()
);

-- test sends audit (new)
create table marketing_test_sends (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  channel text not null,
  payload_jsonb jsonb not null,
  sent_by uuid not null,
  sent_at timestamptz not null default now()
);

-- helpful indexes
create index on marketing_campaigns (store_id, status, scheduled_at);
create index on store_ad_campaigns (store_id, status);
create index on marketing_campaign_events (campaign_id, event_type, created_at);
create index on marketing_automation_enrollments (automation_id, status, next_run_at);
```

All new tables RLS-scoped to store owner + admin via existing `has_role` helper.

## Edge functions

- `send-marketing-campaign` — fan-out to push/email/SMS (stubbed providers; writes events)
- `marketing-automations-tick` — pg_cron every 5 min, advances enrollments
- `marketing-segments-refresh` — pg_cron nightly, recomputes `member_count`
- `sync-segment-to-meta` / `sync-segment-to-google` — Custom Audience push (stub when not connected)
- `track-promo-redemption` — checkout webhook

## Files

**New components**
- `src/components/admin/ads/AdsCampaignRowMenu.tsx`
- `src/components/admin/marketing/SegmentPicker.tsx`
- `src/components/admin/marketing/TemplatePicker.tsx`
- `src/components/admin/marketing/SendTestDialog.tsx`
- `src/components/admin/marketing/PerformanceDateRangePicker.tsx`
- `src/components/admin/marketing/PerformanceKpiStrip.tsx`
- `src/components/admin/marketing/PerformanceFunnel.tsx`
- `src/components/admin/marketing/PerformanceTopCampaigns.tsx`
- `src/lib/performanceCsvExport.ts`

**New hooks**
- `src/hooks/useSegmentLiveCount.ts`
- `src/hooks/useMarketingAutomationEnrollments.ts`
- `src/hooks/useUnifiedPerformanceRange.ts` (extends existing hook with custom range)

**Edited**
- `src/components/admin/ads/CreateCampaignWizard.tsx` — full submit/draft wiring, draft_step persistence, creative upload, scroll-to-wallet
- `src/components/admin/ads/AdsCampaignRow.tsx` — overflow menu integration
- `src/components/admin/ads/AdsConnectDialog.tsx` — OAuth popup polling, manual fallback, reconnect
- `src/components/admin/ads/AdsPlatformTile.tsx` — Reconnect/Disconnect actions, status pills
- `src/components/admin/StoreAdsManager.tsx` — realtime status toasts, pulsing badge logic
- `src/components/admin/StoreMarketingSection.tsx` — Overview header swap + FAB
- `src/components/admin/marketing/CreateMarketingCampaignWizard.tsx` — mount SegmentPicker + TemplatePicker
- `src/components/admin/marketing/SegmentBuilder.tsx` — live count
- `src/components/admin/marketing/AutomationsBuilder.tsx` — activate + counter
- `src/components/admin/marketing/UnifiedPerformancePanel.tsx` — date range, KPI strip, funnel, CSV export, share link
- `src/hooks/useStoreAdsOverview.ts` — pause/resume/duplicate/archive/delete mutations
- `src/hooks/useStoreMarketingOverview.ts` — already has send/schedule; add row mutations + test send
- `src/hooks/useUnifiedPerformance.ts` — accept custom from/to dates, return funnel + KPI extras

**Migration**
- `supabase/migrations/<ts>_marketing_phase4_finish.sql`

## Build order

1. Migration (schema additions + new tables + RLS + indexes)
2. Edge function stubs (send-marketing-campaign, automations-tick, segments-refresh, sync-segment-to-*, track-promo-redemption) + pg_cron schedules
3. Ads: CreateCampaignWizard full submit/draft + draft resume + creative upload
4. Ads: AdsCampaignRowMenu (pause/resume/duplicate/archive/delete) + realtime toasts
5. Ads: AdsConnectDialog OAuth popup polling + manual + per-tile reconnect/disconnect + status pills
6. Marketing Overview: stat strip + channel tiles + FAB + SendTestDialog
7. Shared SegmentPicker + TemplatePicker mounted in both wizards
8. SegmentBuilder live count via useSegmentLiveCount
9. AutomationsBuilder activate toggle + enrollment counter
10. UnifiedPerformancePanel: date range, KPI strip, funnel, top-campaigns table, channel mix, CSV export, share link
11. Polish: pulsing badges, cross-fade skeletons, a11y sweep, empty-state CTAs

## Recommendation

Ship in two passes to keep PRs reviewable:
- **Pass 1 (steps 1–5):** Ads end-to-end + connection experience — directly answers "make sure can ads".
- **Pass 2 (steps 6–11):** Marketing wiring + shared pickers + performance reporting + polish.

Reply "all", "Pass 1", "Pass 1 + 2", or specific step numbers.

