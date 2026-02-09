

# Use Demand Forecast to Improve ETA Accuracy

## Overview

Wire the existing `demand_forecasts` data (predicted order volume per zone per hour) into the ETA calculation so that estimated delivery times account for upcoming demand surges -- not just the current queue snapshot. No UI changes; this is a behind-the-scenes accuracy improvement.

## Current State

- **`useQueueAwareEta`** calculates ETA as: `queueWait + prepTime + driverTime`
- **Queue wait** comes from `useRestaurantQueueLength`, which counts *current* active orders -- it has no forward-looking signal
- **Driver time** already uses `scheduleForecastMultiplier` from driver schedule predictions (0.85-1.0)
- **`demand_forecasts`** table stores per-zone, per-hour predictions (`predicted_orders`, `predicted_drivers_needed`, `surge_predicted`, `confidence`) -- currently only used in the admin Dispatch dashboard, never in the customer-facing ETA

## What Changes

### 1. New hook: `src/hooks/useDemandAdjustedEta.ts`

A small hook that:
- Fetches the nearest upcoming `demand_forecasts` row for the restaurant's zone (by matching the restaurant's `region_id` to `zone_code`)
- Returns a `demandMultiplier` (1.0-1.3) based on predicted order volume relative to driver supply:
  - If `predicted_orders / predicted_drivers_needed > 3`: multiplier = 1.3 (high strain)
  - If ratio > 2: multiplier = 1.15
  - If `surge_predicted` is true: multiplier = max(current, 1.1)
  - Otherwise: 1.0 (no adjustment)
- Also returns a confidence-weighted flag so low-confidence forecasts have a dampened effect (multiplier moves toward 1.0 proportionally)
- Uses React Query with a 2-minute stale time to avoid excessive fetches

### 2. Update: `src/hooks/useQueueAwareEta.ts`

- Accept a new optional `demandMultiplier` parameter (default 1.0)
- Apply it to the `prepMinutes` component of the ETA: `adjustedPrepMinutes = prepMinutes * demandMultiplier`
- This inflates the prep estimate when high demand is forecast, making the displayed range more realistic during peak periods

### 3. Update: `src/pages/EatsCheckout.tsx`

- Import `useDemandAdjustedEta` and pass the restaurant's zone/region to it
- Pass the returned `demandMultiplier` into `useQueueAwareEta`
- No visual changes -- the ETA range displayed simply becomes more accurate

## Technical Details

### Demand multiplier calculation (in `useDemandAdjustedEta`)

```text
ratio = predicted_orders / max(predicted_drivers_needed, 1)
rawMultiplier =
  ratio > 3  -> 1.30
  ratio > 2  -> 1.15
  surge_predicted -> max(1.10, current)
  else       -> 1.00

// Dampen by forecast confidence (0-1)
demandMultiplier = 1 + (rawMultiplier - 1) * confidence
```

### ETA formula change (in `useQueueAwareEta`)

```text
Before: baseEta = queueWait + prepMinutes + driverMinutes
After:  baseEta = queueWait + (prepMinutes * demandMultiplier) + driverMinutes
```

### Restaurant zone lookup

The hook needs the restaurant's `region_id` to match against `demand_forecasts.zone_code`. This can be fetched from the `restaurants` table or passed in from the checkout page context where the restaurant is already loaded.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useDemandAdjustedEta.ts` | Create | Fetches forecast, computes demand multiplier |
| `src/hooks/useQueueAwareEta.ts` | Update | Accept and apply `demandMultiplier` to prep time |
| `src/pages/EatsCheckout.tsx` | Update | Wire the new hook into the existing ETA call |

## Edge Cases

- **No forecast data available**: multiplier defaults to 1.0 (no change to current behavior)
- **Low confidence forecast**: multiplier is dampened toward 1.0 proportionally
- **Restaurant has no region assigned**: falls back to 1.0
- **Multiple forecast rows for same time window**: uses the one closest to the current hour
