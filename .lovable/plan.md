

# Personalized Home — Time-Aware, Behavior-Driven Content

## Overview

Add three new personalized rows to the AppHome screen that adapt to time of day and user behavior. These sit between the existing Services Grid (Zone 1) and the existing Quick Actions (Zone 3), replacing the current basic "Recent Activity" and "Recommended for You" sections with richer, smarter content.

## What Changes

### New file: `src/hooks/usePersonalizedHome.ts`

A single hook that encapsulates all personalization logic. Returns data for three sections plus a time-of-day context banner.

**Time-of-day logic:**
- Morning (5am-11am): Headline "Good Morning" with coffee/breakfast suggestions
- Lunch (11am-2pm): Headline "Lunchtime" with nearby restaurant deals
- Afternoon (2pm-5pm): Headline "Good Afternoon" with snack/coffee suggestions
- Evening (5pm-10pm): Headline "Dinner Time" with dinner and delivery promos
- Late night (10pm-5am): Headline "Late Night" with late-night delivery options

**Data queries (all React Query, auth-gated):**

1. **"Order Again" row** — Fetches the user's last 5 distinct restaurants from `food_orders` (status = delivered), joins `restaurants` for name, logo, cuisine, and rating. Deduplicates by `restaurant_id`.

2. **"Your Favorites" row** — Fetches from `user_favorites` where `item_type = 'restaurant'`, joins `restaurants` for display data. Falls back to top-rated restaurants if no favorites exist.

3. **"Recommended for You" row** — Combines signals:
   - Gets the user's most-ordered cuisine types from `food_orders` joined to `restaurants.cuisine_type`
   - Fetches restaurants matching those cuisine types that the user has NOT ordered from
   - Sorts by restaurant rating descending
   - Limits to 6 results
   - Falls back to top-rated restaurants near the user if no order history

4. **Time-based suggestions** — Filters restaurants by cuisine type keywords:
   - Morning: cuisine contains "cafe", "bakery", "breakfast", "coffee"
   - Lunch: all active restaurants sorted by rating
   - Evening: cuisine contains "dinner", "pizza", "sushi", "italian", "mexican", "indian", "chinese"
   - Late night: restaurants that are still open (if `hours` data is available), otherwise top-rated

### Updated file: `src/pages/app/AppHome.tsx`

Replace the current Zone 2 (basic "Recent Activity" + pill badges) with three new horizontal-scroll rows:

```
--- TIME CONTEXT BANNER ---
  "Lunchtime Picks" / "Breakfast Spots" / "Dinner & Delivery"
  (horizontal scroll of restaurant cards filtered by time)

--- ORDER AGAIN ---
  "Order Again"
  (horizontal scroll of restaurants from past orders)

--- YOUR FAVORITES ---
  "Your Favorites"
  (horizontal scroll of favorited restaurants)

--- RECOMMENDED FOR YOU ---
  "Recommended for You"
  (horizontal scroll of restaurants matching user's cuisine preferences)
```

Each row uses a compact restaurant card showing: cover image or logo, name, cuisine type, rating stars, and a chevron. Tapping navigates to `/eats/restaurant/:id`.

**For guests (not logged in):** Show only the time context banner with top-rated restaurants, and a "Recommended for You" row with popular restaurants. No "Order Again" or "Favorites" rows.

### Removed from AppHome

- The old "Recent Activity" horizontal scroll (emoji-based cards from trips/food/deliveries) — this data is still accessible via the quick actions and trips page
- The old "Recommended for You" pill badges ("Try ZIVO Ride", etc.)
- The related `recentActivity` and `recommendations` queries from AppHome (moved into the new hook)

### Kept in AppHome

- Zone 1 (Services Grid) — unchanged
- Zone 3 (Quick Actions: Reorder, Rebook Ride, Upcoming) — unchanged
- Recommended Deals section — unchanged
- Profile bar, search, bottom nav — unchanged

## Technical Detail

### usePersonalizedHome hook structure

```
Input: user (from useAuth)

Returns:
  timeContext: {
    period: "morning" | "lunch" | "afternoon" | "evening" | "late_night"
    headline: string (e.g. "Breakfast Spots")
    emoji: string
  }
  timeSuggestions: Restaurant[] (filtered by time-appropriate cuisine)
  orderAgain: Restaurant[] (from past delivered orders, deduplicated)
  favorites: Restaurant[] (from user_favorites)
  recommended: Restaurant[] (cuisine-match scoring)
  isLoading: boolean
```

### Sorting logic for "Recommended for You"

```
1. Get user's top 3 cuisine types from food_orders
2. Query restaurants matching those cuisines, excluding already-ordered ones
3. Score each: cuisineMatch (40%) + rating (40%) + isOpen bonus (20%)
4. Sort by score desc, take top 6
```

### Restaurant card component (inline in AppHome)

Small reusable component rendered in each row:
- 120px wide, rounded-2xl
- Cover image (100px height) with gradient overlay
- Restaurant name (truncated), cuisine type, star rating
- Tap navigates to `/eats/restaurant/:id`

### Query efficiency

All 4 queries run in parallel via separate `useQuery` calls inside the hook. Each has `staleTime: 60_000` (1 minute) since restaurant data doesn't change frequently. The time context is computed client-side with no query — just `new Date().getHours()`.

## File Summary

| File | Action | What |
|---|---|---|
| `src/hooks/usePersonalizedHome.ts` | Create | Hook with time-of-day logic, 4 personalized queries (time suggestions, order again, favorites, recommended) |
| `src/pages/app/AppHome.tsx` | Update | Replace Zone 2 with 4 personalized rows using the new hook; remove old recentActivity/recommendations queries |

Two file changes. No new routes, no schema changes. All data comes from existing `food_orders`, `restaurants`, `user_favorites`, and `eats_reviews` tables.
