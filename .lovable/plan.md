

# Pass 2 finish — last 4 items

Wrap up the remaining work from the approved Pass 2 plan.

## 1. pg_cron schedule for `marketing-automations-tick`
Register a cron job (every 5 min) that POSTs to the edge function with `Authorization: Bearer ${CRON_SECRET}`. Done via the Supabase insert tool (not migration) since it contains the function URL and key. Also enables `pg_cron` and `pg_net` extensions if not already on.

## 2. Mount `SendTestDialog` on `MarketingChannelTile`
Replace the current "Send test" button's inline `toast.success` placeholder with state that opens `SendTestDialog`, passing `storeId` + `channel`. Dialog already invokes `send-marketing-campaign` with `is_test=true` and writes to `marketing_test_sends`.

## 3. Marketing Overview restructure
In `StoreMarketingSection.tsx` Overview tab:
- Top: `<MarketingStatStrip stats={data?.stats} isLoading={isLoading} />`
- Below: 4-tile grid of `<MarketingChannelTile>` (push / email / sms / inapp) reading from `data?.channels`
- Sticky FAB (mobile, `safe-area-inset-bottom`) + pill button (desktop, top-right) labeled **"+ New Campaign"**
- Click → opens `<NewCampaignChannelPicker>` (channel picker modal already built) → on selection opens `CreateMarketingCampaignWizard` with `defaultChannel` prop preselected
- Add `defaultChannel?: string` prop to `CreateMarketingCampaignWizard` so step 1 starts with that channel marked

## 4. Checkout hook → `track-promo-redemption`
Locate the existing checkout completion path (search `orders` insert + `promo_code` apply). Add a single non-blocking `supabase.functions.invoke('track-promo-redemption', { body: { promo_code, user_id, order_id, discount_cents } })` call right after order success. Wrap in try/catch with `console.warn` so a failed attribution never blocks the checkout.

## Files

**Edited**
- `src/components/admin/marketing/MarketingChannelTile.tsx` — wire SendTestDialog
- `src/components/admin/StoreMarketingSection.tsx` — Overview restructure + FAB + channel-picker → wizard
- `src/components/admin/marketing/CreateMarketingCampaignWizard.tsx` — accept + apply `defaultChannel`
- Checkout component (TBD by search — likely `src/pages/checkout/*` or `src/components/cart/CheckoutFlow.tsx`) — invoke track-promo-redemption

**Cron registration (insert tool, not migration)**
- `cron.schedule('marketing-automations-tick', '*/5 * * * *', ...)` posting to the function URL with `CRON_SECRET` bearer

## Build order
1. Cron registration (enables backend automation loop immediately)
2. `MarketingChannelTile` → `SendTestDialog` wiring
3. `CreateMarketingCampaignWizard` `defaultChannel` prop
4. `StoreMarketingSection` Overview restructure + FAB + channel picker
5. Checkout → `track-promo-redemption` invoke

Reply "go" to ship all 5 in one pass.

