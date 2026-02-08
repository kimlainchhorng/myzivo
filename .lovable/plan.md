
# Update Surge and Weather Pricing Logic

## Overview
Update the surge pricing tiers and weather multipliers to match your new specifications.

---

## Changes Summary

### 1. New Surge Pricing Tiers

| Demand Ratio | Current Multiplier | New Multiplier |
|--------------|-------------------|----------------|
| < 1.0        | 1.0x              | 1.0x           |
| 1.0 – 1.5    | 1.12x             | 1.1x           |
| 1.5 – 2.0    | 1.25x             | 1.25x          |
| 2.0 – 3.0    | 1.35x (capped)    | 1.5x           |
| > 3.0        | 1.35x (capped)    | 2.0x           |
| No drivers   | 1.35x             | 2.0x           |

### 2. Weather Multipliers

| Condition   | Current | New   |
|-------------|---------|-------|
| Clear       | 1.0x    | 1.0x  |
| Rain        | 1.1x    | 1.1x  |
| Heavy Rain  | 1.2x    | 1.2x  |
| Snow        | 1.25x   | 1.3x  |

---

## Files to Update

### File 1: `src/lib/surge.ts`
Update the `calculateSurge` function with new tiers:

```text
if demand_ratio < 1     → 1.0x (Low)
if demand_ratio 1–1.5   → 1.1x (Medium)
if demand_ratio 1.5–2   → 1.25x (Medium)
if demand_ratio 2–3     → 1.5x (High)
if demand_ratio > 3     → 2.0x (High)
if no drivers           → 2.0x (High)
```

### File 2: `src/lib/quoteRidePrice.ts`
Update `getSurgeMultiplier` function with matching logic:

```text
if drivers <= 0         → 2.0x
if ratio > 3            → 2.0x
if ratio >= 2           → 1.5x
if ratio >= 1.5         → 1.25x
if ratio >= 1           → 1.1x
else                    → 1.0x
```

Also update `getWeatherMultiplier` to fetch from the `weather_multipliers` database table instead of returning 1.0.

### File 3: `src/hooks/useZoneSurgePricing.ts`
Update comment documentation to reflect new tiers.

### File 4: `src/hooks/useSurgePricing.ts`
Update comment documentation to reflect new tiers.

### Database Update
Update the snow multiplier in `weather_multipliers` table:
```sql
UPDATE weather_multipliers 
SET multiplier = 1.30 
WHERE weather_key = 'snow';
```

---

## Technical Details

### Weather Integration
The `getWeatherMultiplier` function will be updated to:
1. Query the `weather_multipliers` table for the matching `weather_key`
2. Support zone-specific overrides (if `zone_id` is set)
3. Fallback to global multipliers (where `zone_id` is null)

### Surge Formula
```
demand_ratio = ride_requests_last_5min / available_drivers
price = base_price × surge_multiplier
```

### Cap Removal
The 1.35x cap is being removed to allow the full 2.0x multiplier during extreme demand.

---

## Testing Checklist
- Verify surge displays correctly at each ratio tier
- Confirm weather multipliers apply when fetched
- Check final price reflects both surge and weather multipliers
