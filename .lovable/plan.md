## Goal
On each property card on `/hotels`, show the cheapest nightly rate. If the property has an active discount (from `lodging_promotions` or `lodge_rooms.weekly_discount_pct`), show the **discounted price in green with the original price struck through** and a small "-X% OFF" badge.

## Data sources
- `lodge_rooms.base_rate_cents` — already fetched (min per `store_id`).
- `lodge_rooms.weekly_discount_pct` / `monthly_discount_pct` — applies when `nights >= 7` / `>= 28`.
- `lodging_promotions` — table with `store_id`, `promo_type` (`percent` | `fixed`), `discount_value`, `active`, `starts_at`, `ends_at`, `min_nights`, `max_nights`, `member_only`. We'll consider rows where:
  - `active = true`
  - `now()` between `starts_at` and `ends_at` (or null bounds)
  - `member_only = false` (public-facing display)
  - `nights` satisfies min/max
  - Pick the **biggest discount** per `store_id`.

## Changes to `src/pages/lodging/HotelsLandingPage.tsx`

1. **New query `promotionsQuery`** — fetch active public promotions, build a `Record<storeId, { type, value, name }>` keeping the largest effective discount per store.

2. **Extend `ratesQuery`** — also pull `weekly_discount_pct` & `monthly_discount_pct` so we can apply stay-length discounts when no promo applies.

3. **Compute discount in `PropertyCard`**:
   ```ts
   const baseCents = minRateCents;            // original /night
   let discountedCents = baseCents;
   let pctOff = 0;
   let label = "";

   if (promo?.type === "percent") {
     discountedCents = Math.round(baseCents * (1 - promo.value / 100));
     pctOff = Math.round(promo.value);
     label = promo.name || `${pctOff}% OFF`;
   } else if (promo?.type === "fixed") {
     discountedCents = Math.max(0, baseCents - promo.value * 100);
     pctOff = Math.round((1 - discountedCents / baseCents) * 100);
     label = promo.name || `$${promo.value} OFF`;
   } else if (nights >= 28 && monthlyPct) { … }
   else if (nights >= 7 && weeklyPct) { … }
   ```

4. **Card UI** (replaces current "$X /night" line):
   - If discounted: 
     - `text-emerald-600 font-bold` → `$discounted /night`
     - `text-[11px] line-through text-muted-foreground` → `$base`
     - small emerald pill `-15% OFF` (or promo name if short)
     - total line: `$total · {nights} night(s)` using discounted rate
   - If not discounted: keep current single-price display.

5. **List sorting tweak** — when "Lowest price" is the implicit order (default), sort by **effective discounted price** so deals surface first. (Existing order remains otherwise.)

6. **Empty/loading** — promotions query failure should silently fall back to base price (no UI breakage).

## Out of scope
- Coupon code entry, member-only promos, per-room (vs per-property) discount math, and pricing on the detail page — those stay as-is for now.

Shall I proceed?