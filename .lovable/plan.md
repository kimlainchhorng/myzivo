

# Use USA Pricing Zone Automatically - Status & Enhancement

## Current State

The zone-based pricing system is **already implemented and functional**:

| Component | Status | Details |
|-----------|--------|---------|
| `usePricingZone` hook | ✅ Complete | Finds zone by pickup lat/lng, prefers smallest bounding box |
| `useZonePricingRates` hook | ✅ Complete | Fetches rates with 4-level fallback chain |
| `quoteRidePrice` function | ✅ Complete | Applies formula with all multipliers |
| Database zones | ✅ Seeded | USA Default Pricing, Baton Rouge, New Orleans zones exist |
| Database rates | ⚠️ Partial | "USA Default Pricing" has all ride types; city zones only have "standard" |

## Current Pricing Flow

```text
1. User selects pickup → pickupCoords = { lat: 30.45, lng: -91.18 }
2. usePricingZone(lat, lng) → Finds "Baton Rouge" zone (smallest match)
3. useZonePricingRates(zoneId, "standard") → Fetches base rates
4. quoteRidePrice(rates, distance, duration, rideType, options)
   → Applies: rateMultiplier × rideTypeMultiplier × surge × zone × longTrip
5. Final price displayed on ride cards
```

## Identified Improvements

### 1. Use Ride-Type-Specific Rates (Recommended)

Currently, the code fetches "standard" rates and applies ride type multipliers. The database already has ride-type-specific rates for "USA Default Pricing" zone.

**Change**: Pass the selected ride type to `useZonePricingRates` instead of hardcoding "standard".

**File**: `src/pages/Rides.tsx` (line 316)
```text
// Current (uses standard for all)
useZonePricingRates(pricingZone?.id, "standard")

// Improved (uses ride-type-specific rates)
useZonePricingRates(pricingZone?.id, selectedOption?.id ?? "standard")
```

### 2. Simplify Multiplier Logic

When using ride-type-specific rates, the `rideTypeMultiplier` from `RIDE_TYPE_MULTIPLIERS` becomes redundant - the multiplier is already baked into the zone rate.

**File**: `src/lib/pricing.ts`
- If zone rate has `multiplier`, use that instead of `RIDE_TYPE_MULTIPLIERS[rideType]`
- Keep `RIDE_TYPE_MULTIPLIERS` as fallback when using generic "standard" rates

### 3. Clean Up Duplicate Zones

The database has duplicate zones (two "Baton Rouge", two "Default US", two "New Orleans"). Only one of each has rates attached.

**Action**: Remove duplicate zones without rates via SQL migration.

## Pricing Formula (Already Implemented)

```text
miles = distanceMeters / 1609.344
minutes = durationSeconds / 60
subtotal = base_fare + miles*per_mile + minutes*per_minute + booking_fee
subtotal = max(subtotal, minimum_fare)
finalPrice = subtotal * multiplier * surge * zone * longTrip
(rounded to 2 decimals)
```

## Changes Required

### File 1: `src/pages/Rides.tsx`
- Change line 316 to use selected ride type instead of hardcoded "standard"
- Update `getQuoteForOption` to use the rate's multiplier when available

### File 2: `src/lib/pricing.ts`
- Adjust `quoteRidePrice` to skip `RIDE_TYPE_MULTIPLIERS` when `rateMultiplier` is provided and already reflects ride-type-specific pricing

### Database Cleanup (Optional)
- Remove zones without rates: `cb63653f-...`, `2794c17f-...`, `4facda97-...`
- Or add rates to those zones for consistency

## Technical Details

### Zone Selection Priority
When multiple zones match a coordinate:
1. Filter all zones containing the point
2. Sort by bounding box area (ascending)
3. Return smallest (most specific) zone

### Rate Lookup Fallback Chain
1. Exact match: zone_id + ride_type
2. Zone fallback: zone_id + "standard"
3. Default zone + ride_type: `00000000-0000-0000-0000-000000000001` + ride_type
4. Final fallback: `00000000-0000-0000-0000-000000000001` + "standard"

### Ride Cards Display
Each card shows `finalPrice` only - no breakdown visible to users unless they open the debug panel (`localStorage.setItem('zivo_debug_pricing', 'true')`).

