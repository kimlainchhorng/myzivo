

# Real-Time Service Feedback — Metric-Driven ETA and Demand Transparency

## Overview

Close the gap between the platform's real-time metrics (traffic, demand forecasts, driver supply) and the customer experience by (1) feeding all available signals into the ETA calculation for better accuracy, and (2) showing a clear "High demand right now" banner on checkout and cart pages when conditions warrant it.

## Current Gaps

- **useSmartEta** uses `supplyMultiplier` and time-of-day traffic but ignores `forecastMultiplier` from demand predictions and the real `trafficMultiplier` from Google Directions API via `useTrafficAwareEta`
- **Checkout and Cart pages** show surge pricing badges and incentive/peak banners, but never show a "high demand right now" warning banner -- customers only see that on the order tracking page after placing an order
- **deliveryFactors.isForecastedDemand** and **forecastMultiplier** are computed by `useEatsDeliveryFactors` but never consumed by any customer-facing page
- **Real traffic data** (from `useTrafficAwareEta`) runs in parallel with the static time-of-day traffic factor in `useSmartEta` -- they never combine, so the "smart" ETA misses real route data

## What Changes

### 1. Update `src/hooks/useSmartEta.ts` -- Incorporate forecast and real traffic multipliers

Add two new optional props:
- `forecastMultiplier` (from `useUpcomingDemandAlert` or `useEatsDeliveryFactors`) -- inflates prep time when demand is predicted to rise
- `realTrafficMultiplier` (from `useTrafficAwareEta`) -- replaces the static time-of-day traffic factor when real route data is available

Updated ETA logic:
```
Prep component:
  adjustedPrep = basePrepMinutes * demandFactor * forecastMultiplier * prepSpeedFactor

Travel component:
  if realTrafficMultiplier is available (route data exists):
    adjustedTravel = travelEtaMinutes * realTrafficMultiplier
  else:
    adjustedTravel = travelEtaMinutes * timeOfDayTrafficFactor (existing behavior)
```

This means the ETA gets more accurate as more signals become available -- starts with time-of-day heuristics, upgrades to real route data once a driver is assigned.

### 2. Update `src/pages/EatsOrderDetail.tsx` -- Pass new multipliers to useSmartEta

Pass `forecastMultiplier` from `deliveryFactors` and the active `trafficMultiplier` from `useTrafficAwareEta` to `useSmartEta`:

```
const smartEta = useSmartEta({
  ...existing props,
  forecastMultiplier: deliveryFactors.forecastMultiplier,
  realTrafficMultiplier: activeTrafficMultiplier,
});
```

This connects the two existing data streams so ETA calculations on the order detail page use all available real-time data.

### 3. Create `src/components/eats/LiveDemandBanner.tsx` -- "High demand right now" banner for pre-order pages

A new banner component for checkout and cart pages that shows when demand is active (surge) or forecasted. Unlike `HighDemandBanner` (which is order-specific and dismissible per order), this is a lightweight, session-dismissible banner for pre-order contexts.

Two states:
- **Active surge**: "High demand right now -- delivery times may vary." (orange)
- **Forecasted demand**: "Demand is increasing -- delivery times may change." (amber)

Both include incentive-aware sub-text when `isIncentivePeriod` is true:
- "We're bringing additional drivers online."

The banner is dismissible per session.

### 4. Update `src/pages/EatsCheckout.tsx` -- Add LiveDemandBanner and pass forecast multiplier to ETA

- Import and render `LiveDemandBanner` above the ETA breakdown when demand is active or forecasted
- Pass `deliveryFactors.forecastMultiplier` to `useQueueAwareEta` so checkout ETA reflects predicted demand
- Show the banner between the promo section and ETA breakdown for visibility

### 5. Update `src/pages/EatsCart.tsx` -- Add LiveDemandBanner

- Import and render `LiveDemandBanner` at the top of the cart summary when demand is active or forecasted
- This gives customers early awareness before they reach checkout

### 6. Update `src/hooks/useQueueAwareEta.ts` -- Accept forecast multiplier

Add an optional `forecastMultiplier` prop that inflates the prep time estimate, matching the pattern already used for `demandMultiplier` and `scheduleForecastMultiplier`. This ensures the checkout ETA accounts for predicted demand increases.

## Technical Detail

### useSmartEta new props

```typescript
interface UseSmartEtaOptions {
  // ...existing props
  forecastMultiplier?: number;      // From useEatsDeliveryFactors (1.0-1.3)
  realTrafficMultiplier?: number;   // From useTrafficAwareEta (1.0-1.5)
}
```

Updated travel calculation:
```typescript
const effectiveTrafficFactor = realTrafficMultiplier != null && realTrafficMultiplier > 0
  ? realTrafficMultiplier
  : traffic.factor;

const effectiveForecast = forecastMultiplier ?? 1.0;

// Prep phase
const adjustedPrep = basePrepMinutes * demandFactor * effectiveForecast * prepSpeedFactor;
const adjustedTravel = travelEtaMinutes * effectiveTrafficFactor;
```

### LiveDemandBanner component

```typescript
interface LiveDemandBannerProps {
  isActive: boolean;           // Current surge active
  isForecastedDemand: boolean; // Predicted upcoming demand
  isIncentivePeriod: boolean;  // Platform responding with incentives
  className?: string;
}
```

Messaging:
```
Active surge:
  "High demand right now -- delivery times may vary."
  + incentives: "We're bringing additional drivers online."

Forecasted only:
  "Demand is increasing -- delivery times may change."
  + incentives: "We're pre-positioning drivers in your area."
```

### EatsCheckout integration

```tsx
{(deliveryFactors.demandActive || deliveryFactors.isForecastedDemand) && (
  <LiveDemandBanner
    isActive={deliveryFactors.demandActive}
    isForecastedDemand={deliveryFactors.isForecastedDemand}
    isIncentivePeriod={deliveryFactors.isIncentivePeriod}
  />
)}
```

### useQueueAwareEta change

Add `forecastMultiplier` to the options interface and multiply it into the prep time component alongside the existing `demandMultiplier`:

```typescript
const effectivePrep = basePrepTime * demandMultiplier * (forecastMultiplier ?? 1.0);
```

## File Summary

| File | Action | What |
|---|---|---|
| `src/hooks/useSmartEta.ts` | Update | Add `forecastMultiplier` and `realTrafficMultiplier` props, use in ETA calculation |
| `src/pages/EatsOrderDetail.tsx` | Update | Pass forecast and traffic multipliers to `useSmartEta` |
| `src/components/eats/LiveDemandBanner.tsx` | Create | Pre-order demand banner with active/forecast states |
| `src/pages/EatsCheckout.tsx` | Update | Add `LiveDemandBanner`, pass `forecastMultiplier` to queue ETA |
| `src/pages/EatsCart.tsx` | Update | Add `LiveDemandBanner` for early demand awareness |
| `src/hooks/useQueueAwareEta.ts` | Update | Accept and apply `forecastMultiplier` to prep time |

One new file, five updates. No schema changes, no new edge functions.
