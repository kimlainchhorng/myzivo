

# Use Zone-Based Pricing (USA Default) + Fix Unit Conversions

## Summary

The pricing system already uses zone-based pricing, but there are issues with unit conversions and the current implementation has complexity that can be simplified. The request asks for a cleaner single function approach with proper unit handling.

## Current State Analysis

| Component | Status | Issue |
|-----------|--------|-------|
| Zone lookup | Working | Multiple duplicate zones exist in DB |
| Zone rates | Working | "USA Default Pricing" zone has all ride types |
| Unit conversion | Already correct | Edge function returns miles/minutes directly |
| Debug panel | Exists | Uses localStorage toggle, not URL param |
| Formula | Working | But formula includes unnecessary multipliers |

### Key Observations

1. **Unit conversion is already correct**: The `maps-route` edge function already converts meters to miles and seconds to minutes before returning data
2. **Route data format**: `routeData.distance` = miles, `routeData.duration` = minutes (already converted)
3. **Multiple pricing zones with duplicates**: Database has duplicate "Default US", "Baton Rouge", and "New Orleans" zones
4. **Zone selection working**: Code prefers smallest bounding box (most specific zone)
5. **Current formula is complex**: Uses multiple separate multipliers (rideType, zone, surge, longTrip, rate) when the zone rates already include ride-type-specific multipliers

## Proposed Changes

### 1. Simplify Pricing Formula
**File**: `src/lib/pricing.ts`

The current formula applies too many multipliers. Simplify to match the user's specification:

```text
Current (complex):
  final = subtotal × rateMultiplier × rideTypeMultiplier × surgeMultiplier × zoneMultiplier × longTripMultiplier

Simplified (per spec):
  subtotal = base_fare + (miles × per_mile) + (minutes × per_minute) + booking_fee
  subtotal = max(subtotal, minimum_fare)
  final = subtotal × multiplier
```

The `multiplier` from `zone_pricing_rates` already includes the ride-type adjustment, so we remove redundant `RIDE_TYPE_MULTIPLIERS`.

### 2. Create Simplified Quote Function
**File**: `src/lib/pricing.ts`

Add a new streamlined function `quoteZoneRidePrice()` that:
- Takes distance in meters (optional raw input) or miles
- Takes duration in seconds (optional raw input) or minutes
- Handles unit conversion internally if needed
- Uses zone rates directly
- Returns final price with minimal complexity

### 3. Add URL-Based Debug Toggle
**File**: `src/pages/Rides.tsx`

Add support for `?debug=1` URL parameter alongside existing localStorage toggle:
- Check `searchParams.get("debug") === "1"` OR localStorage
- Show debug panel with: miles, minutes, subtotal, multiplier, final

### 4. Update Debug Panel
**File**: `src/components/ride/PricingDebugPanel.tsx`

Simplify to show exactly what the user requested:
- miles
- minutes
- subtotal
- multiplier
- final

### 5. Ensure Zone Lookup Prefers "USA Default Pricing"
**File**: `src/hooks/usePricingZone.ts`

Currently the code prefers the smallest bounding box. If multiple US zones match, we should also consider the zone name as a tiebreaker, preferring "USA Default Pricing" as the fallback.

Actually, the current logic is correct - "USA Default Pricing" has the widest bounds, so more specific zones (cities) will be selected first. Only if no city matches will the default be used.

## File Changes

### File 1: `src/lib/pricing.ts`
- Add new `quoteZoneRidePrice(rideType, distanceMiles, durationMinutes, zoneRates)` function
- Simplified formula: `final = max(base + dist + time + booking, minimum) × multiplier`
- Remove unnecessary `rideTypeMultiplier` when zone rates provide it
- Keep existing functions for backwards compatibility

### File 2: `src/pages/Rides.tsx`
- Add URL param check for debug: `searchParams.get("debug") === "1"`
- Update `showDebugPanel` to check both localStorage AND URL param
- Update `getQuoteForOption` to use simplified pricing function
- Ensure all ride cards display only the final price from quote

### File 3: `src/components/ride/PricingDebugPanel.tsx`
- Add zone name display
- Add subtotal display (before multiplier)
- Show the single multiplier from zone rates
- Cleaner layout matching user's spec

### File 4: `src/hooks/useZonePricingRates.ts`
- No changes needed - already fetches ride-type-specific rates correctly

### File 5: `src/hooks/usePricingZone.ts`
- No changes needed - already prefers smallest bounding box

## Pricing Formula (Final)

```text
Input:
  distanceMeters → (if provided, convert) → miles = distanceMeters / 1609.344
  durationSeconds → (if provided, convert) → minutes = durationSeconds / 60

From zone_pricing_rates (for zone + ride_type):
  base_fare, per_mile, per_minute, booking_fee, minimum_fare, multiplier

Calculation:
  subtotal = base_fare + (miles × per_mile) + (minutes × per_minute) + booking_fee
  subtotal = max(subtotal, minimum_fare)
  final = round(subtotal × multiplier, 2)
```

## Debug Panel Display (with ?debug=1)

```text
┌─────────────────────────┐
│ 🔧 Pricing Debug        │
├─────────────────────────┤
│ Zone: USA Default Pricing│
│ Ride: standard          │
├─────────────────────────┤
│ Miles:     5.2          │
│ Minutes:   15           │
├─────────────────────────┤
│ Base:      $2.50        │
│ Distance:  $6.50        │
│ Time:      $3.30        │
│ Booking:   $1.50        │
├─────────────────────────┤
│ Subtotal:  $13.80       │
│ × Mult:    1.00         │
├─────────────────────────┤
│ Final:     $13.80       │
└─────────────────────────┘
```

## Database Cleanup (Recommended, Optional)

Remove duplicate zones without linked rates to simplify zone selection. Currently there are:
- 2× "Baton Rouge" zones (one with rates, one without)
- 2× "Default US" zones (one is the UUID-based fallback)
- 2× "New Orleans" zones (one with rates, one without)

This is not blocking but would simplify debugging.

## Testing Steps

1. Navigate to `/rides?debug=1`
2. Enter pickup location (should detect "USA Default Pricing" zone)
3. Enter destination
4. Verify debug panel shows: miles, minutes, subtotal, multiplier, final
5. Select different ride types and verify prices update with correct multipliers
6. Confirm ride card prices match debug panel final values

