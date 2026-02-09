

# Dynamic Delivery Pricing — Demand-Aware Checkout

## Overview

Connect the existing surge pricing system to delivery time estimates and add demand transparency messaging to the EatsCart page. The infrastructure (surge hooks, delivery fee breakdown, ETA breakdown, demand forecasting) is already built — this update wires the missing connections and adds the "High demand" banner to EatsCart.

## Current State

- **EatsCheckout** already shows the full `DeliveryFeeBreakdownCard` with demand adjustment line items and an amber "Delivery fee adjusted due to high demand" banner, plus a detailed `EtaBreakdownCard`
- **EatsCart** shows surge delivery fee breakdown (base + busy time multiplier) but is missing: (1) the "High demand in your area" banner, and (2) demand-adjusted delivery time — it hardcodes "ASAP (30-45 min)"
- **ETA calculation** (`useQueueAwareEta`) already accepts a `demandMultiplier` from `useDemandAdjustedEta`, but EatsCart doesn't use either of these hooks
- The `useEatsDeliveryPricing` hook already computes `surgeLabel` ("Delivery fee adjusted due to high demand") but EatsCart uses the older `useEatsSurgePricing` hook directly instead

## What Changes

### 1. Update `src/pages/EatsCart.tsx`

**Add demand-adjusted ETA**: Import and use `useDemandAdjustedEta` and `useQueueAwareEta` (same as EatsCheckout does) to replace the hardcoded "30-45 min" with real demand-aware estimates.

**Add "High demand" banner**: When surge is active, display an amber banner above the order summary reading "High demand in your area — Delivery fee adjusted based on demand." This matches the pattern already used in `DeliveryFeeBreakdownCard`.

**Replace hardcoded delivery time**: Change the "Delivery Time" line from `ASAP (30-45 min)` to use the calculated ETA range from `useQueueAwareEta`, which already factors in queue wait, prep time, driver time, and demand multiplier.

### 2. Update `src/hooks/useQueueAwareEta.ts`

**Link surge to driver ETA**: Add the surge multiplier as an optional input. When surge is active (multiplier > 1.0), inflate the `driverMinutes` component by a dampened factor (e.g., `driverMinutes * (1 + (surgeMultiplier - 1) * 0.5)`). This reflects that high demand means longer driver wait times. Cap the inflation at 1.3x to avoid scaring users.

### 3. Update `src/components/eats/EtaBreakdownCard.tsx`

**Add demand note**: When high demand is detected (passed as a new optional prop `surgeActive`), show a small note below the ETA range: "Delivery times may be longer due to high demand." This provides the transparency the user requested.

## Technical Detail

### EatsCart changes

```
Current delivery time display (line ~472):
  "ASAP (30-45 min)"

New display:
  "ASAP ({eta.etaMinRange}-{eta.etaMaxRange} min)"

New hooks added to EatsCart:
  const { demandMultiplier } = useDemandAdjustedEta(restaurantRegionId);
  const eta = useQueueAwareEta({ restaurantId, demandMultiplier });
```

The restaurant's `region_id` will be fetched via the existing `useRestaurant` hook (already used in EatsCheckout).

### EatsCart demand banner

Added above the order summary section when `surgeActive` is true:

```
[AlertTriangle icon] High demand in your area
Delivery fee adjusted based on demand.
```

Uses the same amber color scheme as `DeliveryFeeBreakdownCard` (orange-500/10 bg, orange-400 text).

### useQueueAwareEta enhancement

New optional param: `surgeMultiplier?: number`

```
// In driver minutes calculation:
const surgeInflation = surgeMultiplier && surgeMultiplier > 1
  ? Math.min(1 + (surgeMultiplier - 1) * 0.5, 1.3)
  : 1.0;
const adjustedDriverMinutes = Math.round(baseDriverMinutes * surgeInflation);
```

This ensures that when delivery fees go up due to demand, the ETA honestly reflects longer delivery times too.

### EtaBreakdownCard enhancement

New optional prop: `surgeActive?: boolean`

When true, appends a note below the breakdown:
"Delivery times may be longer due to high demand in your area."

## File Summary

| File | Action | What |
|---|---|---|
| `src/pages/EatsCart.tsx` | Update | Add demand-adjusted ETA, demand banner, replace hardcoded "30-45 min" |
| `src/hooks/useQueueAwareEta.ts` | Update | Accept surgeMultiplier param, inflate driverMinutes during surge |
| `src/components/eats/EtaBreakdownCard.tsx` | Update | Add surgeActive prop with demand note |

Three file changes. No new files, hooks, or database changes needed — this wires existing infrastructure together.
