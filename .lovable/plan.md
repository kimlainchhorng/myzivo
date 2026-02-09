

# Smart Service Adjustments — Transparent AI Response Messaging

## Overview

When the platform activates surge pricing or driver incentives in response to high demand, update customer-facing banners to show transparent "we're responding" messaging instead of just warning about delays. This tells customers the system is actively working to fix the situation — e.g., "High demand in your area -- additional drivers are being notified."

## Current Gaps

- **HighDemandBanner** says "Delivery time may be slightly longer" but never mentions that the platform is responding (notifying drivers, activating incentives)
- **LowDriverSupplyBanner** says "We're actively finding drivers" only when driver count is 0, but shows nothing about incentive activation for low/moderate supply
- **PeakDemandAlert** (pre-order) says "Order early for fastest delivery" but doesn't mention platform response
- **IncentiveBoostBanner** is a separate positive-only banner — its signal is never combined with the demand/supply warnings to show "we're fixing it"
- The `useEatsDeliveryFactors` hook already tracks both `demandActive` and `isIncentivePeriod` but banners never cross-reference them

## What Changes

### 1. Update `src/components/eats/HighDemandBanner.tsx` — Add "drivers being notified" line

Add an optional `isRespondingWithIncentives` prop. When true, append a reassuring sub-line:

- **High demand + incentives active**: "Additional drivers are being notified."
- **Medium demand + incentives active**: "We're bringing more drivers online."

This turns the banner from a warning into a "we see it and we're handling it" message.

```
Updated messaging:

High + incentives:
  Title: "High demand in your area"
  Body: "Delivery time may be slightly longer. Additional drivers are being notified."

Medium + incentives:
  Title: "Busy area right now"  
  Body: "We're bringing more drivers online to speed things up."

High (no incentives, unchanged):
  Title: "High demand in your area"
  Body: "Delivery time may be slightly longer. We appreciate your patience!"
```

### 2. Update `src/components/eats/LowDriverSupplyBanner.tsx` — Add incentive-aware messaging

Add an optional `isIncentiveActive` prop. When true and supply is low, update the subtitle to mention that additional drivers are being recruited:

```
Low supply + incentives:
  Title: "High demand — delivery may take longer"
  Subtitle: "Additional drivers are being notified to your area."

Critical (0 drivers) + incentives:
  Title: "No drivers nearby"
  Subtitle: "We're actively notifying additional drivers. Hang tight!"
```

### 3. Update `src/components/eats/PeakDemandAlert.tsx` — Add proactive response line

Add an optional `isSystemResponding` prop. When true, append a second line under the existing body text showing platform response:

```
High demand predicted + system responding:
  Title: "High demand expected soon"
  Body: "Order early for the fastest delivery."
  Response line: "We're pre-positioning drivers to keep things moving."
```

This is a small addition — just one extra `<p>` tag when the prop is true.

### 4. Update `src/pages/EatsOrderDetail.tsx` — Pass incentive state to banners

Pass `deliveryFactors.isIncentivePeriod` to both `HighDemandBanner` and `LowDriverSupplyBanner` so they can show the "drivers being notified" messaging:

```tsx
<HighDemandBanner 
  level={deliveryFactors.demandLevel} 
  orderId={order.id}
  isRespondingWithIncentives={deliveryFactors.isIncentivePeriod}
/>

<LowDriverSupplyBanner
  supplyLevel={deliveryFactors.driverSupply}
  driverCount={deliveryFactors.nearbyDriverCount}
  orderId={order.id}
  isIncentiveActive={deliveryFactors.isIncentivePeriod}
/>
```

### 5. Update `src/pages/EatsRestaurants.tsx` and `src/pages/EatsRestaurantMenu.tsx` — Pass system responding flag to PeakDemandAlert

Both pages already render `PeakDemandAlert`. Add the new `isSystemResponding` prop using data from `useDriverIncentives` or from `useEatsDeliveryFactors`:

```tsx
<PeakDemandAlert
  ...existing props
  isSystemResponding={demandAlert.isHighDemandPredicted && isIncentivePeriod}
/>
```

For the restaurants listing page, import `useDriverIncentives` to check if incentives are active alongside the demand alert.

## File Summary

| File | Action | What |
|---|---|---|
| `src/components/eats/HighDemandBanner.tsx` | Update | Add `isRespondingWithIncentives` prop, show "additional drivers being notified" |
| `src/components/eats/LowDriverSupplyBanner.tsx` | Update | Add `isIncentiveActive` prop, show incentive-aware subtitle |
| `src/components/eats/PeakDemandAlert.tsx` | Update | Add `isSystemResponding` prop, show proactive response line |
| `src/pages/EatsOrderDetail.tsx` | Update | Pass `isIncentivePeriod` to demand and supply banners |
| `src/pages/EatsRestaurants.tsx` | Update | Import `useDriverIncentives`, pass `isSystemResponding` to `PeakDemandAlert` |
| `src/pages/EatsRestaurantMenu.tsx` | Update | Import `useDriverIncentives`, pass `isSystemResponding` to `PeakDemandAlert` |

Six file updates, no new files, no schema changes, no new edge functions.
