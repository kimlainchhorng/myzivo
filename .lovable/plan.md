

# Marketing & Ads — Full Overhaul (One Drop)

Complete redesign of `/admin/stores/:id` Marketing & Ads area: AI Studio, Ads tab, Performance, plus four new capability layers.

---

## 1. Visual Overhaul (all tabs)

- Replace flat cards with `zivo-card-organic` surfaces, emerald accent rail on active items, tighter v2026 density (text-[13px] body, p-3 cards, 11px meta labels)
- Sticky tab bar with icon + count badges (e.g., "Ads · 3 active")
- New 2-column wizard layout in AI Studio: stepper left, live preview right (so you see the ad mock as you build)
- Refresh empty states (illustrated) for Recommendations, Per-creative breakdown, Spend chart
- Mobile: collapse right column under main on `<lg`

---

## 2. AI Studio Wizard Polish (4 steps)

- **Step 1 — Goal**: 4 cards, hover-tilt, each shows expected outcome metric (e.g., "Visits: ~250 / $50 spend")
- **Step 2 — Audience** (NEW, replaces old step 2): Audience targeting builder
  - Geo radius slider (1–50 mi from store)
  - Age range double-slider, gender, interests multi-select (auto-suggested from store category)
  - Lookalike toggle: "Build from existing customers (last 90d)"
  - Saved audiences picker
- **Step 3 — Creative**: AI-generated headlines/images (Lovable AI gateway), 3 variant slots for A/B
- **Step 4 — Launch**: Budget + schedule (start/end date, time-of-day windows) + auto-winner toggle

---

## 3. Ads Tab Redesign + Real OAuth (Meta + Google)

- Platform cards become rich tiles: connection state pill (Connected / Not connected / Pending review), last-sync time, account name when linked
- **Meta OAuth** (FB + IG combined since same App):
  - New edge function `meta-oauth-start` → builds Facebook Login URL with `ads_management,ads_read,business_management,pages_read_engagement,instagram_basic` scopes
  - New edge function `meta-oauth-callback` → exchanges code for long-lived token, stores in new `store_ad_platform_connections` table
  - Requires you to add `META_APP_ID` + `META_APP_SECRET` secrets
- **Google Ads OAuth**:
  - `google-ads-oauth-start` / `google-ads-oauth-callback` with `https://www.googleapis.com/auth/adwords` scope
  - Stores refresh_token + customer_id selection step
  - Requires `GOOGLE_ADS_CLIENT_ID` + `GOOGLE_ADS_CLIENT_SECRET` + `GOOGLE_ADS_DEVELOPER_TOKEN`
- **TikTok / X**: Keep polished "Request access" state — button opens dialog explaining waitlist, captures email, logs to `ad_platform_access_requests` table (so you can prioritize when API approval lands)
- New "Manage connection" dropdown per tile: Refresh sync, Disconnect, View permissions
- Test campaign launcher (sandbox mode) once Meta or Google is connected

---

## 4. Performance Dashboard Upgrade

- Real metrics fetched from `ads_studio_daily_spend` (already exists in schema) joined with `ads_studio_events`
- Chart switches: Spend / Impressions / Clicks / Conversions — Recharts area chart with emerald gradient
- Date range presets: 7d / 30d / 90d / Custom
- Per-creative breakdown table with sort + CSV export button
- ROAS, CTR, CVR, CPC pills with WoW delta arrows
- "Compare period" toggle (overlays previous period dashed line)

---

## 5. Wallet — Stripe Top-up + Auto-recharge

- New edge function `create-ads-wallet-topup` → Stripe Checkout (one-time, $25/$50/$100/$250/custom)
- New edge function `verify-ads-wallet-topup` → on success, increments `ads_studio_wallet.balance_cents` + writes `ads_wallet_ledger` row
- New table `ads_studio_wallet` (store_id, balance_cents, auto_recharge_enabled, threshold_cents, recharge_amount_cents, stripe_customer_id)
- New table `ads_wallet_ledger` (id, store_id, type: topup|spend|refund, amount_cents, balance_after_cents, ref_id, created_at)
- "Auto-recharge when low" toggle: enables saving a card for future off-session charges. When `balance_cents < threshold_cents`, edge function `auto-recharge-ads-wallet` charges saved card via Stripe `payment_intents.create` with `off_session: true`
- New cron (every 15 min) checks wallets needing top-up
- Top-up modal: amount selector, Stripe Checkout redirect, returns to `/admin/stores/:id?topup=success`
- Billing history list under wallet card

---

## 6. AI Recommendations Engine

- New edge function `generate-ads-recommendations` → calls Lovable AI gateway (`google/gemini-3-flash-preview`) with last 14d of `ads_studio_daily_spend` + `ads_studio_creatives` + `ads_studio_events` for the store
- Structured tool-call output: `[{type: 'budget'|'creative'|'audience'|'pause', title, body, estimated_impact, action_payload}]`
- Stored in existing `ads_studio_recommendations` table (already in schema)
- "Generate" button replaces empty state with cards; each card has Apply / Dismiss buttons
- Apply writes corresponding change (e.g., budget bump updates `ads_studio_creatives.budget`, pause flips `status='paused'`)

---

## 7. Campaign Scheduler + A/B Variants

- Step 4 of wizard already collects schedule; add backend support
- New columns on `ads_studio_creatives`: `schedule_start timestamptz`, `schedule_end timestamptz`, `daypart_windows jsonb` (e.g., `[{day:'mon', from:'09:00', to:'18:00'}]`), `auto_winner_threshold_impressions int default 1000`, `auto_winner_metric text default 'ctr'`
- New cron `process-ads-schedule` (every 5 min):
  - Activates `scheduled` creatives whose `schedule_start <= now()`
  - Pauses outside daypart windows
  - When a creative passes `auto_winner_threshold_impressions`, picks variant with best `auto_winner_metric` and pauses losers
- A/B already in schema (`ads_studio_variants`); add UI: side-by-side variant cards with live CTR/CVR pills, "Pick winner" manual override

---

## 8. Audience Targeting Builder

- New table `store_ad_audiences` (id, store_id, name, definition jsonb, created_at)
- Definition shape: `{geo: {lat, lng, radius_mi}, age: {min, max}, gender, interests: string[], lookalike_seed?: 'past_customers'}`
- Builder UI inside Step 2 of wizard with live "Estimated reach" pill (rough heuristic: radius² × density factor; will be replaced by platform reach API once OAuth live)
- Save / load audiences across campaigns

---

## Technical Details

**New edge functions**
- `meta-oauth-start`, `meta-oauth-callback`
- `google-ads-oauth-start`, `google-ads-oauth-callback`
- `create-ads-wallet-topup`, `verify-ads-wallet-topup`, `auto-recharge-ads-wallet`
- `generate-ads-recommendations`
- `apply-ads-recommendation`

**New tables**
- `store_ad_platform_connections` (store_id, platform, account_id, account_name, access_token, refresh_token, token_expires_at, scopes, status)
- `ads_studio_wallet`, `ads_wallet_ledger`
- `store_ad_audiences`
- `ad_platform_access_requests` (for TikTok/X waitlist)

**New columns on `ads_studio_creatives`**
- `schedule_start`, `schedule_end`, `daypart_windows`, `auto_winner_threshold_impressions`, `auto_winner_metric`, `audience_id`

**New components**
- `MarketingAdsHeader` (sticky tab bar redesign)
- `AiStudioWizardV2` with `WizardStepGoal`, `WizardStepAudience`, `WizardStepCreative`, `WizardStepLaunch`
- `AdsPlatformTile` (rich connection card)
- `WalletTopUpModal`, `WalletAutoRechargeSettings`, `WalletLedgerList`
- `RecommendationCard` with apply/dismiss
- `AudienceBuilder`, `AudienceReachEstimator`
- `ABVariantCompare`
- `PerformanceChartV2` (Recharts)

**Updated files**
- `src/pages/admin/stores/StoreMarketingAds.tsx` (or equivalent) — full restructure

**Secrets needed (will request)**
- `META_APP_ID`, `META_APP_SECRET`
- `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`

**Cron jobs**
- `auto-recharge-ads-wallet` — every 15 min
- `process-ads-schedule` — every 5 min

**Auth**
- All admin/store-owner edge functions: validate JWT + verify caller owns store (`restaurants.user_id = auth.uid()` or `has_role('admin')`)
- OAuth callbacks: validate `state` param against signed nonce stored briefly in `oauth_state_nonces` table

---

## Build Order

1. Migration: all new tables + columns + RLS
2. Stripe wallet (top-up + auto-recharge cron + ledger)
3. AI recommendations engine (works without OAuth)
4. Visual overhaul + wizard V2 + audience builder + A/B compare
5. Meta OAuth (after secrets added)
6. Google Ads OAuth (after secrets added)
7. Performance dashboard V2 + CSV export
8. Scheduler cron

---

## What I'll need from you

After approval I'll request these secrets in one batch:
- `META_APP_ID`, `META_APP_SECRET`
- `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`

Redirect URIs you'll need to register in each provider's dashboard:
- Meta: `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/meta-oauth-callback`
- Google: `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/google-ads-oauth-callback`

Approve to switch to default mode and ship.

