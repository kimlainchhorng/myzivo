

# Surge Pricing Display for Eats

## Overview
Add surge pricing visibility to the Eats service so customers see clear indicators when delivery fees are higher due to high demand. The system will leverage the existing global surge multiplier infrastructure (used for Rides) and apply it to Eats delivery fees.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `surge_multipliers` table | Complete | Has zone='GLOBAL', multiplier (currently 1.0) |
| `useSurgePricing` hook | Complete | Fetches global surge, refreshes every 15s |
| `useZoneSurgePricing` hook | Complete | Same as above with zone context |
| `getSurgeLevelFromMultiplier()` | Complete | Returns "Low", "Medium", "High" |
| `SurgeLevel` type | Complete | "Low" / "Medium" / "High" |
| Surge badge for Rides | Complete | RideCard.tsx shows "Busy time pricing x1.5" |
| `CustomerCityContext` | Complete | Has selectedCity with zoneCode |
| `eats_zones` table | Complete | delivery_fee_base per zone |
| `EatsPriceBreakdown` component | Complete | Shows delivery fee line item |
| `EatsCart` page | Complete | Calculates deliveryFee = $3.99 base |

### Missing
| Feature | Status |
|---------|--------|
| `useEatsSurgePricing` hook | Need to create |
| Surge badge on restaurant list | Need to add |
| Surge badge on restaurant detail page | Need to add |
| Surge delivery fee calculation | Need to integrate |
| Surge breakdown in order summary | Need to add |
| Surge badge component for Eats | Need to create |

---

## Implementation Plan

### 1) Create Eats Surge Pricing Hook

**File to Create:** `src/hooks/useEatsSurgePricing.ts`

**Purpose:** Fetch and apply surge pricing specifically for Eats delivery fees.

```typescript
interface EatsSurgePricingInfo {
  multiplier: number;
  level: SurgeLevel; // "Low" | "Medium" | "High"
  isActive: boolean;
  label: string;
  isLoading: boolean;
  // Calculated fees
  calculateDeliveryFee: (baseFee: number) => {
    baseFee: number;
    surgeAmount: number;
    finalFee: number;
  };
}
```

**Logic:**
- Uses existing `fetchGlobalSurgeMultiplier()` from `src/lib/surge.ts`
- Refreshes every 15 seconds
- Provides helper to calculate surged delivery fee
- Capped at MAX_SURGE_MULTIPLIER (2.5x)

### 2) Create Eats Surge Badge Component

**File to Create:** `src/components/eats/EatsSurgeBadge.tsx`

**Purpose:** Reusable badge showing surge status with appropriate styling.

**UI Variants:**

| Level | Color | Icon | Example Text |
|-------|-------|------|--------------|
| Low | (hidden) | - | - |
| Medium | Orange | 🔥 | "Busy - higher fees" |
| High | Red | 🔥🔥 | "High demand - surge pricing" |

**Design:**
```text
+----------------------------------------+
| 🔥 High demand – surge pricing active  |
+----------------------------------------+
```

- Badge background: `bg-orange-500/90` (Medium) or `bg-red-500/90` (High)
- Rounded pill with backdrop blur
- Compact variant for cards, expanded for banners

### 3) Add Surge Badge to Restaurant List

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

**Changes:**
- Import `useEatsSurgePricing` hook
- Show global surge banner at top when surge is active
- Display estimated surge delivery fee on each restaurant card

**UI:**
```text
+----------------------------------------------------------+
| 🔥 High demand – delivery fees may be higher              |
|    Prices are higher due to busy conditions               |
+----------------------------------------------------------+

[Restaurant Cards with surge indicator...]
```

**Location:** Above category pills when surge is active

### 4) Add Surge Badge to Restaurant Detail Header

**File to Modify:** `src/pages/EatsRestaurantDetail.tsx`

**Changes:**
- Add surge banner below restaurant info when active
- Show surged delivery fee estimate

### 5) Update Cart with Surge Pricing Breakdown

**File to Modify:** `src/pages/EatsCart.tsx`

**Changes:**
- Use `useEatsSurgePricing` hook
- Calculate delivery fee with surge applied
- Show breakdown in order summary:

**UI:**
```text
+------------------------------------------+
| Order Summary                            |
+------------------------------------------+
| Subtotal                          $24.99 |
| Delivery Fee                             |
|   Base fee                        $3.99  |
|   Busy time fee (×1.5)           +$2.00  |
|   ────────────────────────────────────── |
|   Final delivery                  $5.99  |
| Service Fee                        $1.25 |
| Tax                                $2.00 |
+------------------------------------------+
| Total                            $34.23  |
+------------------------------------------+
```

**Alternative (simpler):**
```text
| Delivery Fee                      $5.99  |
|   (includes $2.00 surge)                 |
```

### 6) Update Order Creation with Surge Tracking

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes:**
- Add `surge_multiplier` and `surge_amount` to CreateFoodOrderInput
- Store surge info with order for historical tracking

### 7) Add Surge Explainer Tooltip

**File to Create:** `src/components/eats/SurgeExplainerTooltip.tsx`

**Purpose:** Info tooltip explaining why prices are higher.

**Content:**
> "Prices may be higher due to high demand in your area. This helps ensure faster delivery times."

**Trigger:** Info icon (ℹ️) next to surge badge or delivery fee line

---

## Database Changes

### Add surge tracking to food_orders

**Migration:**
```sql
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS surge_multiplier NUMERIC(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS surge_fee_cents INTEGER DEFAULT 0;
```

This allows:
- Historical reporting on surge orders
- Customer support to see if surge was applied
- Analytics on surge frequency and revenue impact

---

## File Summary

### Database Migration (1)
| Change | Purpose |
|--------|---------|
| Add `surge_multiplier`, `surge_fee_cents` to food_orders | Track surge on orders |

### New Files (3)
| File | Purpose |
|------|---------|
| `src/hooks/useEatsSurgePricing.ts` | Eats-specific surge hook |
| `src/components/eats/EatsSurgeBadge.tsx` | Surge status badge |
| `src/components/eats/SurgeExplainerTooltip.tsx` | Info tooltip |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/components/eats/MobileEatsPremium.tsx` | Add surge banner at top |
| `src/pages/EatsRestaurantDetail.tsx` | Add surge badge to header |
| `src/pages/EatsCart.tsx` | Show surge breakdown in summary |
| `src/hooks/useEatsOrders.ts` | Add surge fields to order creation |

---

## UI Component Details

### EatsSurgeBadge (Compact - for cards)
```text
[🔥 Surge active]
```
- Height: 24px
- Font: 10px bold
- Background: orange-500 (Medium) / red-500 (High)
- Border radius: full

### EatsSurgeBadge (Banner - for list header)
```text
+----------------------------------------------------------+
| 🔥 High demand – delivery fees may be higher              |
|    Prices are higher due to busy conditions. [Why?]       |
+----------------------------------------------------------+
```
- Full width
- Padding: 16px
- Background: orange-500/10 (Medium) / red-500/10 (High)
- Border: 1px orange-500/30

### Order Summary Surge Lines
```text
| Delivery Fee                             |
|   Base                            $3.99  |
|   Busy time (×1.5)               +$2.00  |  <- Orange text
|   ─────────────────────                  |
|   Total                           $5.99  |
```

---

## Data Flow

```text
App Loads
    ↓
useEatsSurgePricing() fetches surge_multipliers (zone='GLOBAL')
    ↓
multiplier > 1.0 → Surge is active
    ↓
MobileEatsPremium shows banner: "High demand – surge pricing active"
    ↓
User browses restaurants (each card shows delivery fee unchanged)
    ↓
User adds items to cart
    ↓
EatsCart calculates:
├── baseFee = zone.delivery_fee_base (e.g., $3.99)
├── surgeAmount = baseFee × (multiplier - 1) (e.g., $2.00)
└── finalFee = baseFee × multiplier (e.g., $5.99)
    ↓
Order summary shows breakdown
    ↓
User places order
    ↓
Order stored with:
├── delivery_fee = $5.99 (final)
├── surge_multiplier = 1.5
└── surge_fee_cents = 200
    ↓
Driver assigned, order proceeds
```

---

## Surge Level Thresholds

Using existing logic from `getSurgeLevelFromMultiplier()`:

| Multiplier | Level | Badge Color | Display |
|------------|-------|-------------|---------|
| 1.0 | Low | Hidden | No badge |
| 1.01 - 1.5 | Medium | Orange | "Busy - higher fees" |
| > 1.5 | High | Red | "High demand - surge pricing" |

---

## Technical Notes

### Why Use Global Surge?
The `surge_multipliers` table currently only has zone='GLOBAL'. This is admin-controlled and applies universally. Future enhancement could support zone-specific surge.

### Refresh Rate
Surge multiplier refreshes every 15 seconds (matching rides), ensuring customers see up-to-date pricing.

### Maximum Cap
Surge is capped at 2.5x (MAX_SURGE_MULTIPLIER) to prevent abuse.

### Transparency
Clear breakdown ensures customers understand exactly what they're paying and why.

---

## Summary

This implementation adds surge pricing visibility to Eats:

1. **Surge Hook** - `useEatsSurgePricing` fetches and applies global surge to delivery fees
2. **Surge Badge** - Visual indicator with orange (Medium) / red (High) styling
3. **Restaurant List Banner** - Top banner when surge is active
4. **Cart Breakdown** - Shows base fee + surge fee = final delivery fee
5. **Order Tracking** - Stores surge_multiplier and surge_fee_cents on orders
6. **Explainer** - Tooltip explaining why prices are higher

Leverages existing surge infrastructure from Rides (same database table, same fetch logic) while providing Eats-specific UI components and fee calculations.

