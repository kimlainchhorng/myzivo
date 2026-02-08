

# Automatic Pricing by Pickup Location (Geo-Zone Lookup)

## Overview
Replace the current city-name-based pricing with a precise geo-coordinate lookup using the `pricing_zones` and `zone_pricing_rates` tables. When a rider selects a pickup location, the system will use the pickup's latitude/longitude to find the matching pricing zone and apply zone-specific rates.

## Current vs New Approach

| Current | New |
|---------|-----|
| Parse city name from pickup address text | Use pickup coordinates (lat/lng) |
| Query `city_pricing` by city name string | Query `pricing_zones` by bounding box |
| Fallback to global `pricing_settings` | Fallback to "Default US" zone |

## Changes Required

### 1. New Hook: `usePricingZone`
**File:** `src/hooks/usePricingZone.ts` (new)

Create a hook that:
- Takes pickup coordinates (lat, lng) as input
- Queries `pricing_zones` where:
  - `is_active = true`
  - `pickupLat BETWEEN min_lat AND max_lat`
  - `pickupLng BETWEEN min_lng AND max_lng`
- If multiple zones match, select the smallest box (most specific/local zone)
- If no match, return "Default US" zone
- Returns the zone ID and zone metadata

### 2. New Hook: `useZonePricingRates`
**File:** `src/hooks/useZonePricingRates.ts` (new)

Create a hook that:
- Takes zone ID and ride type as input
- Queries `zone_pricing_rates` where:
  - `zone_id` matches the selected zone
  - `ride_type` matches the selected ride type
- Returns the rates: `base_fare`, `per_mile`, `per_minute`, `booking_fee`, `minimum_fare`, `multiplier`
- Falls back to default rates if no match

### 3. Utility Function: `findPricingZone`
**File:** `src/lib/pricing.ts` (add to existing)

```text
function findPricingZone(zones, pickupLat, pickupLng):
  matches = zones.filter(zone =>
    pickupLat >= zone.min_lat AND pickupLat <= zone.max_lat AND
    pickupLng >= zone.min_lng AND pickupLng <= zone.max_lng
  )
  
  if matches.length == 0:
    return defaultZone
  
  if matches.length == 1:
    return matches[0]
  
  // Multiple matches: prefer smallest bounding box
  return matches.sort((a, b) =>
    (a.max_lat - a.min_lat) * (a.max_lng - a.min_lng) -
    (b.max_lat - b.min_lat) * (b.max_lng - b.min_lng)
  )[0]
```

### 4. Update Pricing Formula
**File:** `src/lib/pricing.ts` (modify `quoteRidePrice`)

Update the formula to match the specification:

```text
miles = distanceMeters / 1609.344
minutes = durationSeconds / 60
subtotal = base_fare + (miles * per_mile) + (minutes * per_minute) + booking_fee
subtotal = max(subtotal, minimum_fare)
final = subtotal * multiplier * surgeMult * zoneMult * longTripMult
return round(final, 2)
```

The `multiplier` from `zone_pricing_rates` is the ride-type-specific multiplier for that zone.

### 5. Update Rides.tsx Integration
**File:** `src/pages/Rides.tsx`

Replace:
- Current `useCityPricing(pickupCity, "standard")` hook usage
- City extraction logic (`extractCityFromAddress`)

With:
- `usePricingZone(pickupCoords?.lat, pickupCoords?.lng)`
- `useZonePricingRates(zoneId, selectedOption?.id)`
- Pass zone rates directly to `quoteRidePrice()`

### 6. Update Edge Function (Server-Side)
**File:** `supabase/functions/create-ride-payment-intent/index.ts`

Mirror the client-side changes:
- Accept `pickup_lat` and `pickup_lng` in request
- Query `pricing_zones` by bounding box
- Query `zone_pricing_rates` for the matched zone + ride_type
- Use zone rates for fare calculation
- Fall back to Default US zone if no match

### 7. Seed Default Data
Ensure the database has:
- A "Default US" zone in `pricing_zones` with wide bounding box
- Default rates in `zone_pricing_rates` for common ride types

## Data Flow

```text
1. User selects pickup location
   ↓
2. pickupCoords = { lat: 30.4515, lng: -91.1871 }
   ↓
3. usePricingZone(30.4515, -91.1871)
   → Query: SELECT * FROM pricing_zones 
            WHERE is_active = true 
            AND 30.4515 BETWEEN min_lat AND max_lat
            AND -91.1871 BETWEEN min_lng AND max_lng
   → Result: Baton Rouge zone (id: "abc-123")
   ↓
4. useZonePricingRates("abc-123", "standard")
   → Query: SELECT * FROM zone_pricing_rates
            WHERE zone_id = "abc-123" AND ride_type = "standard"
   → Result: { base_fare: 3.00, per_mile: 1.50, ... }
   ↓
5. quoteRidePrice(zoneRates, distance, duration, rideType, options)
   → Final price displayed on ride cards
```

## UI Impact
- Ride cards display the final calculated price only (no extra math visible)
- Price breakdown modal shows zone-based rates
- No visible change to user experience, just more accurate zone-based pricing

## Files Modified
1. `src/hooks/usePricingZone.ts` - NEW
2. `src/hooks/useZonePricingRates.ts` - NEW
3. `src/lib/pricing.ts` - Add `findPricingZone()`, update types
4. `src/pages/Rides.tsx` - Replace city pricing with zone pricing hooks
5. `supabase/functions/create-ride-payment-intent/index.ts` - Update server-side pricing

## Database Requirements
The `pricing_zones` table must have at least one "Default US" fallback zone with a wide bounding box. The `zone_pricing_rates` table must have rates for each ride type for the default zone.

---

## Technical Details

### Zone Selection Logic (Smallest Box First)
When multiple zones match (e.g., a city zone inside a state zone), we calculate the area of each bounding box and select the smallest one. This ensures local/city pricing takes precedence over regional pricing.

### Fallback Chain
1. Try exact zone match by coordinates
2. If no match, use "Default US" zone
3. If Default US zone has no rates for ride type, use hardcoded defaults

### Caching Strategy
- Zone data cached for 5 minutes (zones don't change often)
- Rates cached for 5 minutes
- Coordinates trigger refetch when pickup location changes

