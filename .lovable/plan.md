

# ZIVO MVP: Payments, Dispatch, and Ads Launch

Four parallel workstreams to get the MVP revenue + growth loop live. Google Ads credentials are already configured; the rest needs build work.

---

## 1. Stripe Rider Payments + Driver Payouts

**Rider charge flow**
- New edge function `create-ride-payment` — creates a Stripe PaymentIntent (manual capture) when a ride is requested, using saved payment method or Checkout for first-time riders
- New edge function `capture-ride-payment` — captures the held amount on trip completion; computes 3.5% card surcharge (KH market) per existing memory
- Update `ride_requests` with `stripe_payment_intent_id`, `payment_status`, `captured_amount`, `surcharge_amount`
- Webhook handler `stripe-ride-webhook` for `payment_intent.succeeded` / `.payment_failed` / `.canceled`

**Driver payouts (Stripe Connect Express)**
- New table `driver_stripe_accounts` (driver_id, stripe_account_id, onboarded, payouts_enabled, charges_enabled)
- Edge function `driver-connect-onboard` — creates Connect Express account + returns onboarding link
- Edge function `driver-connect-status` — refreshes account capabilities
- Edge function `driver-payout` — transfers driver's share (fare − 2% platform fee per existing monetization memory) to their Connect account on trip completion
- Driver app screen: "Payouts" tab showing balance, pending transfers, "Complete onboarding" CTA

---

## 2. Real-Time Dispatch + Live ETA

Builds on existing `dispatch-and-matching-engine` (15s escalation, 25km radius).

- New edge function `dispatch-ride` — on ride request: query `drivers` within radius (PostGIS `ST_DWithin`), rank by distance + rating, insert `job_offers` rows
- New edge function `dispatch-escalate` (cron every 15s via pg_cron) — expires unanswered offers, widens radius, re-dispatches
- Driver-side: existing offer accept/decline flow → on accept, set `assigned_driver_id` and broadcast via Realtime
- Live ETA: extend `useCustomerLocationBroadcast` pattern with reverse channel — driver broadcasts GPS, edge function `compute-eta` calls Google Distance Matrix every 20s, writes `eta_minutes` to `ride_requests`
- Rider UI: `RideTrackingPage` already subscribes to `ride_requests` updates — add ETA pill to `DriverEnRouteTracker`

---

## 3. Google Ads Campaign + Conversion Verification

All credentials present (`GOOGLE_ADS_DEVELOPER_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`).

- Edge function `google-ads-create-campaign` — uses Google Ads REST API to create:
  - Campaign: "ZIVO MVP Launch — Search"
  - Budget: user-specified daily cap
  - Ad group with keywords (rides, food delivery, Cambodia variants)
  - Responsive Search Ad with ZIVO copy + landing URL `https://hizivo.com`
- Edge function `google-ads-conversion` — server-side conversion upload via Google Ads API for `Purchase`, `SignUp`, `RideBooked` events
- Wire into existing `metaConversion.ts` pattern → new `googleAdsConversion.ts` service called from same hook points (`trackPurchase`, `trackInitiateCheckout`)
- Admin page `/admin/ads/google` — campaign status, spend, conversions, test-fire conversion button to verify in Google Ads "Diagnostics"

---

## 4. Meta Ads Integration

Meta Conversions API already wired (`meta-conversion-handler` + `metaConversion.ts`). Missing: ad account access token + campaign launch.

- Add secret `META_ACCESS_TOKEN` (long-lived system user token from Meta Business)
- Add secret `META_AD_ACCOUNT_ID` and `META_PAGE_ID`
- Edge function `meta-ads-create-campaign` — Marketing API v21 calls to create Campaign → AdSet → AdCreative → Ad with ZIVO branding
- Update existing `ads-studio-publish/index.ts` Meta stub to call real Marketing API
- Admin page `/admin/ads/meta` mirroring Google admin UI

---

## Technical Details

**New tables**
- `driver_stripe_accounts` (RLS: driver sees own row, admin sees all)
- `ad_campaigns` (platform, external_id, name, status, daily_budget, spend, conversions) — unified across Google/Meta
- `conversion_events` (event_name, source, value, external_id, sent_at, response) — audit log

**Edge functions added**
- `create-ride-payment`, `capture-ride-payment`, `stripe-ride-webhook`
- `driver-connect-onboard`, `driver-connect-status`, `driver-payout`
- `dispatch-ride`, `dispatch-escalate`, `compute-eta`
- `google-ads-create-campaign`, `google-ads-conversion`
- `meta-ads-create-campaign`

**Secrets needed (will request after approval)**
- `STRIPE_SECRET_KEY` (live) — confirm present
- `STRIPE_WEBHOOK_SECRET` — for ride webhook
- `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_PAGE_ID`
- `GOOGLE_ADS_CUSTOMER_ID` (10-digit, unhyphenated)

**Cron**
- `dispatch-escalate` every 15s (pg_cron + pg_net)
- `compute-eta` every 20s while ride active

---

## Build Order

1. Stripe rider payments (unblocks revenue)
2. Driver Connect onboarding + payouts
3. Dispatch + ETA (parallel-safe with #1)
4. Google Ads campaign + conversion verify
5. Meta Ads campaign launch

Approve to switch to default mode and begin with workstream 1. I'll request the missing secrets at the moment each workstream needs them.

