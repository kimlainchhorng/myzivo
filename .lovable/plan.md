

# Marketing & Ads — Pass 2: Wire every remaining flow end-to-end

Five connected workstreams that complete the Phase 4 finish work: Ads connection round-trips, campaign row actions, Marketing Overview wiring, edge-function backends for sending and automations, and promo redemption attribution.

---

## 1. Ads connection — OAuth popup, manual fallback, reconnect, disconnect

**`AdsConnectDialog.tsx`** becomes a real round-trip:

- **"Continue with Meta / Google / TikTok"** → calls existing `ads-oauth-start` edge function (or new stub if missing) which returns an `auth_url` and a `state` token. Open `auth_url` in a 600×700 popup, then poll `store_ad_accounts` every 2s (max 60s) filtered by `state=...` until a row appears with `status='connected'`. On success: close popup, invalidate `["store-ads-overview", storeId]`, toast "Connected as {display_name}".
- **Manual fallback** form already exists — wire the save button to insert `store_ad_accounts` with `status='pending_manual'` + `external_account_id` + `display_name`.
- **Disconnect** button on each platform tile → confirm dialog → delete the `store_ad_accounts` row → invalidate cache → checklist + wizard platform availability recompute instantly.
- **Reconnect** for `expired` status → relaunches OAuth flow, on success updates the existing row (`token_expires_at`, `status='connected'`).

**`AdsPlatformTile.tsx`** gets per-status pills: `connected` (emerald), `pending_manual` (amber), `expired` (red, opens reconnect), `disconnected` (slate). Clicking the tile when disconnected opens the dialog; when connected opens a small popover with Reconnect / Disconnect / View account.

**Wizard step 2** reads platform statuses live; non-`connected` chips are disabled and clicking them opens `AdsConnectDialog` with that platform pre-selected, then returns the user to the wizard with the platform pre-checked once connected.

## 2. Ads campaign row actions — Edit, Duplicate, Pause, Resume, Archive, Delete

**New `AdsCampaignRowMenu.tsx`** — a `DropdownMenu` triggered by the existing overflow button on each row. Items shown contextually based on `campaign.status`:

- **Edit** — opens `CreateCampaignWizard` in edit mode at the saved `draft_step`, prefilled from row data.
- **Duplicate** — inserts a new row with `name = "{name} (copy)"`, `status='draft'`, `draft_step=4`.
- **Pause** — `update status='paused'` (visible when status is `active` or `pending_review`).
- **Resume** — `update status='active'` (visible when status is `paused`).
- **Archive** — `update status='archived', archived_at=now()` (hides from default list, surfaces under "Archived" filter).
- **Delete** — confirm dialog → hard delete → toast "Campaign deleted".

All mutations live in **`useStoreAdsOverview.ts`** and invalidate `["store-ads-overview", storeId]` on success. Realtime subscription already exists in `StoreAdsManager.tsx` — add a toast diff on `status` transitions for `approved`, `rejected`, `paused_by_system` so changes from the server (e.g. moderator approval) surface instantly without polling.

## 3. Marketing Overview — stat strip header + correct-wizard FAB

**`StoreMarketingSection.tsx`** Overview tab gets restructured:

- Replace the current flat header with `<MarketingStatStrip>` at the top.
- Below: a 4-tile `MarketingChannelTile` row (Push / Email / SMS / In-app) with status, last-sent time, 7d sparkline, and a "Send test" action that opens **`SendTestDialog.tsx`** (new) — sends to operator's own account via `send-marketing-campaign` with `is_test=true`, writes to `marketing_test_sends`.
- Sticky FAB (mobile) / pill button (desktop): **"+ New Campaign"**.
- "+ New Campaign" opens a small channel picker first (Push · Email · SMS · In-app · Multi-channel) → opens `CreateMarketingCampaignWizard` with that channel pre-selected on step 1 (skip the channel step or mark it complete).
- "Send test" buttons on each `MarketingChannelTile` open `CreateMarketingCampaignWizard` directly with that channel preselected and "Send test" mode enabled.

## 4. Edge functions — `send-marketing-campaign` + `marketing-automations-tick`

**`supabase/functions/send-marketing-campaign/index.ts`** (new):
- Auth: validate JWT via `getClaims()`, confirm caller owns the store.
- Input: `{ campaign_id: uuid, is_test?: boolean, test_recipient_user_id?: uuid }`.
- Loads campaign, resolves audience (segment or inline filters) → user IDs.
- For `is_test=true`: sends only to `test_recipient_user_id`, writes one row to `marketing_test_sends`, returns `{ ok: true, recipients: 1 }`.
- For real send: chunks recipients (500/batch), writes one `marketing_campaign_events` row per recipient with `event_type='sent'`, then per channel:
  - `push` → invokes existing `send-push-notification` per device token
  - `email` → SMTP stub (logs payload, marks `delivered`)
  - `sms` → Twilio stub via existing helper if present, otherwise logs
  - `in_app` → inserts into `notifications` table
- Updates `marketing_campaigns.status='sent', sent_at=now()` on completion.
- Returns `{ ok, recipients, batches, errors }`.

**`supabase/functions/marketing-automations-tick/index.ts`** (new):
- Triggered by pg_cron every 5 minutes (no JWT — public endpoint guarded by `CRON_SECRET` env var in `Authorization: Bearer ...` header).
- For each `status='active'` automation:
  1. **Enroll** new users matching `trigger_json` (cart_abandoned ≥ N min, first_order, no_order_in_days, birthday, loyalty_tier_change, wishlist_price_drop) into `marketing_automation_enrollments` (unique on automation_id+user_id).
  2. **Advance** existing enrollments where `next_run_at <= now()` and `status='active'`:
     - Read current step from `steps_json[current_step]`
     - If `type='wait'`: bump `next_run_at` by `config.hours`
     - If `type='send_push|send_email|send_sms'`: invoke `send-marketing-campaign` with synthetic campaign payload OR direct send-push call
     - If `type='apply_promo'`: insert a per-user promo from `marketing_promo_codes` template
     - If `type='add_to_segment'`: tag user
     - Increment `current_step`; if past end, mark `status='completed', completed_at=now()`
- Updates `marketing_automations.enrolled_count` + `completed_count` on each tick.
- Returns `{ automations_processed, enrollments_created, steps_advanced, completed }`.

**pg_cron schedule** added via `INSERT` (not migration — contains URL + key) every 5 min hitting the tick function.

## 5. Promo code redemption — end-to-end attribution

- **`track-promo-redemption` edge function** (new): called from checkout when an order applies a promo code.
  - Input: `{ promo_code: string, user_id: uuid, order_id: uuid, discount_cents: int }`
  - Validates code is active, not expired, under `max_redemptions`, user under `per_customer_limit`, order meets `min_order_cents`.
  - Inserts `marketing_promo_redemptions` row.
  - Increments `marketing_promo_codes.redemption_count`.
  - If the promo is attached to a `marketing_campaigns` row (via `marketing_promo_codes.campaign_id`), writes a `marketing_campaign_events` row with `event_type='converted', revenue_cents=order.total_cents` for attribution.
  - Returns `{ ok, redemption_id, discount_cents }`.
- **Checkout integration** — find the existing checkout flow and add a single `supabase.functions.invoke('track-promo-redemption', ...)` call when a promo applies (non-blocking; logs on error).
- **Performance panel attribution** — `useUnifiedPerformance.ts` already reads `marketing_campaign_events`; with `event_type='converted'` rows now flowing in, promo conversions appear in the funnel ("Add to cart → Purchase" lift) and the channel mix donut without further changes.
- **Promo detail drawer** — `PromoCodesManager.tsx` row click opens a small drawer showing redemption count, total revenue attributed, top redeemers, and a 30-day redemption sparkline from `marketing_promo_redemptions`.

---

## Database additions

```sql
-- already added in prior migration:
-- marketing_automation_enrollments, marketing_promo_redemptions,
-- marketing_test_sends, store_ad_campaigns.draft_step, .archived_at

-- new for this pass:
alter table marketing_automations
  add column if not exists completed_at timestamptz,
  add column if not exists last_tick_at timestamptz;

alter table marketing_campaigns
  add column if not exists sent_at timestamptz;

alter table marketing_promo_codes
  add column if not exists campaign_id uuid references marketing_campaigns(id) on delete set null,
  add column if not exists per_customer_limit int;

create index if not exists idx_promo_redemptions_promo
  on marketing_promo_redemptions (promo_code_id, redeemed_at desc);
create index if not exists idx_promo_redemptions_user
  on marketing_promo_redemptions (user_id, redeemed_at desc);
```

RLS: store owners + admins read/write their own promo redemptions + automations.

## Edge function secrets

- `CRON_SECRET` — shared secret for pg_cron → tick function calls (added via secrets tool before deploy).
- Existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` already present.

## Files

**New edge functions**
- `supabase/functions/send-marketing-campaign/index.ts`
- `supabase/functions/marketing-automations-tick/index.ts`
- `supabase/functions/track-promo-redemption/index.ts`

**New components**
- `src/components/admin/ads/AdsCampaignRowMenu.tsx`
- `src/components/admin/marketing/SendTestDialog.tsx`
- `src/components/admin/marketing/NewCampaignChannelPicker.tsx` (small modal preceding the wizard)
- `src/components/admin/marketing/PromoRedemptionsDrawer.tsx`

**Edited**
- `src/components/admin/ads/AdsConnectDialog.tsx` — OAuth popup polling + reconnect path
- `src/components/admin/ads/AdsPlatformTile.tsx` — per-status pills + Reconnect/Disconnect popover
- `src/components/admin/ads/CreateCampaignWizard.tsx` — platform-gate redirect to AdsConnectDialog with preselect
- `src/components/admin/ads/AdsCampaignRow.tsx` — mount AdsCampaignRowMenu
- `src/components/admin/StoreAdsManager.tsx` — already toasts; add archive filter pill
- `src/components/admin/StoreMarketingSection.tsx` — Overview header swap + FAB + channel picker integration
- `src/components/admin/marketing/MarketingChannelTile.tsx` — Send test action wired
- `src/components/admin/marketing/PromoCodesManager.tsx` — row click opens PromoRedemptionsDrawer
- `src/hooks/useStoreAdsOverview.ts` — pause/resume/duplicate/archive/delete + reconnect/disconnect mutations
- `src/hooks/useStoreMarketingOverview.ts` — invokeSend mutation + sendTest helper
- `src/hooks/useMarketingPromoCodes.ts` — attach-to-campaign + redemptions query

**Migration**
- `supabase/migrations/<ts>_marketing_phase4_pass2.sql` — schema additions above

**Cron registration (insert tool, not migration)**
- `select cron.schedule('marketing-automations-tick', '*/5 * * * *', $$ select net.http_post(...) $$);`

## Build order

1. Secrets: `CRON_SECRET` (ask user to add before deploying tick function).
2. Migration: schema additions for automations / campaigns / promo codes + indexes.
3. Edge function `send-marketing-campaign` (handles real + test sends, writes events).
4. Edge function `marketing-automations-tick` (enrolls + advances + completes).
5. Edge function `track-promo-redemption` (validation + redemption + attribution event).
6. Cron registration via insert tool.
7. `AdsConnectDialog` OAuth popup polling + reconnect.
8. `AdsPlatformTile` per-status pills + Reconnect/Disconnect popover.
9. `useStoreAdsOverview` mutations: pause / resume / duplicate / archive / delete / disconnect / reconnect.
10. `AdsCampaignRowMenu` + integration into `AdsCampaignRow`.
11. `StoreMarketingSection` Overview restructure: stat strip + channel tiles + FAB + channel picker → wizard with preselect.
12. `SendTestDialog` + wire to `MarketingChannelTile` "Send test" buttons.
13. `PromoRedemptionsDrawer` + `PromoCodesManager` row click.
14. Checkout hook into `track-promo-redemption` (locate existing checkout, add non-blocking invoke).

---

## Recommendation

These 5 items are tightly interlocked — shipping them as one pass makes the whole Marketing & Ads surface feel "alive" (real connects, real sends, real automations, real attribution). If you want to split:

- **Slice A (steps 1–6):** Backend — secrets, schema, 3 edge functions, cron. Nothing visible yet but everything else depends on it.
- **Slice B (steps 7–10):** Ads end-to-end — connect/disconnect + row actions.
- **Slice C (steps 11–14):** Marketing Overview + send test + promo attribution.

Reply "all", "Slice A + B", or specific step numbers.

