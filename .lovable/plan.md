

# Loyalty Tiers — Order-Count Based

## What Exists Today

There are two loyalty systems running in parallel:

1. **Old tier system** (standard/bronze/silver/gold) — stored in `loyalty_points.tier`, based on lifetime points
2. **New ZIVO tier system** (Explorer/Traveler/Elite) — based on ZIVO Points, used in the Rewards page and checkout perks

The checkout already auto-applies tier benefits (free delivery, subtotal discounts, bonus multipliers) via `getTierPerks()` in the pricing hook.

## What Changes

We add an **order-count-based tier** that maps to the existing ZIVO tier system. Instead of creating a brand-new fourth system, we extend the existing ZIVO Points config to support order-count thresholds alongside the points thresholds:

| Tier | Order Count | Maps to | Checkout Benefits |
|------|-------------|---------|-------------------|
| Bronze | 0-9 orders | Explorer | Base earning, basic alerts |
| Silver | 10-29 orders | Traveler | 5% subtotal discount, 1.5x points, priority support |
| Gold | 30-79 orders | Elite | 10% discount, 2x points, free delivery, priority support |
| Platinum | 80+ orders | Elite (max perks) | Same as Gold + birthday bonus, exclusive previews |

The higher of points-based or order-based tier is used -- whichever gives the customer a better tier wins. Benefits are the same ones already auto-applied at checkout.

## New & Changed Files

### 1. Config: `src/config/loyaltyTiers.ts` (Create)

Defines the four order-count tiers with display info and the mapping to ZIVO perks tiers:
- Bronze (0-9), Silver (10-29), Gold (30-79), Platinum (80+)
- Each tier has: name, icon, color, minOrders, benefits list, mapped ZivoTier for perks

### 2. Hook: `src/hooks/useOrderBasedTier.ts` (Create)

Lightweight hook that:
- Counts the user's completed orders (`food_orders` with status = "delivered")
- Returns the current order-count tier, progress to next tier, and benefits
- Compares with the ZIVO Points-based tier and returns whichever is higher ("best of both")

### 3. Component: `src/components/account/LoyaltyLevelSection.tsx` (Create)

"My Loyalty Level" card for the Account page showing:
- Current tier name and badge (e.g., "Silver")
- Order count and progress bar to next tier
- Benefits unlocked at this tier (checkmark list)
- "Benefits are automatically applied at checkout" note

### 4. Update: `src/pages/mobile/MobileAccount.tsx`

Insert the `LoyaltyLevelSection` component between the Trust Level card and the Account Settings heading.

### 5. Update: `src/hooks/useEatsDeliveryPricing.ts`

Modify the tier resolution to use the best-of-both logic: if the order-count tier maps to a higher ZivoTier than the points-based tier, use that instead. This ensures benefits are automatically applied at checkout regardless of which path earned the tier.

## Technical Details

### Order-count tier config

```text
LOYALTY_TIERS_BY_ORDERS = [
  { name: "Bronze", minOrders: 0,  maxOrders: 9,  icon: "🥉", color: "amber",   zivoTier: "explorer" },
  { name: "Silver", minOrders: 10, maxOrders: 29, icon: "🥈", color: "slate",    zivoTier: "traveler" },
  { name: "Gold",   minOrders: 30, maxOrders: 79, icon: "🥇", color: "amber",    zivoTier: "elite" },
  { name: "Platinum", minOrders: 80, maxOrders: Infinity, icon: "💎", color: "purple", zivoTier: "elite" },
]
```

### Hook return shape

```text
useOrderBasedTier() returns:
  - tier: { name, icon, color, benefits, ... }
  - orderCount: number
  - progress: number (0-100 toward next tier)
  - ordersToNext: number | null
  - nextTierName: string | null
  - effectiveTier: ZivoTier (best of points-based vs order-based)
  - isLoading: boolean
```

### Checkout integration

The pricing hook (`useEatsDeliveryPricing`) currently receives a `tier: ZivoTier` prop. We update it to also accept order count (or the effective tier) so the best tier's perks are applied. This is a small change -- just comparing the two tiers and using the higher one.

### Account page layout (top to bottom)

```text
Profile Card (existing)
Trust Level Card (existing)
My Loyalty Level (NEW)
Account Settings (existing)
```

### Benefits display per tier

| Bronze | Silver | Gold | Platinum |
|--------|--------|------|----------|
| Earn points on bookings | All Bronze benefits | All Silver benefits | All Gold benefits |
| Access to deals hub | 5% checkout discount | 10% checkout discount | 10% checkout discount |
| Basic price alerts | 1.5x point earning | 2x point earning | 2x point earning |
| | Priority alerts | Free delivery (Eats) | Free delivery (Eats) |
| | | Priority support | Birthday bonus points |

### Edge cases

- New users (0 orders): Bronze tier with clear progress indicator
- Users with high points but few orders: the points-based tier may be higher, and that's used instead
- Users with many orders but few points: the order-based tier elevates their checkout perks
- "Automatically applied" label appears next to each benefit to reinforce there's no manual step

