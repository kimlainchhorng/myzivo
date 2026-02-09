

# Faster Delivery During Peak — Incentive-Aware ETA and Messaging

## Overview

The hooks for driver incentives (`useDriverIncentives`), peak scheduling (`useScheduledDriverForecast`), and the combined delivery factors (`useEatsDeliveryFactors`) are all fully built. The positive-messaging banners (`IncentiveBoostBanner`, `PeakDriverBanner`) also exist. However, two gaps remain:

1. **ETA on checkout ignores incentive/peak multipliers** -- `EatsCheckout.tsx` passes `demandMultiplier` to the ETA but never passes `scheduleForecastMultiplier` or applies the `incentiveMultiplier` (0.85x during incentive periods)
2. **No positive messaging on checkout** -- the "More drivers available" banners only show on the order tracking page, not at checkout where customers make their buying decision

## What Changes

### 1. Wire delivery factors into checkout ETA (`src/pages/EatsCheckout.tsx`)

- Import `useEatsDeliveryFactors` (already used on order detail page)
- Pass its `scheduleForecastMultiplier` and `incentiveMultiplier` to `useQueueAwareEta`
- This makes the checkout ETA faster (and more accurate) during peak/incentive periods

### 2. Apply incentive multiplier in ETA calculation (`src/hooks/useQueueAwareEta.ts`)

- Add a new optional `incentiveMultiplier` parameter (default 1.0)
- Apply it to driver minutes: `adjustedDriverMinutes = driverMinutes * scheduleForecastMultiplier * incentiveMultiplier`
- During incentive periods (multiplier = 0.85), this reduces the driver portion of the ETA by ~15%, reflecting the faster pickup from more available drivers

### 3. Show positive banners on checkout (`src/pages/EatsCheckout.tsx`)

- Render `IncentiveBoostBanner` (compact variant) when `deliveryFactors.showIncentiveBanner` is true -- shows "More drivers online -- faster delivery"
- Render `PeakDriverBanner` (compact variant) when `deliveryFactors.showPeakBanner` is true -- shows the schedule-based peak message
- Place them near the ETA display so customers see them in context

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useQueueAwareEta.ts` | Update | Add `incentiveMultiplier` param, apply to driver time |
| `src/pages/EatsCheckout.tsx` | Update | Import delivery factors, pass multipliers to ETA, render banners |

## Technical Details

### Updated ETA formula

```text
adjustedPrepMinutes = prepMinutes * demandMultiplier
adjustedDriverMinutes = driverMinutes * scheduleForecastMultiplier * incentiveMultiplier
totalEta = queueWait + adjustedPrepMinutes + adjustedDriverMinutes
```

During a peak incentive period, a typical calculation might be:
- prepMinutes = 15, demandMultiplier = 1.15 (high demand)
- driverMinutes = 10, scheduleForecastMultiplier = 0.9, incentiveMultiplier = 0.85
- Result: 0 + 18 + 8 = 26 min (vs 25 min without adjustments -- demand inflates prep but incentives reduce driver time)

### Banner placement on checkout

The compact variant banners render as a single line with an icon, placed directly above the ETA breakdown card. Only one banner shows at a time (priority: incentive > peak), following the same mutual exclusivity rules already defined in `useEatsDeliveryFactors`.

## Edge Cases

- **No incentives or peak active**: multipliers default to 1.0, no banners shown -- zero change to current behavior
- **High demand + incentive active**: demand banner takes priority (existing logic in `useEatsDeliveryFactors`), but ETA still benefits from the incentive multiplier
- **Restaurant has no region**: delivery factors still work (incentives are time-based, not zone-based)
