
# ZIVO Eats MVP - Complete Implementation Plan

## Overview
Build a fully functional food ordering experience with 2026 dark glass UI, real Supabase data, and smooth mobile-first design. The project already has restaurants, menu items, and the food_orders table in Supabase - we'll wire everything together into a polished MVP.

---

## Current State Analysis

### Existing Supabase Tables (Verified)
| Table | Key Columns | Status |
|-------|-------------|--------|
| `restaurants` | id, name, cuisine_type, cover_image_url, rating, is_open, status, avg_prep_time, delivery_fee_cents | Has data |
| `menu_items` | id, restaurant_id, name, description, price, category, image_url, is_available | Has data |
| `food_orders` | id, customer_id, restaurant_id, status, items (JSONB), subtotal, delivery_fee, total_amount, created_at | Empty |

### Existing Code Assets
- `src/hooks/useEatsOrders.ts` - Hooks for restaurants, menu items, order creation
- `src/contexts/CartContext.tsx` - Cart state management with localStorage persistence
- `src/pages/Eats.tsx` - Landing page (redirects to external driver app)
- `src/pages/EatsRestaurants.tsx` - Restaurant listing (functional)
- `src/pages/EatsRestaurantMenu.tsx` - Menu view with add-to-cart
- `src/pages/EatsCheckout.tsx` - Order submission form
- `src/components/eats/MobileEatsPremium.tsx` - Premium mobile design (static data)

### Design Pattern Reference
The mobile home (`src/pages/app/AppHome.tsx`) uses:
- Dark zinc-950 background
- Glass morphism cards (bg-zinc-900/80 backdrop-blur)
- White/zinc text hierarchy
- Orange accents for Eats
- Framer Motion animations

---

## Pages to Build/Update

### 1. `/eats` - Discover Page (Mobile Redesign)
Transform `MobileEatsPremium.tsx` from static showcase to real data-driven discovery.

**Features:**
- Top search bar with AI-style placeholder
- Category chips: Pizza, Burger, Sushi, Coffee, Healthy, Dessert (tap to filter)
- Restaurant cards from Supabase with live data
- Sort options: Recommended / Fastest / Rating
- Bottom navigation integration

**UI Components:**
```text
+----------------------------------+
|  [<] ZIVO Eats         [Cart]   |
+----------------------------------+
|  [🔍 Search restaurants...]      |
+----------------------------------+
|  [Pizza] [Burger] [Sushi] ...   |
+----------------------------------+
|  [Sort: Recommended ▼]          |
+----------------------------------+
|  +----------------------------+ |
|  | [Image]                    | |
|  | Sakura Sushi Bar           | |
|  | Japanese · ⭐4.8 · 25 min  | |
|  | Free Delivery              | |
|  +----------------------------+ |
|  ...                            |
+----------------------------------+
```

### 2. `/eats/restaurant/[id]` - Restaurant Menu
Update existing `EatsRestaurantMenu.tsx` with 2026 dark glass styling.

**Features:**
- Restaurant header with cover image, open/closed badge
- Sticky category tabs at top (Appetizers, Mains, Desserts, etc.)
- Menu items list with Add button (opens modal)
- Add item modal: quantity picker + notes field
- Floating cart button with total

**UI Components:**
```text
+----------------------------------+
|  [<] Back       [Open Now 🟢]   |
+----------------------------------+
|  [Restaurant Cover Image]        |
|  Sakura Sushi Bar               |
|  Japanese · ⭐4.8 · 25-35 min    |
+----------------------------------+
|  [Appetizers] [Mains] [Desserts] |  <- sticky
+----------------------------------+
|  Dragon Roll                     |
|  Fresh salmon, avocado... $16.99 |
|                         [+ Add]  |
+----------------------------------+
|       [🛒 View Cart · $32.98]   |  <- floating
+----------------------------------+
```

### 3. `/eats/cart` - Cart Page (New)
Create dedicated cart page before checkout.

**Features:**
- Cart items list with quantity +/- controls
- Remove item option
- Price breakdown: subtotal, delivery fee, tax, total
- Checkout button -> navigates to checkout or creates order directly

**UI Components:**
```text
+----------------------------------+
|  [<] Your Cart                   |
+----------------------------------+
|  Sakura Sushi Bar               |
+----------------------------------+
|  Dragon Roll              $16.99 |
|  [-] 2 [+]                       |
|  California Roll          $9.99  |
|  [-] 1 [+]                       |
+----------------------------------+
|  Subtotal                 $43.97 |
|  Delivery Fee              $3.99 |
|  Tax                       $3.52 |
|  ─────────────────────────────── |
|  Total                    $51.48 |
+----------------------------------+
|  [Proceed to Checkout]           |
+----------------------------------+
```

### 4. `/eats/orders` - My Orders List (New)
Show user's order history.

**Features:**
- List all user orders (where customer_id = auth.uid())
- Each row: restaurant name, status badge, total, created time
- Tap to view order details
- Loading skeleton + empty state

**UI Components:**
```text
+----------------------------------+
|  [<] My Orders                   |
+----------------------------------+
|  Sakura Sushi Bar               |
|  [Delivered ✓] · $51.48          |
|  Today, 2:45 PM                  |
+----------------------------------+
|  Burger Palace                   |
|  [Preparing 🍳] · $28.99        |
|  Yesterday, 7:30 PM              |
+----------------------------------+
```

### 5. `/eats/orders/[id]` - Order Detail (New)
Show order status timeline and details.

**Features:**
- Order status timeline: placed → confirmed → preparing → out_for_delivery → delivered
- Restaurant info
- Items ordered with quantities
- Price breakdown
- Real-time status from Supabase

**UI Components:**
```text
+----------------------------------+
|  [<] Order #ABC123               |
+----------------------------------+
|  Status Timeline:                |
|  ✓ Placed         2:30 PM       |
|  ✓ Confirmed      2:32 PM       |
|  → Preparing      2:35 PM       |
|  ○ Out for Delivery              |
|  ○ Delivered                     |
+----------------------------------+
|  Sakura Sushi Bar               |
|  2x Dragon Roll           $33.98 |
|  1x California Roll        $9.99 |
+----------------------------------+
|  Subtotal                 $43.97 |
|  Delivery Fee              $3.99 |
|  Tax                       $3.52 |
|  Total                    $51.48 |
+----------------------------------+
```

---

## Technical Implementation

### New Files to Create

1. **`src/pages/EatsCart.tsx`** - Cart page with price breakdown
2. **`src/pages/EatsOrders.tsx`** - Order history list
3. **`src/pages/EatsOrderDetail.tsx`** - Single order with timeline
4. **`src/components/eats/EatsBottomNav.tsx`** - Eats-specific navigation (optional)
5. **`src/components/eats/StatusTimeline.tsx`** - Order status visualization
6. **`src/components/eats/MenuItemModal.tsx`** - Add item dialog with qty/notes
7. **`src/hooks/useMyEatsOrders.ts`** - Fetch user's food orders

### Files to Modify

1. **`src/pages/Eats.tsx`** - Replace external redirect with real discover experience
2. **`src/components/eats/MobileEatsPremium.tsx`** - Wire to real Supabase data
3. **`src/pages/EatsRestaurants.tsx`** - Apply 2026 dark glass styling
4. **`src/pages/EatsRestaurantMenu.tsx`** - Add modal, improve styling
5. **`src/pages/EatsCheckout.tsx`** - Improve styling, add order redirect
6. **`src/contexts/CartContext.tsx`** - Minor enhancements (already good)
7. **`src/hooks/useEatsOrders.ts`** - Add useMyEatsOrders hook
8. **`src/App.tsx`** - Add new routes

### New Routes in App.tsx
```typescript
<Route path="/eats" element={<Eats />} />
<Route path="/eats/restaurants" element={<EatsRestaurants />} />
<Route path="/eats/restaurant/:id" element={<EatsRestaurantMenu />} />
<Route path="/eats/cart" element={<EatsCart />} />
<Route path="/eats/checkout" element={<EatsCheckout />} />
<Route path="/eats/orders" element={<EatsOrders />} />
<Route path="/eats/orders/:id" element={<EatsOrderDetail />} />
```

### Hook: useMyEatsOrders
```typescript
// Fetch orders for current user
export function useMyEatsOrders() {
  return useQuery({
    queryKey: ["my-eats-orders"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("food_orders")
        .select("*, restaurants:restaurant_id(name, logo_url)")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
```

### Hook: useSingleEatsOrder
```typescript
// Fetch single order by ID
export function useSingleEatsOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["eats-order", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from("food_orders")
        .select("*, restaurants:restaurant_id(name, logo_url, phone)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}
```

---

## 2026 Dark Glass UI System

### Color Palette
| Element | Value |
|---------|-------|
| Background | `bg-zinc-950` |
| Card | `bg-zinc-900/80 backdrop-blur-xl border border-white/10` |
| Text Primary | `text-white` |
| Text Secondary | `text-zinc-400` |
| Eats Accent | `text-orange-500`, `bg-orange-500` |
| Success | `text-emerald-400` |

### Component Patterns
```text
Card:        bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl
Button CTA:  bg-orange-500 hover:bg-orange-600 text-white rounded-xl
Badge:       bg-orange-500/20 text-orange-400 border border-orange-500/30
Input:       bg-white/10 border border-white/10 text-white placeholder-zinc-500
```

### Status Badge Colors
| Status | Style |
|--------|-------|
| pending | `bg-zinc-500/20 text-zinc-400` |
| confirmed | `bg-blue-500/20 text-blue-400` |
| preparing | `bg-amber-500/20 text-amber-400` |
| out_for_delivery | `bg-purple-500/20 text-purple-400` |
| delivered | `bg-emerald-500/20 text-emerald-400` |
| cancelled | `bg-red-500/20 text-red-400` |

---

## Data Flow

```text
Discover (/eats)
    ↓ tap restaurant
Restaurant Menu (/eats/restaurant/:id)
    ↓ add items to cart (context)
Cart (/eats/cart)
    ↓ proceed to checkout
Checkout (/eats/checkout)
    ↓ submit order → INSERT into food_orders
Order Detail (/eats/orders/:id)
    ↓ shows timeline + details

My Orders (/eats/orders)
    ← list all user orders
```

---

## Implementation Order

1. **Create useMyEatsOrders hook** in `src/hooks/useEatsOrders.ts`
2. **Create EatsCart page** with price breakdown
3. **Create EatsOrders page** for order history
4. **Create EatsOrderDetail page** with status timeline
5. **Create StatusTimeline component** for order progress
6. **Create MenuItemModal component** for adding items
7. **Update MobileEatsPremium** to use real data
8. **Update Eats.tsx** to show MobileEatsPremium for mobile
9. **Update EatsRestaurantMenu** with modal + dark styling
10. **Update EatsCheckout** with redirect to order detail
11. **Add routes to App.tsx**
12. **Polish animations and loading states**

---

## Loading/Empty States

All pages will include:
- **Loading skeleton**: Animated placeholder cards
- **Empty state**: Icon + message + CTA button
- **Error state**: Retry button

Example empty state for Orders:
```text
[🍽️ Icon]
No orders yet
Start exploring restaurants!
[Browse Restaurants]
```

---

## Summary

This plan transforms ZIVO Eats from a static preview into a working MVP:

- **5 pages**: Discover, Restaurant Menu, Cart, Orders List, Order Detail
- **Real data**: Restaurants, menu items, orders from Supabase
- **User scoping**: Orders filtered by auth.uid()
- **2026 UI**: Dark glass design matching the home screen
- **Mobile-first**: Touch-friendly, smooth animations
- **Persistent cart**: LocalStorage backed via CartContext
