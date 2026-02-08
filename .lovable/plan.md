
# ZIVO Eats Integration #2 — Unified API Layer, Alerts, Favorites & Polish

## Overview
Complete the Eats customer experience with a unified API layer, real alerts integration, order accuracy improvements, "Order Again" functionality, favorites system, and 2026-quality polish.

---

## Current State Analysis

### Already Implemented
| Feature | Status | Location |
|---------|--------|----------|
| Table mapping | ✅ Complete | `src/lib/eatsTables.ts` |
| Restaurant fetching | ✅ Working | `useRestaurants()` |
| Menu items | ✅ Working | `useMenuItems()` |
| Order creation | ✅ Sets `status="placed"` | `useCreateFoodOrder()` |
| My orders | ✅ Filters by `customer_id` | `useMyEatsOrders()` |
| Real-time order tracking | ✅ Working | `useLiveEatsOrder()` |
| Notifications hook | ✅ Working | `useNotifications()` — fetches from `notifications` table |
| Notifications table | ✅ Exists | Has `user_id`, `is_read`, `title`, `body`, etc. |
| User favorites table | ✅ Exists | `user_favorites` with `item_type`, `item_id`, `item_data` |
| Order receipt | ✅ Created | `OrderReceipt.tsx`, `EatsReceipt.tsx` |
| MobileAlerts page | ✅ Exists | But shows **price alerts**, not order notifications |

### Missing / Needs Work
| Feature | Status | Notes |
|---------|--------|-------|
| Unified `eatsApi.ts` | ❌ Missing | All queries scattered in hooks |
| Order notifications in alerts | ❌ Missing | Current `/alerts` shows price alerts only |
| Badge count in nav | ❌ Missing | Bottom nav has no unread indicator |
| Tax/service fee saved to orders | ⚠️ Partial | Cart calculates but doesn't save `tax`, `service_fee` |
| Order Again button | ❌ Missing | No reorder functionality |
| Restaurant favorites | ❌ Missing | Heart icon + favorites page |

---

## Implementation Details

### 1. Create Unified Eats API (`src/lib/eatsApi.ts`)

Consolidate all Eats-related queries into a single API file for consistency and reusability.

**File to Create:**
- `src/lib/eatsApi.ts`

**Contents:**
```typescript
import { supabase } from "@/integrations/supabase/client";
import { EATS_TABLES, INITIAL_ORDER_STATUS } from "./eatsTables";

export const eatsApi = {
  // Restaurants
  getRestaurants: async (onlyOpen = false) => { ... },
  getRestaurant: async (id: string) => { ... },
  
  // Menu
  getMenu: async (restaurantId: string) => { ... },
  
  // Orders
  createOrderFromCart: async (params: CreateOrderParams) => { ... },
  getMyOrders: async () => { ... },
  getOrder: async (orderId: string) => { ... },
  subscribeToOrder: (orderId: string, callback: Function) => { ... },
  
  // Alerts/Notifications
  getAlerts: async () => { ... },
  markAlertRead: async (alertId: string) => { ... },
  markAllAlertsRead: async () => { ... },
  getUnreadCount: async () => { ... },
  
  // Favorites
  getFavorites: async () => { ... },
  addFavorite: async (restaurantId: string, restaurantData: any) => { ... },
  removeFavorite: async (restaurantId: string) => { ... },
  isFavorite: async (restaurantId: string) => { ... },
};
```

### 2. Create Eats-Specific Alerts Page

The current `/alerts` page shows **price alerts** (for flights). We need a separate Eats notifications page or integrate into the existing alerts.

**Option A (Recommended):** Create `/eats/alerts` page for order notifications
**Option B:** Add "Orders" tab to existing `/alerts` page

**Files to Create:**
- `src/pages/EatsAlerts.tsx` — Order status notifications page

**Features:**
- Show notifications filtered by `category = 'transactional'` AND `metadata.type = 'eats'`
- "Mark all as read" button
- Tap notification → navigate to order detail

### 3. Add Badge Count to Eats Bottom Navigation

Create an Eats-specific bottom nav (or modify existing) to show unread notifications badge.

**Files to Create:**
- `src/components/eats/EatsBottomNav.tsx` — With Home, Orders, Cart, Alerts, Account tabs

**Features:**
- Badge on Alerts icon showing unread count
- Use existing `useNotifications()` hook for count
- Consistent with 2026 dark glass aesthetic

### 4. Save Complete Order Totals

Currently the cart calculates `subtotal`, `delivery_fee`, `service_fee`, `tax`, `discount` but only some are saved to the order.

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Pass all breakdown values
- `src/hooks/useEatsOrders.ts` — Save `tax`, `service_fee`, `tip` to order

**Current Order Insert (needs expansion):**
```typescript
// Add these fields to the insert
tax: tax,
service_fee: serviceFee,
tip: tipAmount,
promo_code: promo.promoCode?.code,
discount_amount: promo.discountAmount,
```

**Note:** Check if `food_orders` table has these columns. If not, add migration.

### 5. Add "Order Again" Feature

Allow users to quickly reorder from a previous order.

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Add "Order Again" button
- `src/contexts/CartContext.tsx` — Add `rebuildFromOrder()` method

**Logic:**
```typescript
const handleOrderAgain = () => {
  // Clear current cart
  clearCart();
  
  // Rebuild from order items
  const orderItems = order.items as any[];
  orderItems.forEach(item => {
    addItem({
      id: item.menu_item_id,
      restaurantId: order.restaurant_id,
      restaurantName: order.restaurants?.name || "",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
    });
  });
  
  // Navigate to cart
  navigate("/eats/cart");
};
```

### 6. Add Restaurant Favorites

Use existing `user_favorites` table with `item_type = 'restaurant'`.

**Files to Create:**
- `src/hooks/useEatsFavorites.ts` — CRUD for restaurant favorites
- `src/pages/EatsFavorites.tsx` — Favorites list page
- `src/components/eats/FavoriteButton.tsx` — Heart toggle component

**Files to Modify:**
- `src/components/eats/RestaurantCard.tsx` — Add heart icon
- `src/components/eats/MobileEatsPremium.tsx` — Add heart to restaurant cards
- `src/App.tsx` — Add `/eats/favorites` route

**Database Query:**
```typescript
// Add favorite
await supabase.from("user_favorites").insert({
  user_id: userId,
  item_type: "restaurant",
  item_id: restaurantId,
  item_data: { name, logo_url, cuisine_type, rating }
});

// Get favorites
await supabase.from("user_favorites")
  .select("*")
  .eq("user_id", userId)
  .eq("item_type", "restaurant");
```

### 7. Database Migration (if needed)

Check if `food_orders` needs additional columns:

```sql
-- Add columns if missing
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tip DECIMAL(10,2) DEFAULT 0;
```

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/eatsApi.ts` | Unified API layer for all Eats queries |
| `src/pages/EatsAlerts.tsx` | Order notifications page |
| `src/pages/EatsFavorites.tsx` | Favorites list page |
| `src/components/eats/EatsBottomNav.tsx` | Bottom nav with badge |
| `src/components/eats/FavoriteButton.tsx` | Heart toggle component |
| `src/hooks/useEatsFavorites.ts` | Restaurant favorites CRUD |
| `src/hooks/useEatsAlerts.ts` | Eats-specific notifications |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsCart.tsx` | Save all pricing fields, disable during submit |
| `src/pages/EatsOrderDetail.tsx` | Add "Order Again" button |
| `src/hooks/useEatsOrders.ts` | Use `eatsApi`, save tax/service_fee/tip |
| `src/contexts/CartContext.tsx` | Add `rebuildFromOrder()` method |
| `src/components/eats/MobileEatsPremium.tsx` | Add favorite hearts + alerts link |
| `src/App.tsx` | Add `/eats/favorites`, `/eats/alerts` routes |

---

## Data Flow

```text
/eats (Discover)
├── useRestaurants() via eatsApi.getRestaurants()
├── FavoriteButton on each card → useEatsFavorites
└── Bottom nav with badge → useEatsAlerts().unreadCount

/eats/restaurant/[id]
├── eatsApi.getRestaurant(id)
├── eatsApi.getMenu(id)
├── FavoriteButton in header
└── Add-to-cart works

/eats/cart
├── CartContext manages items
├── Calculates: subtotal, delivery_fee, service_fee, tax, discount, total
├── On place order → saves ALL fields to food_orders
└── Disables button while submitting (isSubmitting state)

/eats/orders/[id]
├── eatsApi.getOrder(id)
├── eatsApi.subscribeToOrder(id) for realtime
├── "Order Again" button → rebuildFromOrder() → /eats/cart
└── Receipt shows saved breakdown

/eats/alerts
├── useEatsAlerts() → notifications WHERE category='transactional', metadata.type='eats'
├── Mark all as read
└── Tap → navigate to order

/eats/favorites
├── useEatsFavorites() → user_favorites WHERE item_type='restaurant'
├── Tap card → /eats/restaurant/[id]
└── Empty state if no favorites
```

---

## UI Components

### Eats Bottom Nav
```text
+--------------------------------------------------+
| 🏠 Home    🍴 Orders    🛒 Cart    🔔 Alerts   👤 |
|                                    [3] ← badge    |
+--------------------------------------------------+
```

### Order Again Button
```text
+----------------------------------+
| [← Back]  Order Details          |
+----------------------------------+
| ...order info...                 |
+----------------------------------+
| [🔄 Order Again]                 |
+----------------------------------+
```

### Favorite Heart
```text
Restaurant Card:
+---------------------------+
| [image]              ♡    | ← unfilled = not favorite
| Sakura Sushi ★ 4.8        |
+---------------------------+
```

---

## Implementation Order

1. **Check/Add DB columns** — Verify `food_orders` has `tax`, `service_fee`, `tip`
2. **Create `eatsApi.ts`** — Unified API layer
3. **Update `EatsCart.tsx`** — Save all pricing, prevent double-submit
4. **Create `useEatsFavorites.ts`** — Favorites CRUD
5. **Create `FavoriteButton.tsx`** — Heart toggle
6. **Add hearts to restaurant cards** — MobileEatsPremium, RestaurantCard
7. **Create `EatsFavorites.tsx`** — Favorites page
8. **Create `useEatsAlerts.ts`** — Eats-specific notifications
9. **Create `EatsBottomNav.tsx`** — With badge count
10. **Create `EatsAlerts.tsx`** — Order notifications page
11. **Update `EatsOrderDetail.tsx`** — Add "Order Again" button
12. **Update `CartContext.tsx`** — Add `rebuildFromOrder()`
13. **Update `App.tsx`** — Add routes
14. **Polish** — Skeletons, empty states, error handling

---

## Summary

This update completes the ZIVO Eats customer experience:

- **Unified API Layer**: Single `eatsApi.ts` for all queries
- **Real Alerts**: Order notifications with badge count
- **Accurate Totals**: Tax, service fee, tip saved to orders
- **Order Again**: Quick reorder from history
- **Favorites**: Heart icon + favorites page
- **2026 Polish**: Skeleton loaders, empty states, duplicate prevention

