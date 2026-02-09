

# Recommended Deals Section -- Home Page

## Overview

Neither the desktop home page (`Index.tsx`) nor the mobile app home (`AppHome.tsx`) currently display any personalized deal content. The `promotions` table and `useAllEatsPromotions` hook exist but only target eats. The `useUserBehavior` hook provides search history, budget tier, and destination preferences. The `FlashDealCard` component and `FlashDeal` type are fully built for travel deals but only used on the standalone `/deals` page.

## What Changes

### 1. Create `useRecommendedDeals` hook (new file)

A hook that fetches all active promotions from the database across all service types, then scores and sorts them client-side using three signals:

- **Order/search history**: Boost deals matching the user's recent search destinations or preferred service categories (from `useUserBehavior`)
- **Time of day**: Boost food/eats deals during meal windows (11am-2pm, 5pm-9pm), travel deals during evening browse hours (7pm-11pm)
- **Budget tier**: Boost deals whose discount value aligns with the user's tracked budget preference (budget users see higher-discount deals first, luxury users see premium deals first)

For first-time visitors with no history, falls back to a curated sort: highest discount percentage first, with urgency (ending soon) as a tiebreaker.

Returns the top 6 scored deals as a unified `RecommendedDeal` type that normalizes both database promotions and flash deals into a single card format.

### 2. Create `RecommendedDealsSection` component (new file)

A self-contained section component with:
- Heading: "Recommended Deals" with a sparkle icon
- Subheading that adapts: "Based on your recent searches" (if history exists) or "Trending deals for you" (if no history)
- Horizontal scrollable row on mobile, 3-column grid on desktop
- Each card shows: deal title, discount badge, service category icon, expiry countdown (if within 48h), and a CTA button
- "View All Deals" link that navigates to `/deals`

Uses the existing dark glass card aesthetic consistent with the rest of the home page.

### 3. Add section to desktop home page (`Index.tsx`)

Insert `RecommendedDealsSection` between "Popular Routes" and "Price Alert Promo" -- this is where deal-browsing intent is highest after users have seen route options.

### 4. Add section to mobile home page (`AppHome.tsx`)

Add a compact version of `RecommendedDealsSection` after the Quick Actions row and before the bottom nav padding. Uses horizontal scroll with snap-scrolling cards sized for mobile.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useRecommendedDeals.ts` | Create | Hook to fetch + score deals by history, time, budget |
| `src/components/home/RecommendedDealsSection.tsx` | Create | Desktop/mobile section rendering scored deal cards |
| `src/pages/Index.tsx` | Update | Add RecommendedDealsSection between Popular Routes and Price Alert Promo |
| `src/pages/app/AppHome.tsx` | Update | Add compact RecommendedDealsSection after Quick Actions |

## Technical Details

### Scoring algorithm

Each deal gets a base score of 50, then adjustments:

```text
+20  if deal destination matches a recent search destination
+15  if deal service category matches user's most-searched category
+10  if time of day matches deal type (meals during lunch/dinner, travel in evening)
+10  if discount_value aligns with budget tier (>30% for budget, 15-30% for mid, <15% for luxury)
+15  if deal ends within 24 hours (urgency boost)
+5   if deal ends within 48 hours
```

Final list sorted by score descending, top 6 returned.

### Data source

Query the `promotions` table with no `applicable_services` filter (to get all service types), then map each row to a normalized `RecommendedDeal`:

```text
RecommendedDeal {
  id, name, description, code,
  discountLabel (e.g. "20% OFF", "$5 OFF", "Free Delivery"),
  serviceType (derived from applicable_services[0]),
  expiresAt (from ends_at),
  score (calculated),
  href (deep link to relevant page)
}
```

### Routing from deal cards

- Flights/Hotels/Cars deals link to `/deals` with the deal pre-selected
- Eats deals link to `/eats` (or specific restaurant if merchant_id exists)
- Rides deals link to `/ride` with the promo code pre-filled

### No-deals state

If no active promotions exist in the database, the section renders nothing (hidden entirely). No empty state needed.

## Edge Cases

- **New user, no history**: Falls back to discount-percentage + urgency sorting with generic "Trending deals" heading
- **All deals expired during session**: Cards show countdown hitting zero, CTA disables
- **Only eats deals active**: Section still shows, just all eats cards
- **Mobile performance**: Horizontal scroll with CSS snap, no extra re-renders from scoring (memoized in hook)
