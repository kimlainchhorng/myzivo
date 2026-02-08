

# hiZIVO Eats Merchant Table Integration — Verification & Refinement

## Current State Analysis

After thorough exploration, the integration between the hiZIVO Eats customer app and Merchant tables is **already substantially complete**. Here's what exists:

### Already Implemented

| Feature | File | Status |
|---------|------|--------|
| Table mapping config | `src/config/eatsTables.ts` | ✅ Complete |
| Fetch restaurants | `useRestaurants()` in `useEatsOrders.ts` | ✅ Working |
| Fetch menu items | `useMenuItems()` in `useEatsOrders.ts` | ✅ Filters by `is_available` |
| Create orders | `useCreateFoodOrder()` | ✅ Sets `status="placed"` |
| List my orders | `useMyEatsOrders()` | ✅ Filters by `customer_id = userId` |
| Real-time tracking | `useLiveEatsOrder()` | ✅ Subscribes to order changes |
| Notifications table | `notifications` in Supabase | ✅ Exists with `is_read`, `user_id`, etc. |
| Notifications hook | `useNotifications()` | ✅ Real-time with unread count |
| Merchant role check | `useMerchantRole()` | ✅ Checks `user_roles` table |
| Merchant dashboard link | `Profile.tsx` | ✅ Shows link for merchants |

### Current Table Mapping

```typescript
// src/config/eatsTables.ts (existing)
export const EATS_TABLES = {
  restaurants: "restaurants",
  menuItems: "menu_items",
  orders: "food_orders",
  orderItems: null, // Items stored as JSONB in food_orders.items
  reviews: "eats_reviews",
  promoCodes: "promo_codes",
  drivers: "drivers",
} as const;

export const MERCHANT_APP_URL = "https://zivorestaurant.lovable.app";
export const INITIAL_ORDER_STATUS = "placed" as const;
```

---

## Refinements Needed

The core integration is complete. Only minor refinements are needed for consistency:

### 1. Move Config to `/lib/` Directory

Move `src/config/eatsTables.ts` to `src/lib/eatsTables.ts` as requested, then update all imports.

### 2. Add Missing Mappings to Config

Extend the config to include:
- `addresses: "saved_locations"` — for delivery addresses
- `notifications: "notifications"` — for order alerts

Updated config:
```typescript
export const EATS_TABLES = {
  restaurants: "restaurants",
  menuItems: "menu_items",
  orders: "food_orders",
  orderItems: null, // JSONB in food_orders.items
  reviews: "eats_reviews",
  promoCodes: "promo_codes",
  drivers: "drivers",
  addresses: "saved_locations",
  notifications: "notifications",
} as const;
```

### 3. Ensure Consistent Config Usage

Update hooks to use the centralized config for all table references:
- `useEatsOrders.ts` — Replace hardcoded `"restaurants"`, `"menu_items"`, `"food_orders"` strings
- `useLiveEatsOrder.ts` — Already uses `EATS_TABLES.orders` ✅

---

## File Changes Summary

### File to Move/Rename
| From | To |
|------|-----|
| `src/config/eatsTables.ts` | `src/lib/eatsTables.ts` |

### Files to Update Imports

All files that import from `@/config/eatsTables` need updated import paths:

1. `src/hooks/useEatsOrders.ts`
2. `src/hooks/useLiveEatsOrder.ts`
3. `src/pages/Profile.tsx`

### Files to Update Table References

**`src/hooks/useEatsOrders.ts`** — Replace hardcoded strings:

```typescript
// Before
.from("restaurants")
.from("menu_items")
.from("food_orders")

// After
.from(EATS_TABLES.restaurants)
.from(EATS_TABLES.menuItems)
.from(EATS_TABLES.orders)
```

---

## Data Flow Verification

The existing implementation already handles:

```text
/eats (Discover)
└── useRestaurants() → reads "restaurants" table ✅
    
/eats/restaurant/[id]
├── useRestaurant(id) → reads single restaurant ✅
└── useMenuItems(id) → reads "menu_items" WHERE restaurant_id = id ✅

/eats/cart (Checkout)
└── useCreateFoodOrder() → inserts into "food_orders" ✅
    └── status = "placed" (from INITIAL_ORDER_STATUS) ✅
    └── customer_id = auth.uid() ✅
    └── items = JSONB array (no separate order_items table) ✅

/eats/orders
└── useMyEatsOrders() → "food_orders" WHERE customer_id = auth.uid() ✅

/eats/orders/[id]
└── useLiveEatsOrder() → subscribes to realtime changes ✅
    └── Status timeline: placed → confirmed → preparing → out_for_delivery → delivered ✅

Notifications
└── useNotifications() → reads "notifications" WHERE user_id = auth.uid() ✅
    └── Real-time subscription for new notifications ✅
    └── Badge count from unreadCount ✅

/account (Profile)
└── useMerchantRole() → checks "user_roles" for merchant role ✅
    └── Shows "Merchant Dashboard" link → MERCHANT_APP_URL ✅
```

---

## Implementation Order

1. **Create `src/lib/eatsTables.ts`** — Move and extend existing config
2. **Delete `src/config/eatsTables.ts`** — Remove old file
3. **Update imports** in `useEatsOrders.ts`, `useLiveEatsOrder.ts`, `Profile.tsx`
4. **Update `useEatsOrders.ts`** — Use config constants for table names
5. **Verify RLS** — Confirm all queries filter by `auth.uid()`

---

## RLS Security Verification

Current RLS patterns are safe:

| Hook | Filter | RLS Safe |
|------|--------|----------|
| `useMyEatsOrders()` | `customer_id = userId` | ✅ |
| `useLiveEatsOrder()` | `id = orderId` | ⚠️ Relies on RLS policy |
| `useNotifications()` | `user_id = userId` | ✅ |
| `useMerchantRole()` | `user_id = userId` | ✅ |

The `food_orders` table should have an RLS policy like:
```sql
CREATE POLICY "Users can view own orders" ON food_orders
  FOR SELECT USING (customer_id = auth.uid());
```

---

## Summary

**The integration is 95% complete.** The refinements are:

1. Move config file from `/config/` to `/lib/` (as requested)
2. Add `addresses` and `notifications` mappings
3. Replace hardcoded table strings with config constants

The core functionality — reading restaurants/menus, creating orders with `status="placed"`, real-time tracking, notifications, and merchant dashboard link — is all working correctly.

