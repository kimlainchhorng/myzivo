

# hiZIVO Eats + Merchant Integration Plan

## Overview
Integrate the ZIVO Eats customer app with the existing Merchant project by sharing Supabase tables. Create a centralized table mapping config, ensure proper RLS filtering, and add role-based navigation for merchants.

---

## Current State Analysis

### Existing Infrastructure (Verified)
| Feature | Table | Key Columns |
|---------|-------|-------------|
| Restaurants | `restaurants` | id, owner_id, name, cuisine_type, is_open, status, rating |
| Menu Items | `menu_items` | id, restaurant_id, name, price, category, is_available |
| Food Orders | `food_orders` | id, customer_id, restaurant_id, items (JSONB), status, total_amount |
| User Roles | `user_roles` | id, user_id, role (includes "merchant" in app_role enum) |
| Profiles | `profiles` | id, user_id, full_name, email, phone |

### Existing Code Assets
- `src/hooks/useEatsOrders.ts` — Restaurants, menu items, order creation hooks
- `src/hooks/useLiveEatsOrder.ts` — Realtime order subscription
- `src/contexts/CartContext.tsx` — Cart state management with localStorage
- `src/pages/Profile.tsx` — User profile page (add merchant link here)

---

## Implementation Details

### 1. Create Table Mapping Config (eatsTables.ts)

Create a single source of truth for table names that both customer and merchant apps can reference.

**File to Create:**
- `src/config/eatsTables.ts`

**Contents:**
```typescript
// Central mapping for Eats tables
// Used by both customer app and merchant app
export const EATS_TABLES = {
  restaurants: "restaurants",
  menuItems: "menu_items",
  orders: "food_orders",
  orderItems: null, // Items stored as JSONB in food_orders.items
  reviews: "eats_reviews",
  promoCodes: "promo_codes",
} as const;

export const MERCHANT_APP_URL = "https://zivorestaurant.lovable.app";
```

### 2. Update Hooks to Use Table Config

Modify existing hooks to import table names from config (currently hardcoded table names already match, so this is mainly for documentation and future-proofing).

**Files to Modify:**
- `src/hooks/useEatsOrders.ts` — Add import and use config
- `src/hooks/useLiveEatsOrder.ts` — Add import and use config

### 3. Order Creation Flow

The current order creation already:
- Inserts into `food_orders` table
- Uses `customer_id` from auth session
- Sets `status` to "pending"

**Enhancement needed:**
- Ensure `status = "placed"` on successful order (currently "pending")
- The merchant app will query `food_orders` WHERE `restaurant_id = their_restaurant`

**Files to Modify:**
- `src/hooks/useEatsOrders.ts` — Change initial status to "placed" after successful payment/checkout

### 4. Realtime Order Updates (Already Implemented)

The `useLiveEatsOrder.ts` hook already subscribes to realtime changes on `food_orders` table:
- Subscribes via `supabase.channel().on("postgres_changes")`
- Filters by `id=eq.${orderId}`
- Updates state when order changes

No changes needed - merchant updates will automatically reflect in customer view.

### 5. Role-Based Merchant Dashboard Link

Add a link to the merchant dashboard in the Profile page for users with `role = "merchant"`.

**Files to Create:**
- `src/hooks/useMerchantRole.ts` — Check if user is a merchant

**Files to Modify:**
- `src/pages/Profile.tsx` — Add conditional merchant dashboard link

**Logic:**
```typescript
// Check user_roles table for merchant role
const { data } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", userId)
  .eq("role", "merchant")
  .maybeSingle();

// If merchant role exists, show dashboard link
```

### 6. RLS Safety Verification

Current RLS patterns in the codebase already filter by `auth.uid()`:
- `useMyEatsOrders()` — filters by `customer_id = userId`
- `useSingleEatsOrder()` — fetches by order ID (RLS should verify ownership)

**Verification needed:**
- Ensure `food_orders` has RLS policy: `customer_id = auth.uid()` for SELECT
- Ensure merchants can only see their restaurant's orders via `restaurant_id` FK

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `src/config/eatsTables.ts` | Central table name mapping + merchant app URL |
| `src/hooks/useMerchantRole.ts` | Check if current user has merchant role |

### Modified Files
| File | Changes |
|------|---------|
| `src/hooks/useEatsOrders.ts` | Import table config, ensure "placed" status on order creation |
| `src/hooks/useLiveEatsOrder.ts` | Import table config for consistency |
| `src/pages/Profile.tsx` | Add "Open Merchant Dashboard" link for merchant users |

---

## Data Flow

```text
Customer App (hiZIVO)
    ├── Browse restaurants (reads from `restaurants` table)
    ├── View menu items (reads from `menu_items` table)
    ├── Add to cart (local state via CartContext)
    ├── Place order (inserts into `food_orders` with status="placed")
    └── Track order (subscribes to realtime updates on `food_orders`)

Merchant App (separate project)
    ├── View incoming orders (reads `food_orders` WHERE restaurant_id = own_restaurant)
    ├── Update order status (updates `food_orders.status`)
    └── Manage menu (CRUD on `menu_items` for own restaurant)

Shared Supabase Backend
    ├── `restaurants` — shared read by customer, write by merchant
    ├── `menu_items` — shared read by customer, write by merchant
    ├── `food_orders` — insert by customer, read/update by merchant
    └── `user_roles` — determines access level (customer vs merchant)
```

---

## Profile Page Enhancement

**New Quick Link for Merchants:**
```text
+----------------------------------+
|  👨‍🍳 Merchant Dashboard            |
|  Manage your restaurant          |
|                          [>]     |
+----------------------------------+
```

This link only appears if the user has `role = "merchant"` in `user_roles` table.

---

## Implementation Order

1. **Create eatsTables.ts config** — Central table mapping
2. **Create useMerchantRole hook** — Check merchant role
3. **Update Profile.tsx** — Add conditional merchant dashboard link
4. **Update useEatsOrders.ts** — Ensure "placed" status on order creation
5. **Update useLiveEatsOrder.ts** — Import config for consistency
6. **Verify RLS policies** — Ensure proper access control

---

## Summary

This integration connects the ZIVO Eats customer app with the Merchant project:

- **Shared Tables**: Both apps read/write to same `restaurants`, `menu_items`, `food_orders` tables
- **Table Config**: Single `eatsTables.ts` file maps all table names
- **Order Flow**: Customer creates order → Merchant sees it → Updates status → Customer sees update in realtime
- **Role-Based Access**: Merchants see "Open Merchant Dashboard" link in their profile
- **RLS Safe**: All queries filter by `auth.uid()` for proper access control
- **No Merchant Pages**: Customer app only handles ordering, not restaurant management

