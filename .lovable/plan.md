

# Smart Offers — "Limited-time offers for you" Home Section

## Overview

Create a new "Limited-time offers for you" section on the home page that automatically shows targeted offers based on three triggers: customer inactivity (days since last order), low order frequency, and active zone-specific marketing campaigns. This replaces/supplements the existing "Recommended Deals" section with smarter, trigger-based targeting.

## Current State

- **`useRecommendedDeals`** scores all active promotions by user behavior (search history, time-of-day, budget) but has no concept of inactivity, order frequency, or zone campaigns
- **`useWinBackOffer`** detects inactivity (7/14/30 day tiers) and fetches win-back promos, but only powers the `WinBackBanner` -- never feeds the deals section
- **`RecommendedDealsSection`** shows a grid/scroll of scored deals titled "Recommended Deals" -- no urgency framing or trigger awareness
- **`marketing_campaigns`** table has `target_city`, `campaign_type`, `status`, `promo_code_id`, and date fields -- perfect for zone-specific campaign detection
- **Profiles** have `selected_city_name` and `zone_id` for geo-matching

## What Changes

### 1. Create `src/hooks/useSmartOffers.ts` -- Unified trigger-based offer engine

A new hook that combines three trigger signals and returns a prioritized list of offers:

**Trigger A -- Inactivity** (reuses win-back logic):
- Query `food_orders` for last delivered order date
- 7+ days inactive = eligible for gentle offers
- 14+ days = stronger discount offers
- 30+ days = highest-value offers

**Trigger B -- Low order frequency**:
- Count orders in the past 30 days
- 0-1 orders = "low frequency" flag, boost discount-heavy offers
- 2-3 orders = "medium", show lighter offers
- 4+ = active user, show campaign/seasonal offers only

**Trigger C -- Active zone campaign**:
- Query `marketing_campaigns` where `status = 'active'`, date range is current, and `target_city` matches the user's `selected_city_name`
- Join to `promotions` via `promo_code_id` to get the actual promo details
- These offers get a large score boost since they're admin-curated for the user's area

**Scoring**: Each offer gets a composite score:
- Base score from `useRecommendedDeals`-style logic (time-of-day, budget tier, urgency)
- +25 for inactivity-triggered offers matching the user's tier
- +20 for zone campaign matches
- +15 for low-frequency users seeing high-discount offers
- Expiring-soon offers get additional urgency boost

**Output**:
```
offers: SmartOffer[]       // Scored and sorted
triggerReason: string      // "inactivity" | "low_frequency" | "campaign" | "general"
sectionTitle: string       // Dynamic: "Limited-time offers for you" or "Offers in [city]"
isLoading: boolean
hasOffers: boolean
```

### 2. Create `src/components/home/SmartOffersSection.tsx` -- New home page section

A visually distinct section titled "Limited-time offers for you" with:
- Dynamic subtitle based on trigger reason (e.g., "We picked these just for you" for inactivity, "Hot in [city]" for zone campaigns)
- Same `DealCard` component pattern as `RecommendedDealsSection` (grid on desktop, horizontal scroll on mobile)
- Subtle trigger badge on cards when relevant: "For You" (inactivity), "In Your Area" (zone campaign)
- Countdown timers for expiring offers (reuses existing `Countdown` component pattern)
- "View All" link to `/deals`

### 3. Update `src/pages/Index.tsx` -- Replace RecommendedDealsSection with SmartOffersSection

- Import `SmartOffersSection` instead of (or alongside) `RecommendedDealsSection`
- For signed-in users: show `SmartOffersSection` (trigger-aware)
- For signed-out users: fall back to `RecommendedDealsSection` (general deals)
- Position remains the same (after Popular Routes)

### 4. Update `src/pages/app/AppHome.tsx` -- Add SmartOffersSection to mobile home

- Replace the `RecommendedDealsSection` at the bottom with `SmartOffersSection` for signed-in users
- Keep `RecommendedDealsSection` for signed-out visitors

## Technical Detail

### useSmartOffers query flow

```text
1. Fetch user profile (selected_city_name, zone_id) from profiles table
2. Parallel queries:
   a. Last order date from food_orders (for inactivity detection)
   b. Order count in last 30 days from food_orders (for frequency detection)
   c. Active zone campaigns from marketing_campaigns 
      WHERE status = 'active' 
      AND start_date <= now AND end_date >= now
      AND (target_city = user_city OR target_city IS NULL)
   d. Active promotions (same query as useRecommendedDeals)
3. Score and merge all sources
4. Deduplicate (campaign promo overlaps with general promos)
5. Return top N sorted by score
```

### SmartOffer interface

```typescript
interface SmartOffer extends RecommendedDeal {
  triggerType: "inactivity" | "low_frequency" | "campaign" | "general";
  triggerLabel: string | null;  // "For You", "In Your Area", null
  campaignName: string | null;  // From marketing_campaigns.name
}
```

### Section title logic

```text
Has zone campaign offers  -> "Offers in {city}"
Inactivity triggered      -> "Limited-time offers for you"
Low frequency triggered   -> "Deals you don't want to miss"
General (active user)     -> "Today's best offers"
```

### Deduplication with automated_message_log

Log when the smart offers section is shown (once per session per trigger type) to prevent over-exposure, using the same `automated_message_log` table pattern as `useWinBackOffer`.

## File Summary

| File | Action | What |
|---|---|---|
| `src/hooks/useSmartOffers.ts` | Create | Unified trigger-based offer scoring hook with inactivity, frequency, and campaign signals |
| `src/components/home/SmartOffersSection.tsx` | Create | "Limited-time offers for you" section with trigger badges and dynamic title |
| `src/pages/Index.tsx` | Update | Show `SmartOffersSection` for signed-in users, keep `RecommendedDealsSection` for signed-out |
| `src/pages/app/AppHome.tsx` | Update | Same swap for mobile home page |

Two new files, two updates. No schema changes, no new edge functions.

