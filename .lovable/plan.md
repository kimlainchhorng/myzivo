

# Loyalty Levels — Implementation Plan

## Overview
Enhance the existing `/account/loyalty` page with a full tier benefits comparison, add automatic perk application at Eats checkout (free delivery, extra discounts, bonus points), and create a reusable loyalty tier badge component.

---

## Current State

The loyalty system already has significant infrastructure:

| What Exists | Where |
|-------------|-------|
| `/account/loyalty` page | `src/pages/account/LoyaltyPage.tsx` — shows balance, history, rewards, referral |
| Tier progress visualization | `TierProgressCard` — Explorer/Traveler/Elite timeline |
| Points balance card | `PointsBalanceCard` — balance, tier badge, progress bar |
| Tier config with benefits | `src/config/zivoPoints.ts` — 3 tiers with benefits lists |
| Points hook | `useLoyaltyPoints` — balance, earn, redeem, tier calculation |
| Checkout reminder | `PointsCheckoutReminder` — "You'll earn X points" widget |
| Dynamic pricing hook | `useEatsDeliveryPricing` — delivery fee breakdown |

### What's Missing
- No **side-by-side tier comparison** showing all levels and their perks
- No **automatic checkout perks** — free delivery, discounts, bonus points are not applied
- No **reusable loyalty badge** for headers, profile, etc.
- Tier benefits in config are text-only — need structured perk definitions for checkout logic

---

## Implementation Plan

### 1) Extend Tier Config with Checkout Perks

**File to Modify:** `src/config/zivoPoints.ts`

Add structured perk definitions to each tier so checkout can programmatically apply them:

```text
interface TierPerks {
  freeDelivery: boolean;
  discountPercent: number;        // e.g. 0, 5, 10
  bonusPointsMultiplier: number;  // e.g. 1, 1.5, 2
  prioritySupport: boolean;
}

Explorer: { freeDelivery: false, discountPercent: 0,  bonusPointsMultiplier: 1,   prioritySupport: false }
Traveler: { freeDelivery: false, discountPercent: 5,  bonusPointsMultiplier: 1.5, prioritySupport: true  }
Elite:    { freeDelivery: true,  discountPercent: 10, bonusPointsMultiplier: 2,   prioritySupport: true  }
```

Also add a helper: `getTierPerks(tier: ZivoTier): TierPerks`

### 2) Create Tier Comparison Component

**File to Create:** `src/components/loyalty/TierComparisonTable.tsx`

A visual side-by-side comparison of all three tiers showing:
- Tier name, icon, and point threshold
- Benefits list with check/lock icons
- Checkout perks (free delivery, discount %, bonus multiplier)
- Current tier highlighted

### 3) Add Tier Comparison to Loyalty Page

**File to Modify:** `src/pages/account/LoyaltyPage.tsx`

Add a new "Levels" tab (or add to Overview) showing `TierComparisonTable`.

### 4) Create Loyalty Level Badge Component

**File to Create:** `src/components/shared/LoyaltyLevelBadge.tsx`

Small reusable badge showing user's tier with icon and color. Variants:
- `inline` — tiny badge for headers/nav
- `card` — compact card for profile pages

Uses the tier config colors/icons from `zivoPoints.ts`.

### 5) Apply Tier Perks at Checkout

**File to Modify:** `src/hooks/useEatsDeliveryPricing.ts`

Integrate tier perks into the pricing calculation:
- Import `useLoyaltyPoints` to get user's current tier
- If tier grants `freeDelivery`, set delivery fee to $0
- If tier grants `discountPercent`, apply discount to subtotal
- Show loyalty discount as a separate line item

**File to Modify:** `src/components/eats/DeliveryFeeBreakdownCard.tsx`

Add new line items:
- "Loyalty discount (Elite -10%)" — green, when active
- "Free delivery (Elite perk)" — replaces delivery fee line, when active

**File to Modify:** `src/pages/EatsCheckout.tsx`

Add `PointsCheckoutReminder` below the breakdown card showing bonus points multiplier from tier.

### 6) Add Badge to Profile Page

**File to Modify:** `src/pages/Profile.tsx`

Show `LoyaltyLevelBadge` next to user's name/avatar area and add "Loyalty" to quickLinks.

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/components/loyalty/TierComparisonTable.tsx` | Side-by-side tier comparison with perks |
| `src/components/shared/LoyaltyLevelBadge.tsx` | Reusable tier badge for headers/profile |

### Modified Files (6)
| File | Changes |
|------|---------|
| `src/config/zivoPoints.ts` | Add `TierPerks` interface and structured perks to each tier |
| `src/pages/account/LoyaltyPage.tsx` | Add "Levels" tab with tier comparison |
| `src/hooks/useEatsDeliveryPricing.ts` | Apply free delivery and discount based on tier |
| `src/components/eats/DeliveryFeeBreakdownCard.tsx` | Show loyalty discount and free delivery lines |
| `src/pages/EatsCheckout.tsx` | Add points checkout reminder with tier bonus |
| `src/pages/Profile.tsx` | Show loyalty badge + add quickLink |

---

## Checkout Pricing with Tier Perks

```text
Cart Subtotal ($28.50)
       |
       v
  Tier perks applied:
       |
       ├── Elite discount: -10% of subtotal (-$2.85)
       ├── Free delivery (Elite perk): $0.00
       ├── Service fee: 15% of discounted subtotal
       ├── Tax: 8.25%
       |
       v
  Breakdown shown:
       |
       Subtotal                      $28.50
       Loyalty discount (Elite)      -$2.85   (green)
       Delivery fee                   FREE    (green, was $3.99)
       Service fee                    $3.85
       Tax                            $2.12
       ─────────────────────────────────────
       Total                         $31.62

       You'll earn 400 points (2x Elite bonus)
```

---

## Tier Comparison Table Design

```text
+----------------+----------------+----------------+
|   Explorer     |   Traveler     |    Elite       |
|   (current)    |                |                |
+----------------+----------------+----------------+
|   0+ pts       |   5,000+ pts   |  25,000+ pts   |
+----------------+----------------+----------------+
|  1x points     |  1.5x points   |  2x points     |
|  Basic alerts  |  Priority      |  Exclusive     |
|                |  alerts        |  previews      |
|  No discount   |  5% off orders |  10% off       |
|  Standard      |  Priority      |  Priority      |
|  delivery      |  delivery      |  FREE delivery |
|                |  Early deals   |  Birthday pts  |
+----------------+----------------+----------------+
```

---

## Loyalty Badge Variants

**Inline (for header/nav):**
A small pill badge: `[crown icon] Elite` with amber styling.

**Card (for profile):**
A compact card showing tier icon, name, lifetime points, and progress bar to next tier.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User not logged in | No perks applied, no badge shown |
| Explorer tier (no perks) | Standard pricing, badge says "Explorer" |
| Tier upgrade mid-session | Invalidate loyalty query, new perks apply on next checkout |
| Free delivery + surge active | Free delivery overrides surge — delivery fee is $0 |

