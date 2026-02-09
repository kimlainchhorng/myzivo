

# Smarter Delivery Routes — Traffic-Aware ETA Recalculation

## Overview

Enhance delivery ETA accuracy by (1) using real Google traffic data instead of hardcoded time-of-day multipliers, and (2) recalculating ETAs dynamically when batch stop order changes or driver progress shifts. This builds on existing infrastructure — the `maps-route` edge function already returns live traffic data that the frontend currently discards.

## Current Gaps

- **`mapsApi.ts`** discards `duration_in_traffic_minutes` and `traffic_level` returned by the edge function
- **`useDriverProximity`** uses a flat 30mph speed assumption (Haversine / 0.5) with zero traffic awareness
- **`EtaCountdown`** applies a hardcoded rush-hour multiplier (1.4x for 7-9am/4-7pm) instead of real traffic data
- **Batch stop reorder** triggers a refetch of batch info via Realtime, but the ETA shown is only the static `customer_stop_eta` from the database — no live recalculation

## What Changes

### 1. Update `src/services/mapsApi.ts` — Expose traffic data

Add `duration_in_traffic_minutes` and `traffic_level` to the `RouteResult` interface and populate them from the edge function response. These fields already come back from `maps-route` but are currently ignored.

```
RouteResult (updated):
  + duration_in_traffic_minutes: number | null
  + traffic_level: "light" | "moderate" | "heavy" | null
```

### 2. Create `src/hooks/useTrafficAwareEta.ts` — Live route-based ETA

A new hook that, given driver and destination coordinates, periodically calls `maps-route` to get a real traffic-aware ETA. This replaces the flat Haversine calculation when live driver location is available.

Key design:
- Calls `getRoute()` when driver coordinates change, **throttled to once per 60 seconds** to manage API costs
- Falls back to the existing Haversine-based ETA between API calls (instant, every location update)
- Returns both the traffic-aware ETA and the traffic level for display
- Caches the last API result and blends it with live Haversine distance: if the driver has moved closer since the last API call, proportionally reduces the ETA

```
Props:
  driverLat, driverLng: number | null
  destLat, destLng: number | null
  enabled: boolean (only for out_for_delivery status)

Returns:
  etaMinutes: number | null (best available ETA)
  trafficLevel: "light" | "moderate" | "heavy" | null
  isTrafficBased: boolean (true when using real route data)
  lastRouteUpdate: Date
```

### 3. Update `src/hooks/useDriverProximity.ts` — Accept traffic multiplier

Add an optional `trafficMultiplier` parameter. When provided (from useTrafficAwareEta), apply it to the ETA calculation instead of the flat 0.5 mi/min speed. This keeps the hook's instant-recalculation behavior on every location change while using a more accurate speed estimate.

```
New optional param:
  trafficMultiplier?: number (default 1.0)

Modified ETA calc:
  etaToDelivery = Math.max(1, Math.ceil(
    (distanceToDelivery / AVG_SPEED_MILES_PER_MIN) * trafficMultiplier
  ))
```

### 4. Update `src/components/eats/EtaCountdown.tsx` — Use live traffic

Replace the hardcoded `getTrafficMultiplier()` function with an optional `trafficLevel` prop. When the prop is provided, use real traffic data for the multiplier instead of guessing from time of day. Keep the time-of-day fallback when no live data is available.

```
New optional props:
  trafficLevel?: "light" | "moderate" | "heavy" | null
  isTrafficBased?: boolean

Modified traffic logic:
  If trafficLevel is provided:
    "light" -> 1.0, "moderate" -> 1.2, "heavy" -> 1.5
  Else:
    Fall back to existing getTrafficMultiplier()
```

### 5. Update `src/hooks/useOrderBatchInfo.ts` — Recalculate on stop completion

Currently listens for `batch_stops` changes via Realtime and refetches the RPC. Enhance by also:
- Subscribing to the `delivery_batches` table for the batch (catches stop reorder events from dispatch)
- Adding a `refetchInterval` of 30 seconds during active delivery (when batch status is `in_progress`) to catch any missed updates

This is a small change — add one more Realtime channel subscription.

### 6. Wire into `src/pages/EatsOrderDetail.tsx`

Import and use `useTrafficAwareEta` alongside the existing `useDriverProximity`. Pass traffic data down to `EtaCountdown`:

```
const trafficEta = useTrafficAwareEta({
  driverLat, driverLng,
  destLat: order?.delivery_lat,
  destLng: order?.delivery_lng,
  enabled: order?.status === "out_for_delivery",
});

// Pass to EtaCountdown
<EtaCountdown
  ...existing props
  trafficLevel={trafficEta.trafficLevel}
  isTrafficBased={trafficEta.isTrafficBased}
/>
```

Also pass `trafficMultiplier` to `useDriverProximity` so the proximity-based ETA is traffic-aware.

## API Cost Control

The `maps-route` call is the only cost concern. Mitigations:
- **60-second throttle**: Maximum 1 API call per minute per active order tracking page
- **Only during `out_for_delivery`**: No calls during preparation or waiting phases
- **Haversine blend**: Between API calls, the ETA smoothly adjusts based on distance changes without additional API calls
- **Single viewer**: Only the customer viewing their order page triggers calls — no server-side polling

## File Summary

| File | Action | What |
|---|---|---|
| `src/services/mapsApi.ts` | Update | Add `duration_in_traffic_minutes` and `traffic_level` to RouteResult |
| `src/hooks/useTrafficAwareEta.ts` | Create | Throttled route API calls with Haversine blending for live traffic ETA |
| `src/hooks/useDriverProximity.ts` | Update | Accept optional trafficMultiplier for speed adjustment |
| `src/components/eats/EtaCountdown.tsx` | Update | Accept trafficLevel prop, use real data over hardcoded multiplier |
| `src/hooks/useOrderBatchInfo.ts` | Update | Add delivery_batches Realtime subscription + refetch interval |
| `src/pages/EatsOrderDetail.tsx` | Update | Wire useTrafficAwareEta and pass traffic data to ETA components |

Six file changes (one new hook, five updates). No schema changes. No new edge functions.

