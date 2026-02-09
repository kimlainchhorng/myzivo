
# Activity Insights — Implementation Plan

## Overview
Add a simple personal stats page at `/account/activity` showing customers their orders this month, favorite restaurant, and total savings from promos/membership.

---

## Current State Analysis

### Reusable Infrastructure
| Component | What it provides |
|-----------|-----------------|
| `useSpendingStats` hook | Orders this month count, amounts, unified order list |
| `useMembershipSavings` hook | Monthly ZIVO+ membership discount total |
| `SpendingPage` | Similar account page pattern to follow |
| `Profile.tsx` quickLinks array | Where to add navigation link |

### Data Sources for Each Stat
| Stat | Source | How |
|------|--------|-----|
| Orders this month | `useSpendingStats` | `thisMonth.orderCount` (already computed) |
| Favorite restaurant | `food_orders` | Group by `restaurant_id`, pick most frequent |
| Promo savings | `food_orders.discount_amount` | Sum for current month |
| Membership savings | `useMembershipSavings` | `thisMonthDollars` (already computed) |

---

## Implementation Plan

### 1) Create Activity Insights Hook

**File to Create:** `src/hooks/useActivityInsights.ts`

**Purpose:** Combine spending stats with favorite restaurant and savings data.

**Queries:**
- Reuse `useSpendingStats()` for order counts
- Reuse `useMembershipSavings()` for ZIVO+ savings
- New query: `food_orders` grouped by restaurant to find favorite
- New query: `food_orders.discount_amount` sum for promo savings

**Returned data:**
```text
{
  ordersThisMonth: number;
  favoriteRestaurant: { name: string; orderCount: number } | null;
  totalSaved: number;           // Combined promo + membership
  membershipSaved: number;
  promoSaved: number;
  isLoading: boolean;
}
```

### 2) Create Activity Page

**File to Create:** `src/pages/account/ActivityPage.tsx`

**Design:**
```text
+----------------------------------------------+
|  <-   Activity Insights                      |
+----------------------------------------------+
|                                              |
|  +----------------------------------------+  |
|  |  Orders This Month              12     |  |
|  +----------------------------------------+  |
|                                              |
|  +----------------------------------------+  |
|  |  Favorite Restaurant                   |  |
|  |  Burger Palace          (5 orders)     |  |
|  +----------------------------------------+  |
|                                              |
|  +----------------------------------------+  |
|  |  Total Saved This Month       $24.50   |  |
|  |  ZIVO+ savings: $15.00                 |  |
|  |  Promo savings: $9.50                  |  |
|  +----------------------------------------+  |
|                                              |
+----------------------------------------------+
```

**Features:**
- Three stat cards with icons and colors
- Follows SpendingPage layout pattern (max-w-lg, back button, gradient bg)
- Empty states when no data

### 3) Add Route

**File to Modify:** `src/App.tsx`

- Add lazy import for `ActivityPage`
- Add route `/account/activity` with `ProtectedRoute`

### 4) Add Quick Link to Profile

**File to Modify:** `src/pages/Profile.tsx`

- Add "Activity" entry to `quickLinks` array

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useActivityInsights.ts` | Aggregate activity stats (favorite restaurant, savings) |
| `src/pages/account/ActivityPage.tsx` | Activity insights page UI |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add lazy import and route for `/account/activity` |
| `src/pages/Profile.tsx` | Add "Activity" quick link |

---

## Favorite Restaurant Detection

```text
// Query food_orders for this month, group by restaurant
const { data } = await supabase
  .from("food_orders")
  .select("restaurant_id, restaurant:restaurants(name)")
  .eq("customer_id", user.id)
  .eq("status", "delivered")
  .gte("created_at", monthStart.toISOString());

// Count per restaurant, pick the one with most orders
const counts = {};
data.forEach(o => {
  const id = o.restaurant_id;
  counts[id] = counts[id] || { name: o.restaurant?.name, count: 0 };
  counts[id].count++;
});
// Return the max
```

---

## Savings Calculation

```text
Total Saved = Membership Savings (from useMembershipSavings)
            + Promo Savings (sum of food_orders.discount_amount this month)
```

Both values are queried independently and combined in the hook.

---

## Empty States

| Scenario | Display |
|----------|---------|
| No orders this month | "0" with "Place your first order!" subtitle |
| No favorite restaurant | "No orders yet" message |
| No savings | "$0.00" with "Use promos or join ZIVO+ to save" |

---

## Card Design

| Card | Icon | Color |
|------|------|-------|
| Orders This Month | `ShoppingBag` | Primary/teal |
| Favorite Restaurant | `UtensilsCrossed` | Orange |
| Total Saved | `PiggyBank` | Emerald/green |
