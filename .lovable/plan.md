

# Promotions Display — Badges, Restaurant Section, and Checkout Integration

## Overview

The system has a rich `promotions` table with `merchant_id` (links promos to specific restaurants), `applicable_services` (e.g., "eats"), `discount_type`, `discount_value`, `min_order_amount`, and active date ranges. The `usePromotionValidation` hook and `validate_promo_code` RPC already handle validation. However, three gaps exist:

1. **Restaurant cards** on the listing page (`EatsRestaurants.tsx`) show no promotion badges
2. **Restaurant menu page** (`EatsRestaurantMenu.tsx`) has no "Active Promotions" section
3. **Checkout** (`EatsCheckout.tsx`) has no promo code input — it exists as a component (`PromoCodeInput.tsx`) but is never rendered on the checkout page

## What Changes

### 1. Fetch active promotions per restaurant (`src/hooks/useRestaurantPromotions.ts` — new file)

Create a hook that queries the `promotions` table filtered by `merchant_id`, `is_active = true`, valid date range, and `applicable_services` containing "eats". Returns a list of active promos and a helper that generates badge labels like "20% OFF", "Free Delivery", or "$5 OFF".

### 2. Add promo badges to restaurant cards (`src/pages/EatsRestaurants.tsx`)

For each restaurant in the grid, call `useRestaurantPromotions` (batched query for all visible restaurants) to overlay badges on the card image. Badges use the existing gradient styling (orange for discount, emerald for free delivery, violet for limited time). Maximum 2 badges per card to avoid clutter.

### 3. Add "Active Promotions" section to restaurant page (`src/pages/EatsRestaurantMenu.tsx`)

Between the restaurant header and the menu categories, render a horizontally scrollable row of promotion cards when the restaurant has active promos. Each card shows the promo name, discount description, minimum order requirement, and an expiry countdown if ending within 48 hours. Uses the same dark glass aesthetic.

### 4. Add promo code input to checkout (`src/pages/EatsCheckout.tsx`)

Wire the existing `PromoCodeInput` component and `usePromotionValidation` hook into the checkout page. Place the promo input in the Order Summary column, between the item list and the delivery fee breakdown. When a valid promo is applied, show the discount as a line item in the summary and adjust the total.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useRestaurantPromotions.ts` | Create | Hook to fetch active promos for a restaurant (or batch of restaurants) |
| `src/components/eats/PromoBadgeOverlay.tsx` | Create | Small component rendering 1-2 promo badges on restaurant cards |
| `src/components/eats/ActivePromotionsSection.tsx` | Create | Horizontal scrollable promo cards for restaurant menu page |
| `src/pages/EatsRestaurants.tsx` | Update | Add promo badges to each restaurant card |
| `src/pages/EatsRestaurantMenu.tsx` | Update | Add ActivePromotionsSection between header and menu |
| `src/pages/EatsCheckout.tsx` | Update | Add PromoCodeInput + usePromotionValidation, adjust totals |

## Technical Details

### useRestaurantPromotions hook

```text
Query: promotions table
  WHERE merchant_id = restaurantId (or IN [...ids] for batch)
  AND is_active = true
  AND 'eats' = ANY(applicable_services)
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
  AND (usage_limit IS NULL OR usage_count < usage_limit)

Returns: { promos, badgeLabels, isLoading }
```

Badge label generation logic:
- `discount_type = 'free_delivery'` => "Free Delivery"
- `discount_type = 'percent'` => "{value}% OFF"
- `discount_type = 'fixed'` => "${value} OFF"
- If `ends_at` is within 48 hours => append "Limited time deal" badge

### Batch query for restaurant listing

Instead of N+1 queries, fetch all active eats promotions in a single query (no merchant_id filter), then group by `merchant_id` client-side. This gives O(1) database calls for the listing page.

### Checkout promo integration

- Import `usePromotionValidation` with `serviceType: 'eats'`
- Render `PromoCodeInput` in the order summary card
- On successful validation, display a discount line item: "Promo (CODE) -$X.XX"
- Adjust the total: `finalTotal = subtotal + deliveryFee - discountAmount`
- Pass the `promotion_id` into the `createOrder` mutation for backend tracking

### PromoBadgeOverlay component

Renders absolutely positioned badges (bottom-left of restaurant card image). Prioritizes: free delivery badge first (emerald), then discount badge (orange gradient). Max 2 badges. Uses the existing Badge component with consistent styling.

### ActivePromotionsSection component

Horizontal scroll row with snap scrolling. Each promo card shows:
- Promo name/description
- Discount value (prominent)
- Min order requirement (if any)
- "Ends in X hours" countdown if expiring within 48h
- "Apply" button that copies the code to clipboard with toast feedback

## Edge Cases

- **No promos for restaurant**: Badge overlay and section hidden — zero change to current UI
- **Expired during session**: The validation RPC re-checks server-side, so stale client display won't result in invalid discounts
- **Multiple promos**: Only one promo code can be applied at checkout (enforced by usePromotionValidation)
- **Free delivery + discount**: Badge overlay shows both; at checkout only one code applies
- **Merchant-specific vs global promos**: Promos with `merchant_id = NULL` are global and show on all restaurants; merchant-specific ones only on their restaurant
