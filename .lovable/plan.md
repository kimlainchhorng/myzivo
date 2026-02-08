

# ZIVO Eats 2 — Production Checkout Flow

## Overview
Upgrade the ZIVO Eats MVP to a production-ready checkout experience with delivery addresses, promo codes, payment method selection, and real-time order tracking. All features will use existing Supabase tables and maintain the 2026 dark glass UI.

---

## Existing Infrastructure (Detected)

### Supabase Tables to Reuse
| Feature | Table | Key Columns |
|---------|-------|-------------|
| Saved Addresses | `saved_locations` | id, user_id, label, address, lat, lng, icon |
| Promo Codes | `promo_codes` | id, code, discount_type, discount_value, expires_at, is_active, max_uses, uses, min_fare |
| Food Orders | `food_orders` | customer_id, restaurant_id, items, subtotal, delivery_fee, total_amount, delivery_address, status, promo_code (add), discount_amount (add) |
| Restaurants | `restaurants` | is_open, opening_hours (JSON), hours (JSON) |
| Profiles | `profiles` | stripe_customer_id |

### Existing Code Assets
- `src/hooks/useSavedLocations.ts` — Full CRUD hooks for saved addresses
- `src/lib/promoCodeService.ts` — Promo validation + discount calculation
- `src/contexts/CartContext.tsx` — Cart state with localStorage persistence
- `src/pages/EatsCart.tsx` — Current cart UI (needs promo + address additions)
- `src/pages/EatsCheckout.tsx` — Form-based checkout (needs payment step)
- `src/pages/EatsOrderDetail.tsx` — Order detail with static status
- `src/components/eats/StatusTimeline.tsx` — Order progress visualization

---

## Implementation Details

### 1. Delivery Address Management

**New Page: `/eats/address`**
- List user's saved addresses from `saved_locations` table
- Default address indicator (use `icon = "default"` pattern)
- Add/Edit address modal with:
  - Label (Home, Work, Other, custom)
  - Full address (text input + geocoding)
  - Delivery notes
  - Set as default checkbox
- Delete address option

**Files to Create:**
- `src/pages/EatsAddress.tsx` — Address management page

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Add address selector section
- `src/contexts/CartContext.tsx` — Add `selectedAddressId` + `selectedAddress` state
- `src/App.tsx` — Add `/eats/address` route

**Cart Integration:**
```text
+----------------------------------+
|  📍 Deliver to                   |
|  Home · 123 Main St, Apt 4B      |
|                       [Change >] |
+----------------------------------+
```

### 2. Promo Code System

**Reuse Existing Infrastructure:**
- `promo_codes` table already supports:
  - `discount_type` (percent/fixed)
  - `discount_value`
  - `min_fare` (minimum subtotal)
  - `expires_at`
  - `is_active`
  - `max_uses` / `uses`

**Files to Create:**
- `src/hooks/useEatsPromo.ts` — Eats-specific promo validation hook

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Add promo code input section
- `src/contexts/CartContext.tsx` — Add `appliedPromo`, `discountAmount` state

**Cart UI Addition:**
```text
+----------------------------------+
|  🏷️ Promo Code                   |
|  [SUMMER20        ] [Apply]      |
+----------------------------------+
|  ✓ SUMMER20 applied              |
|  -$5.00 discount                 |
+----------------------------------+
```

**Promo Validation Flow:**
1. User enters code → call `validatePromoCode(code)` from existing service
2. Check `min_fare` against cart subtotal
3. Calculate discount using existing `calculateDiscount()` function
4. Display discount line item in price breakdown
5. Save `promo_code` and `discount_amount` in order

### 3. Payment Method Selection (UI First, Stripe-Ready)

**Payment Modal Component:**
- List saved payment methods (via Stripe API through edge function)
- Highlight default method
- "Add new card" option (links to Stripe-managed flow)
- Apple Pay / Google Pay options (visual only for MVP)

**Files to Create:**
- `src/components/eats/PaymentMethodModal.tsx` — Payment selection modal
- `src/hooks/usePaymentMethods.ts` — Fetch customer's Stripe payment methods

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Add payment method section + "Place Order" flow

**Payment Section UI:**
```text
+----------------------------------+
|  💳 Payment Method               |
|  •••• 4242 (Visa)        [Edit]  |
+----------------------------------+
```

**Edge Function (Optional for Full Implementation):**
- `supabase/functions/list-payment-methods` — Fetch customer's saved cards via Stripe

### 4. Enhanced Order Creation

**Modify Order Submission:**
Update `useCreateFoodOrder` hook to include:
- `address_id` — Reference to saved_locations
- `promo_code` — Applied promo code string
- `discount_amount` — Calculated discount value
- `payment_method_id` — Stripe payment method ID (for future use)

**Files to Modify:**
- `src/hooks/useEatsOrders.ts` — Extend `CreateFoodOrderInput` interface
- `src/pages/EatsCart.tsx` — Submit order with all new fields

**Database Column Additions Needed:**
The `food_orders` table may need these columns (check if already present):
- `promo_code` (text, nullable)
- `discount_amount` (numeric, nullable)
- `address_id` (uuid, nullable, FK to saved_locations)
- `payment_method_id` (text, nullable)

### 5. Real-Time Order Status Updates

**Implement Supabase Realtime Subscription:**
Use the provided `useLiveOrder` pattern adapted for `food_orders` table.

**Files to Create:**
- `src/hooks/useLiveEatsOrder.ts` — Real-time order subscription hook

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Replace static query with live subscription
- `src/components/eats/StatusTimeline.tsx` — Add timestamp display for each status

**Live Order Hook:**
```typescript
export function useLiveEatsOrder(orderId: string) {
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("food_orders")
      .select("*, restaurants:restaurant_id(name, logo_url, phone)")
      .eq("id", orderId)
      .single()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel(`eats-order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new as FoodOrder)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  return { order, loading };
}
```

**Add Help Modal:**
- "Need Help?" button opens support modal
- Options: Contact support, Report issue, Request refund

### 6. Restaurant Hours & Open/Closed Status

**Use Existing Fields:**
The `restaurants` table already has:
- `is_open` (boolean) — Quick open/closed flag
- `opening_hours` (jsonb) — Detailed schedule
- `hours` (jsonb) — Alternative hours field

**Files to Modify:**
- `src/components/eats/MobileEatsPremium.tsx` — Add Open/Closed badges
- `src/pages/EatsRestaurantMenu.tsx` — Show status banner + disable checkout if closed
- `src/hooks/useEatsOrders.ts` — Update `useRestaurants` to include all restaurants (not just open ones)

**Restaurant Card Badge:**
```text
+----------------------------------+
|  [Cover Image]                   |
|  🟢 Open Now  |  🔴 Closed       |
|  Sakura Sushi Bar                |
|  Japanese · ⭐4.8 · 25 min       |
+----------------------------------+
```

**Closed Restaurant Handling:**
- Gray overlay on closed restaurants
- "Opens at 11:00 AM" text (parse from hours JSON)
- Disable "Add to Cart" on menu page
- Show banner: "This restaurant is currently closed"

### 7. Polish & UX Improvements

**Skeleton Loaders:**
Add to all data-fetching pages:
- Restaurant list
- Menu items
- Order history
- Order detail

**Empty States:**
- No saved addresses → "Add your first address"
- No orders → "You haven't placed any orders yet"
- Empty cart → Already implemented

**Consistent 2026 Dark Glass UI:**
All new components will use:
- `bg-zinc-950` background
- `bg-zinc-900/80 backdrop-blur-xl border border-white/10` cards
- `text-white` / `text-zinc-400` typography
- `bg-orange-500` / `from-orange-500 to-orange-600` CTAs
- Framer Motion animations

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `src/pages/EatsAddress.tsx` | Delivery address management page |
| `src/components/eats/PaymentMethodModal.tsx` | Payment selection modal |
| `src/components/eats/AddressSelector.tsx` | Address display + change button |
| `src/components/eats/PromoCodeInput.tsx` | Promo code entry component |
| `src/components/eats/HelpModal.tsx` | Order support modal |
| `src/hooks/useEatsPromo.ts` | Promo validation for Eats |
| `src/hooks/useLiveEatsOrder.ts` | Real-time order subscription |
| `src/hooks/usePaymentMethods.ts` | Fetch Stripe payment methods |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsCart.tsx` | Add address selector, promo input, payment section, enhanced checkout |
| `src/pages/EatsOrderDetail.tsx` | Use live subscription, add help button |
| `src/contexts/CartContext.tsx` | Add selectedAddressId, appliedPromo, discountAmount |
| `src/hooks/useEatsOrders.ts` | Extend order creation with new fields |
| `src/components/eats/MobileEatsPremium.tsx` | Add open/closed badges |
| `src/pages/EatsRestaurantMenu.tsx` | Add closed state handling |
| `src/App.tsx` | Add `/eats/address` route |

---

## Implementation Order

1. **Cart Context Enhancement** — Add address/promo/discount state
2. **Address Selector Component** — Create `AddressSelector.tsx`
3. **Address Page** — Create `EatsAddress.tsx` with CRUD modal
4. **Promo Code Input** — Create `PromoCodeInput.tsx` + `useEatsPromo.ts`
5. **Update EatsCart.tsx** — Integrate address + promo + price recalculation
6. **Payment Method Modal** — Create placeholder with card display
7. **Enhanced Order Creation** — Update hook + cart submission
8. **Live Order Hook** — Create `useLiveEatsOrder.ts`
9. **Update Order Detail** — Use real-time subscription + help modal
10. **Restaurant Open/Closed** — Add badges + closed state handling
11. **Skeleton Loaders** — Add to all pages
12. **Routes Update** — Add `/eats/address` to App.tsx
13. **Final Polish** — Animations, transitions, empty states

---

## Data Flow

```text
User browses restaurants (MobileEatsPremium)
    ↓ sees open/closed badges
    ↓ taps restaurant
Restaurant Menu (EatsRestaurantMenu)
    ↓ if closed, show banner
    ↓ if open, add items to cart
    ↓
Cart (EatsCart)
    ├── Select delivery address (AddressSelector)
    │   └── Change → /eats/address
    ├── Enter promo code (PromoCodeInput)
    │   └── Apply → validate → show discount
    ├── Price breakdown with discount
    ├── Select payment method (PaymentMethodModal)
    └── Place Order
        ↓
Order Created in Supabase (food_orders)
    ├── status = "pending"
    ├── promo_code + discount_amount saved
    ├── address_id linked
    └── payment_method_id saved
        ↓
Redirect to Order Detail (EatsOrderDetail)
    ├── Real-time status updates via Supabase
    ├── Status timeline with timestamps
    └── Help button → HelpModal
```

---

## Summary

This update transforms ZIVO Eats into a production-ready ordering system:

- **Delivery Addresses**: Full CRUD using existing `saved_locations` table
- **Promo Codes**: Validation + discount using existing `promo_codes` table
- **Payment Methods**: UI-first approach with Stripe integration ready
- **Real-time Tracking**: Supabase subscriptions for instant status updates
- **Open/Closed Logic**: Uses existing restaurant fields (`is_open`, `hours`)
- **Consistent UI**: 2026 dark glass aesthetic throughout
- **Mobile-First**: Touch-friendly, smooth animations, skeleton loaders

