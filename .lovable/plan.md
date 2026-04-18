

## Goal
Upgrade the **Tier** step in `/creator/setup?step=tier` to support flexible subscription pricing (free, paid, custom, multiple billing intervals, free trial), and surface those tiers on the creator's public profile so fans can subscribe.

## What changes

### 1. Database — extend `subscription_tiers`
Add columns:
- `billing_interval` text — `'month' | '3_months' | '6_months' | 'year' | 'lifetime'`
- `is_free` boolean default false — free tier (members-only access, no payment)
- `trial_days` integer default 0 — free trial length (e.g. 3, 7, 14, 30)
- `is_custom_price` boolean default false — fan chooses their own amount (pay-what-you-want, with `price_cents` as the suggested minimum)

No data migration needed (defaults backfill cleanly).

### 2. Tier step UI rebuild — `src/pages/CreatorSetupPage.tsx` → `TierStep`
Replace the single-price form with a richer composer:

- **Tier type chips**: `Paid` · `Free` · `Pay what you want`
- **Billing period chips** (hidden when Free): `1 month` · `3 months` · `6 months` · `1 year` · `Lifetime`
- **Price input**: hidden when Free; labeled "Suggested minimum" when Pay-what-you-want; auto-calculated /mo helper text below ("$24.99 every 3 months ≈ $8.33/mo")
- **Free trial chips** (hidden when Free): `None` · `3 days` · `7 days` · `14 days` · `30 days`
- **Tier name** and **Perks** (existing)
- **Preview card** at the bottom showing how the tier will appear to fans
- Tier list above the form shows interval/trial/free badges per tier, with edit + delete actions (currently no edit — adding inline)

### 3. Surface tiers on creator profile
Find the existing creator profile page (or add a section if missing) and render the tiers as a "Subscribe" block:
- Card per active tier with name, price+interval, trial badge, perks
- "Subscribe" button → for paid tiers, opens existing checkout flow (`create-zivo-plus-checkout`-style edge function call, or insert into `creator_subscriptions` for free); for free tiers, one-tap join; for pay-what-you-want, opens an amount picker
- Hide the section on the creator's own profile (they see "Manage tiers" link to `/creator/setup?step=tier` instead)

### 4. Dashboard tier card
Update `CreatorDashboardPage.tsx` tier list rendering to show interval and trial info (small change, just display).

## Files changed
- `supabase/migrations/<new>.sql` — add 4 columns to `subscription_tiers`
- `src/pages/CreatorSetupPage.tsx` — rebuild `TierStep`
- `src/pages/CreatorDashboardPage.tsx` — display interval/trial in tier list
- Creator profile page (to be located on implementation) — add Subscribe section with tier cards
- (optional) New tiny edge function `subscribe-to-tier` to handle Stripe checkout for creator subs, OR reuse existing Stripe checkout pattern

## Open questions (defaults assumed unless you say otherwise)
- Payment for paid creator subs: route through Stripe Checkout (same pattern as `create-zivo-plus-checkout`) — assumed yes.
- Pay-what-you-want minimum: $0.99 — assumed.
- Lifetime billing: kept as an option since you mentioned "something like that" — say if you'd rather drop it.

