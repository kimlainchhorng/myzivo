

# Achievements & Badges — Implementation Plan

## Overview
Create a `/account/achievements` page showing earned badges with progress toward the next badge, using the existing `zivo_badges` and `zivo_user_badges` database tables. Seed new customer-focused badge definitions and build a hook to calculate progress. Optionally award loyalty points when a badge is unlocked.

---

## Current State

### Already Exists (No Changes Needed)
| Component | Details |
|-----------|---------|
| `zivo_badges` table | Badge definitions with `criteria_type`, `criteria_threshold`, `category`, `tier` |
| `zivo_user_badges` table | User-earned badges with `earned_at`, `is_featured` |
| 1 customer badge seeded | "Loyal Traveler" — 25+ bookings |
| `useLoyaltyPoints` hook | Points earning and balance management |
| `useSpendingStats` hook | Unified order history across eats, rides, travel |
| Routing pattern | `/account/*` pages with `ProtectedRoute` wrapper |

### What's Missing
- No customer achievement badges (First Order, 5/10 Orders, Order Streak)
- No achievements page UI
- No hook to compute badge progress from order history
- No points reward on badge unlock

---

## Implementation Plan

### 1) Seed Customer Badges into `zivo_badges`

**Database migration** to insert new customer achievement badges:

| Badge ID | Name | Criteria Type | Threshold | Category | Tier |
|----------|------|--------------|-----------|----------|------|
| `first_order` | First Order | `order_count` | 1 | customer | bronze |
| `orders_5` | Regular | `order_count` | 5 | customer | silver |
| `orders_10` | Super Fan | `order_count` | 10 | customer | gold |
| `orders_25` | Loyal Traveler | (already exists) | 25 | customer | gold |
| `streak_3` | Hot Streak | `order_streak` | 3 | customer | silver |
| `first_eats` | Foodie | `eats_count` | 1 | customer | bronze |
| `first_ride` | Rider | `ride_count` | 1 | customer | bronze |
| `first_travel` | Jet Setter | `travel_count` | 1 | customer | bronze |

### 2) Create `useCustomerAchievements` Hook

**New file:** `src/hooks/useCustomerAchievements.ts`

**Purpose:** Fetch all customer-category badges from `zivo_badges`, user's earned badges from `zivo_user_badges`, and compute progress for each from order data.

**Returns:**
```text
{
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
    earned: boolean;
    earnedAt: string | null;
    progress: number;       // 0-100
    currentValue: number;   // e.g. 3 orders
    threshold: number;      // e.g. 5 orders
  }>;
  totalEarned: number;
  totalAvailable: number;
  isLoading: boolean;
}
```

**Progress computation:**
- `order_count`: Total delivered food orders + completed rides + confirmed travel orders
- `eats_count` / `ride_count` / `travel_count`: Per-service counts
- `order_streak`: Consecutive days with at least one order (calculated from order dates)

### 3) Create `AchievementsPage` Component

**New file:** `src/pages/account/AchievementsPage.tsx`

**Layout:**
```text
+----------------------------------------------+
|  <- Achievements                             |
|  Track your progress                         |
+----------------------------------------------+
|                                              |
|  [Summary Card]                              |
|  X / Y Badges Earned                         |
|                                              |
|  --- Earned Badges ---                       |
|  [Badge] [Badge] [Badge]                     |
|  (golden glow, earned date)                  |
|                                              |
|  --- In Progress ---                         |
|  [Badge Card]                                |
|  "Regular" — 3 / 5 orders [=====----] 60%   |
|                                              |
|  [Badge Card]                                |
|  "Hot Streak" — 1 / 3 days [===-------] 33% |
|                                              |
|  --- Locked ---                              |
|  [Badge] [Badge] (greyed out)                |
+----------------------------------------------+
```

**Design:**
- Summary card showing earned count with a progress ring
- Earned badges shown as icons with golden highlight and earned date
- In-progress badges shown as cards with progress bars
- Locked badges shown greyed out with lock icon

### 4) Add Route and Navigation

**Modified files:**
- `src/App.tsx` — Add lazy import and route for `/account/achievements`
- `src/pages/Profile.tsx` — Add "Achievements" quick link with Trophy icon

### 5) Optional: Points Reward on Badge Unlock

Inside the `useCustomerAchievements` hook, add a mutation `claimBadge` that:
1. Inserts into `zivo_user_badges`
2. Awards bonus loyalty points via `loyalty_points` update
3. Shows a toast celebration

| Badge Tier | Points Reward |
|-----------|---------------|
| Bronze | 50 points |
| Silver | 100 points |
| Gold | 250 points |

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useCustomerAchievements.ts` | Fetch badges, compute progress, claim badges |
| `src/pages/account/AchievementsPage.tsx` | Full achievements page UI |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add lazy import and `/account/achievements` route |
| `src/pages/Profile.tsx` | Add "Achievements" quick link |

### Database Changes (1 migration)
| Change | Details |
|--------|---------|
| Seed `zivo_badges` | 7 new customer badge definitions |

---

## Badge Progress Calculation

```text
User's order history (from Supabase)
       |
       v
  Count by service:
       ├── food_orders (status = 'delivered') → eats_count
       ├── trips (status = 'completed') → ride_count
       ├── travel_orders (status IN 'confirmed','completed') → travel_count
       |
       ├── Total = eats + rides + travel → order_count
       |
       ├── Consecutive days with orders → order_streak
       |
       v
  For each badge definition:
       ├── progress = min(currentValue / threshold * 100, 100)
       ├── earned = user has row in zivo_user_badges
       └── claimable = progress >= 100 AND NOT earned
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No orders yet | All badges locked, show encouraging message |
| Badge already claimed | Show as earned with date, no re-claim |
| Multiple badges unlockable at once | Allow claiming each individually |
| User not logged in | Redirect to login |
| Points reward fails | Badge still marked earned, toast error for points |

