

# Improved Availability and ETA — Proactive Demand Prediction

## Overview

Use the existing demand forecasting engine to (1) proactively warn customers about upcoming high demand before they order, (2) feed forecast data into ETA calculations earlier in the flow (at the restaurant listing/menu level, not just at checkout), and (3) reduce "out of delivery area" situations by surfacing delivery coverage warnings based on predicted driver supply.

## Current State

- **`useDemandAdjustedEta`** fetches the nearest `demand_forecasts` row for a restaurant's `region_id` and returns a `demandMultiplier` (1.0-1.3). Used in EatsCart and EatsCheckout but **not** on the restaurant listing or menu pages.
- **`useScheduledDriverForecast`** predicts upcoming driver supply from schedules and returns `isPeakApproaching`, `peakStartsIn`, and `peakMessage`. Only used in `useEatsDeliveryFactors` during order tracking.
- **`useDemandForecast`** (admin hook) fetches full zone forecasts including `surge_predicted`, `predicted_drivers_needed`, and `current_drivers_online`. Only used in admin dispatch pages.
- **No proactive customer-facing banner** exists for predicted upcoming demand -- all demand banners are reactive (shown after order is placed or at checkout).
- **Restaurant listing page** (`EatsRestaurants.tsx`) has no demand awareness at all -- no ETA adjustments, no surge warnings, no coverage hints.

## What Changes

### 1. Create `src/hooks/useUpcomingDemandAlert.ts` — Lightweight customer-facing forecast hook

A new hook that checks `demand_forecasts` for a given zone (or all zones if none specified) and returns whether high demand is predicted soon. Unlike the admin `useDemandForecast`, this is simple, read-only, and returns just what the customer UI needs.

```
Input:
  zoneCode?: string | null  (restaurant's region_id, or null for general)

Output:
  isHighDemandPredicted: boolean     (surge_predicted in next 1-2 hours)
  predictedIn: number | null         (minutes until surge forecast)
  alertMessage: string | null        (customer-facing message)
  demandMultiplier: number           (1.0-1.3, for ETA inflation)
  isLowCoverage: boolean             (predicted_drivers < predicted_needed * 0.5)
  coverageMessage: string | null     (e.g. "Limited delivery drivers in this area")
  isLoading: boolean
```

Logic:
- Query `demand_forecasts` for the zone where `forecast_for` is within the next 2 hours
- If any row has `surge_predicted = true`, set `isHighDemandPredicted = true`
- If `current_drivers_online < predicted_drivers_needed * 0.5`, set `isLowCoverage = true`
- Generate the alert message: "High demand expected soon -- order early for fastest delivery."
- Generate coverage message: "Limited delivery drivers in this area right now."

### 2. Create `src/components/eats/PeakDemandAlert.tsx` — Proactive demand banner

A dismissible amber/orange banner for restaurant listing and menu pages. Visually consistent with the existing `HighDemandBanner` component (uses the same color scheme and animation patterns).

Two modes:
- **Surge predicted**: "High demand expected soon -- order early for fastest delivery." (amber, with a TrendingUp icon)
- **Low coverage**: "Limited delivery coverage in this area. Delivery times may vary." (yellow/muted, with AlertTriangle icon)

Dismissible per-session using `sessionStorage` (same pattern as `HighDemandBanner`).

### 3. Update `src/pages/EatsRestaurants.tsx` — Add demand alert + ETA hints

- Import and use `useUpcomingDemandAlert` (with no zone code, to get general area forecast)
- Show `PeakDemandAlert` above the restaurant grid when `isHighDemandPredicted` or `isLowCoverage` is true
- On each restaurant card, when high demand is predicted, show a subtle indicator (small text like "Busy soon" next to delivery time) so customers can make informed choices

### 4. Update `src/pages/EatsRestaurantMenu.tsx` — Add demand-aware ETA on menu page

- Import `useUpcomingDemandAlert` with the restaurant's `region_id`
- Show `PeakDemandAlert` on the menu page when high demand is predicted for that restaurant's zone
- Use the hook's `demandMultiplier` to adjust the displayed prep time estimate (currently shown from `restaurant.avg_prep_time`), giving customers a more realistic time before they add items to cart

### 5. Update `src/hooks/useEatsDeliveryFactors.ts` — Incorporate forecast demand data

Add `useUpcomingDemandAlert` as an additional signal in the delivery factors:
- When `isHighDemandPredicted` is true but current surge is not yet active, set a new `isForecastedDemand` flag
- This allows order detail and checkout pages to show "Demand increasing -- your delivery time may change" even before surge pricing kicks in
- Add `isLowCoverage` to delivery factors for downstream use (potential "limited coverage" warnings)

## Technical Detail

### useUpcomingDemandAlert query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["upcoming-demand-alert", zoneCode],
  staleTime: 3 * 60 * 1000, // 3 minutes
  refetchInterval: 3 * 60 * 1000,
  queryFn: async () => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    let query = supabase
      .from("demand_forecasts")
      .select("predicted_orders, predicted_drivers_needed, current_drivers_online, surge_predicted, confidence, forecast_for")
      .gte("forecast_for", now.toISOString())
      .lte("forecast_for", twoHoursLater.toISOString())
      .order("forecast_for", { ascending: true });

    if (zoneCode) {
      query = query.eq("zone_code", zoneCode);
    }

    const { data: rows, error } = await query.limit(5);
    if (error) throw error;
    // Process rows to determine alert state...
  },
});
```

### PeakDemandAlert messaging

```text
Surge predicted:
  Title: "High demand expected soon"
  Body: "Order early for the fastest delivery."

Low coverage:
  Title: "Limited delivery coverage"  
  Body: "Fewer drivers available — delivery times may vary."
```

### ETA adjustment on menu page

```typescript
const adjustedPrepTime = Math.round(
  (restaurant?.avg_prep_time ?? 20) * demandAlert.demandMultiplier
);
// Display: "~{adjustedPrepTime} min" instead of raw avg_prep_time
```

### Restaurant card "Busy soon" indicator

When `isHighDemandPredicted` is true, add a small badge on each restaurant card:

```tsx
{isHighDemandPredicted && (
  <span className="text-xs text-amber-400">Busy soon</span>
)}
```

## File Summary

| File | Action | What |
|---|---|---|
| `src/hooks/useUpcomingDemandAlert.ts` | Create | Customer-facing forecast hook for upcoming demand and coverage |
| `src/components/eats/PeakDemandAlert.tsx` | Create | Dismissible proactive demand banner component |
| `src/pages/EatsRestaurants.tsx` | Update | Add demand alert banner and "Busy soon" badge on restaurant cards |
| `src/pages/EatsRestaurantMenu.tsx` | Update | Add demand alert and adjust displayed prep time with forecast multiplier |
| `src/hooks/useEatsDeliveryFactors.ts` | Update | Add forecasted demand and low coverage flags |

Two new files, three updates. No schema changes, no new edge functions.

