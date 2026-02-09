
# Smart Recommendations for ZIVO Eats — Implementation Plan

## Overview
Add personalized recommendations to help customers reorder faster and discover relevant meals based on their order history, favorites, and time-of-day patterns.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Reorder button on orders | Complete | `src/pages/EatsOrders.tsx` |
| Reorder hook | Complete | `src/hooks/useReorder.ts` |
| Favorites hook | Complete | `src/hooks/useEatsFavorites.ts` |
| Orders hook | Complete | `src/hooks/useEatsOrders.ts` |
| Mobile home screen | Complete | `src/components/eats/MobileEatsPremium.tsx` |
| Restaurant data | Complete | `src/lib/eatsApi.ts` |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| "Recommended for you" section | Missing | Personalized recommendations on home screen |
| Timing suggestions | Missing | "Popular for lunch/dinner" labels |
| Smart recommendations hook | Missing | Logic to compute recommendations |
| Recommendation card component | Missing | UI for individual recommendations |

---

## Implementation Plan

### 1) Create Smart Recommendations Hook

**File to Create:** `src/hooks/useEatsRecommendations.ts`

**Purpose:** Calculate personalized recommendations from multiple data sources.

**Data Sources:**
1. **Previous Orders** — Last 10 orders to identify frequent restaurants/items
2. **Favorite Restaurants** — User's saved favorites
3. **Time-Based Popularity** — Tag restaurants as "lunch" or "dinner" based on cuisine and time

**Returned Data:**
```
interface EatsRecommendations {
  // Top picks based on order history
  reorderSuggestions: Array<{
    restaurant: Restaurant;
    orderCount: number;
    lastOrderedAt: Date;
    topItems: string[];
  }>;
  
  // From favorites
  favoriteSuggestions: Restaurant[];
  
  // Time-based
  timingSuggestions: Array<{
    restaurant: Restaurant;
    timing: "lunch" | "dinner" | "late_night";
    reason: string;
  }>;
  
  // Loading states
  isLoading: boolean;
}
```

**Recommendation Logic:**
1. **Order Frequency** — Count orders per restaurant from last 10 orders
2. **Recency** — Boost restaurants ordered in the last 7 days
3. **Time Matching** — Match cuisine to meal time (e.g., coffee shops for morning, fast food for lunch, fine dining for dinner)

---

### 2) Create Recommendation Card Component

**File to Create:** `src/components/eats/RecommendationCard.tsx`

**Purpose:** Compact, visually appealing card for a single recommendation.

**Variants:**
- **Reorder Card** — Shows restaurant with "Order again" button
- **Favorite Card** — Shows favorite with heart icon
- **Timing Card** — Shows "Popular for lunch" badge

**UI Design:**
```
+------------------------------------------+
| [Image]  Restaurant Name        [Reorder]|
|          2 orders · Last week            |
|          ⭐ 4.8 · Italian                |
+------------------------------------------+
```

---

### 3) Create Recommendations Section Component

**File to Create:** `src/components/eats/RecommendedForYouSection.tsx`

**Purpose:** "Recommended for you" section with horizontal scrollable cards.

**Sections:**
1. **Order Again** — From previous orders (limit 3)
2. **Your Favorites** — From saved favorites (limit 3)
3. **Popular Now** — Time-based suggestions

**UI Structure:**
```
Recommended for you
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Again
[Card 1]  [Card 2]  [Card 3]  →

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Popular for Lunch
[Card 1]  [Card 2]  →
```

---

### 4) Create Timing Suggestions Component

**File to Create:** `src/components/eats/TimingSuggestionBadge.tsx`

**Purpose:** Show contextual badges like "Popular for lunch" or "Great for dinner".

**Time Ranges:**
| Period | Hours | Label |
|--------|-------|-------|
| Breakfast | 6 AM - 11 AM | "Popular for breakfast" |
| Lunch | 11 AM - 3 PM | "Popular for lunch" |
| Dinner | 5 PM - 9 PM | "Popular tonight" |
| Late Night | 9 PM - 2 AM | "Late night craving?" |

**Cuisine Mapping:**
- **Breakfast:** Coffee, Bakery, Brunch
- **Lunch:** Fast Food, Healthy, Asian, American
- **Dinner:** Italian, Fine Dining, Steakhouse
- **Late Night:** Fast Food, Pizza, Mexican

---

### 5) Update Mobile Home Screen

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

**Changes:**
- Add "Recommended for you" section after surge banner, before categories
- Show only when user has order history or favorites
- Horizontal scroll with snap points

**Integration Point (after line 112, before category pills):**
```tsx
{/* Smart Recommendations */}
<RecommendedForYouSection />
```

---

### 6) Add Time-Based Labels to Restaurant Cards

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

**Changes:**
- Add timing badge to restaurant cards when relevant
- Show "Popular for lunch" during lunch hours for matching cuisines
- Non-intrusive small badge in top-left corner

---

## File Summary

### New Files (4)
| File | Purpose |
|------|---------|
| `src/hooks/useEatsRecommendations.ts` | Calculate personalized recommendations |
| `src/components/eats/RecommendationCard.tsx` | Individual recommendation card |
| `src/components/eats/RecommendedForYouSection.tsx` | "Recommended for you" section |
| `src/components/eats/TimingSuggestionBadge.tsx` | Time-based popularity badge |

### Modified Files (1)
| File | Changes |
|------|---------|
| `src/components/eats/MobileEatsPremium.tsx` | Add recommendations section and timing badges |

---

## Recommendation Algorithm

### Restaurant Frequency Score
```
For each restaurant in last 10 orders:
  frequency_score = order_count * 10
  
  If ordered within 7 days:
    recency_bonus = 5
  Else if ordered within 30 days:
    recency_bonus = 2
  Else:
    recency_bonus = 0
  
  total_score = frequency_score + recency_bonus
```

### Time Matching Score
```
current_hour = new Date().getHours()

If 6 <= hour < 11:  // Breakfast
  Match: Coffee, Bakery, Brunch → +10
  
If 11 <= hour < 15:  // Lunch
  Match: Fast Food, Healthy, Asian → +10
  
If 17 <= hour < 21:  // Dinner
  Match: Italian, Fine Dining, Mexican → +10
  
If 21 <= hour OR hour < 2:  // Late Night
  Match: Pizza, Fast Food → +10
```

### Final Ranking
```
final_score = frequency_score + recency_bonus + timing_score
Sort by final_score descending
Return top 3-5 restaurants
```

---

## Time Context Display

| Current Time | Label Shown |
|--------------|-------------|
| 7:30 AM | "Great for breakfast" |
| 12:15 PM | "Popular for lunch" |
| 6:45 PM | "Popular tonight" |
| 10:30 PM | "Late night craving?" |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| New user (no orders) | Hide "Order Again", show only time-based |
| No favorites | Hide favorites section |
| All restaurants closed | Show with "Opens at X" badge |
| Guest user | Show only time-based recommendations |
| Low order history (<3) | Pad with popular nearby |

---

## UI Components

### Recommendation Card (Compact)
```
+------------------------------------------------+
| [32x32 Logo]                                   |
|   Restaurant Name              [🔄 Reorder]    |
|   ⭐ 4.8 · Italian · 20-30 min                 |
|   "Ordered 3 times"                            |
+------------------------------------------------+
```

### Section Header
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Order Again                        See all →
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Timing Badge
```
+------------------+
| 🕐 Popular for lunch |
+------------------+
```

---

## Technical Details

### Data Fetching Strategy
- Use existing `useMyEatsOrders()` hook for order history
- Use existing `useEatsFavorites()` hook for favorites
- Use existing `useRestaurants()` hook for restaurant data
- Combine all in `useEatsRecommendations()` with `useMemo`

### Caching
- Recommendations are derived from cached queries
- No additional API calls needed
- Recomputes when dependencies change

### Performance
- Limit to 10 orders for calculation
- Limit display to 3-5 recommendations per section
- Lazy load images

---

## Summary

This implementation provides:

1. **"Recommended for you" section** — Personalized suggestions on home screen
2. **Order Again cards** — Quick reorder from frequent restaurants  
3. **Timing suggestions** — "Popular for lunch/dinner" context
4. **Smart ranking algorithm** — Frequency + recency + time matching
5. **One-tap reorder** — Already implemented via `useReorder` hook
6. **No new API calls** — Uses existing cached data

The feature respects user privacy (all recommendations computed client-side) while providing a personalized experience that speeds up ordering.
