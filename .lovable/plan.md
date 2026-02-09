

# Faster Smart Dispatch — Transparent Matching with Post-Assignment Route ETA

## Overview

Improve the driver-matching experience by (1) showing real-time dispatch transparency during the "searching" phase -- including nearby driver count and estimated match time, and (2) providing a more accurate initial ETA immediately after driver assignment by using the traffic-aware route calculation.

## Current State

- **DispatchSearchBanner** already supports a `nearbyCount` prop but EatsOrderDetail doesn't pass it -- it renders `<DispatchSearchBanner orderId={order.id} />` with no driver count
- **useTrafficAwareEta** only activates during `out_for_delivery` status, so the driver's initial ETA to the restaurant (pickup phase) has no traffic awareness
- **DispatchSearchBanner** shows a generic "Finding the best driver near you..." with an infinite loading animation but no estimate of how long matching will take
- **Post-assignment messaging** jumps straight to "Driver heading to restaurant" with no transition confirming the match

## What Changes

### 1. Update `src/pages/EatsOrderDetail.tsx` — Pass nearby count + enable early traffic ETA

- Pass `deliveryFactors.nearbyDriverCount` to `DispatchSearchBanner` so customers see "3 drivers nearby" during search
- Expand `useTrafficAwareEta` activation to also cover `confirmed` and `preparing` statuses (when a driver is assigned and heading to pickup), not just `out_for_delivery`. This gives traffic-aware ETA during the pickup phase too.

### 2. Update `src/components/eats/DispatchSearchBanner.tsx` — Add match time estimate + matched transition

Add two enhancements:
- **Estimated match time**: When `nearbyCount` is available, show "Usually matched in under 1 min" (if 3+ drivers nearby), "Usually matched in 1-2 min" (1-2 drivers), or no estimate (0 drivers). This sets expectations.
- **New prop `driverName`**: When a driver is just assigned, briefly show a "Matched!" confirmation with the driver name before the banner exits. This creates a satisfying transition moment.

### 3. Update `src/hooks/useEatsDispatchStatus.ts` — Add "just matched" phase

Add a new `matched` phase that fires for a few seconds after driver assignment. This lets the UI show a brief success state ("Matched with [driver]!") before transitioning to "Driver heading to restaurant."

New phase:
```
"matched" — Driver just assigned (shown for ~3 seconds)
  message: "Matched with your driver!"
  subMessage: "They're heading to the restaurant now"
  showSearching: false
```

This is tracked with a `justAssigned` prop: when `driverId` transitions from null to a value, the hook returns `matched` phase for a brief window.

### 4. Update `src/pages/EatsOrderDetail.tsx` — Wire matched transition

Track previous driver ID to detect assignment moment. Pass a `justAssigned` flag to the dispatch status hook. Show the DispatchSearchBanner in "matched" mode briefly, then let it animate out.

### 5. Update `src/hooks/useTrafficAwareEta.ts` — Support pickup-phase ETA

The hook currently only activates for `out_for_delivery`. Change the `enabled` prop in EatsOrderDetail to also be true when a driver is assigned and heading to pickup (status is `confirmed`, `preparing`, or `ready`). The hook itself doesn't change -- just the `enabled` condition and destination coordinates (pickup instead of delivery).

Create a second instance of the hook for the pickup phase:

```
const pickupTrafficEta = useTrafficAwareEta({
  driverLat, driverLng,
  destLat: pickupLat,
  destLng: pickupLng,
  enabled: !!order?.driver_id && ["confirmed", "preparing", "ready", "ready_for_pickup"].includes(order?.status),
});
```

Pass `pickupTrafficEta.trafficMultiplier` to `useDriverProximity` during the pickup phase for more accurate "Driver ETA to restaurant" estimates.

## Technical Detail

### DispatchSearchBanner match time estimate logic

```
if nearbyCount >= 3: "Usually matched in under 1 min"
if nearbyCount >= 1: "Usually matched in 1-2 min"  
if nearbyCount === 0 or null: no estimate shown
```

### Just-assigned detection in EatsOrderDetail

```
const prevDriverId = useRef(order?.driver_id);
const [justAssigned, setJustAssigned] = useState(false);

useEffect(() => {
  if (!prevDriverId.current && order?.driver_id) {
    setJustAssigned(true);
    const timer = setTimeout(() => setJustAssigned(false), 3000);
    return () => clearTimeout(timer);
  }
  prevDriverId.current = order?.driver_id;
}, [order?.driver_id]);
```

### EatsDispatchStatus matched phase

When `justAssigned` is true and `driverId` exists, return:
```
{ phase: "matched", message: "Matched with your driver!", subMessage: "Heading to restaurant now", showSearching: false }
```

### DispatchSearchBanner updated props

```
interface DispatchSearchBannerProps {
  nearbyCount?: number | null;
  orderId: string;
  className?: string;
  matchedDriverName?: string | null;  // NEW: show matched state
  isMatched?: boolean;                // NEW: trigger matched animation
}
```

When `isMatched` is true, the banner briefly shows a green checkmark animation with "Matched!" before animating out.

## File Summary

| File | Action | What |
|---|---|---|
| `src/pages/EatsOrderDetail.tsx` | Update | Pass nearbyCount to DispatchSearchBanner, add justAssigned detection, add pickup-phase traffic ETA |
| `src/components/eats/DispatchSearchBanner.tsx` | Update | Add match time estimate, matched driver transition animation |
| `src/hooks/useEatsDispatchStatus.ts` | Update | Add "matched" phase for just-assigned transition |
| `src/hooks/useTrafficAwareEta.ts` | No change | Reused with pickup coordinates for pickup-phase ETA |

Three file updates, no new files, no schema changes.

