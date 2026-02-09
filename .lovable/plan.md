
# Top Picks and Top Rated Sections

## Overview

The Eats mobile home (`MobileEatsPremium.tsx`) and desktop restaurants page (`EatsRestaurants.tsx`) currently show restaurants in a single feed sorted by rating. There are no dedicated "Top Rated" or "Most Popular This Week" sections, and no user-facing sort controls. The `restaurants` table already has `rating`, `total_orders`, and `avg_prep_time` columns, so no schema changes are needed.

## What Changes

### 1. New component: `TopPicksSection` (new file)

A reusable section component that displays two horizontal-scroll carousels on the Eats home screen:

- **Top Rated Restaurants**: Sorted by `rating DESC`, showing restaurants with rating >= 4.0
- **Most Popular This Week**: Sorted by `total_orders DESC`, showing the busiest restaurants

Each carousel uses the existing `RecommendationCard` component with a new `variant="topPick"` that shows a rank badge (1, 2, 3...).

### 2. Add sort controls to `MobileEatsPremium.tsx`

Below the category pills, add a sort-pill bar with four options:
- **Recommended** (default -- current rating sort)
- **Top Rated** (rating DESC)
- **Most Popular** (total_orders DESC)
- **Fast Delivery** (avg_prep_time ASC)

The selected sort re-orders the main restaurant feed. Uses simple inline pills matching the existing category pill design, no new dependencies.

### 3. Add sort controls to `EatsRestaurants.tsx` (desktop)

Add a sort dropdown (using existing `SortSelect` component) next to the search bar with the same four options: Recommended, Top Rated, Most Popular, Fast Delivery.

### 4. Update `RecommendationCard` with `topPick` variant

Add a small rank badge overlay (gold #1, silver #2, bronze #3, then plain for 4+) when `variant="topPick"` and a `rank` prop is provided.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/components/eats/TopPicksSection.tsx` | Create | Two carousels: Top Rated and Most Popular This Week |
| `src/components/eats/MobileEatsPremium.tsx` | Update | Add TopPicksSection above feed, add sort pills |
| `src/pages/EatsRestaurants.tsx` | Update | Add sort dropdown to desktop listing |
| `src/components/eats/RecommendationCard.tsx` | Update | Add `topPick` variant with rank badge |

## Technical Details

### TopPicksSection data

```text
Two queries, both from restaurants table:

Top Rated:
  WHERE status = 'active' AND rating >= 4.0
  ORDER BY rating DESC
  LIMIT 6

Most Popular:
  WHERE status = 'active' AND total_orders > 0
  ORDER BY total_orders DESC
  LIMIT 6
```

Both queries are wrapped in a single `useQuery` call with a 5-minute stale time to avoid extra requests.

### Sort pills (mobile)

```text
State: sortBy = 'recommended' | 'rating' | 'popular' | 'fast'

Applied to filteredRestaurants before rendering:
  'recommended' => order by rating DESC (current default)
  'rating'      => order by rating DESC, nulls last
  'popular'     => order by total_orders DESC, nulls last
  'fast'        => order by avg_prep_time ASC, nulls last
```

Sorting is done client-side since all restaurants are already fetched. The pill bar renders inline between category pills and the restaurant feed, using the same orange active / zinc inactive styling.

### Sort dropdown (desktop)

Uses the existing `SortSelect` component from `src/components/results/SortSelect.tsx` with custom options:

```text
const eatsSortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'fast', label: 'Fast Delivery' },
];
```

### Rank badge on RecommendationCard

When `variant="topPick"` and `rank` is provided:
- Rank 1: Gold badge with crown icon
- Rank 2: Silver badge
- Rank 3: Bronze badge
- 4+: Small numbered badge

Positioned in the top-left of the cover image, overlapping slightly.

### Edge cases

- Restaurants with null rating are placed last when sorting by rating
- Restaurants with null total_orders treated as 0
- Restaurants with null avg_prep_time placed last when sorting by fast delivery
- TopPicksSection hidden if fewer than 2 restaurants qualify for either list
- City filter from `useCustomerCity` still applies to all queries
