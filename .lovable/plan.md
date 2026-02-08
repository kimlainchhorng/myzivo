
# Price by City and Ride Type

## Summary
Implement city-specific and ride-type-specific pricing by:
1. Detecting the city from the pickup address
2. Looking up pricing in the `city_pricing` table by city + ride_type
3. Calculating fare using city-specific rates
4. Falling back to global `pricing_settings` if no city match
5. Server-side validation in the edge function

---

## Current State

| Component | Status |
|-----------|--------|
| `city_pricing` table | Exists with columns: city, ride_type, base_fare, per_mile, per_minute, booking_fee, minimum_fare - **Currently empty** |
| `pricing_settings` table | Has global ride settings (used as fallback) |
| `useRidePricingSettings` | Fetches global settings only |
| Rides.tsx | Uses global pricing, no city detection |
| Edge function | Uses global `pricing_settings` only |

---

## Database Changes

### 1. Add `is_active` column to `city_pricing`
```sql
ALTER TABLE city_pricing 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

### 2. Seed initial city pricing data
```sql
INSERT INTO city_pricing (city, ride_type, base_fare, per_mile, per_minute, booking_fee, minimum_fare, is_active) VALUES
-- Baton Rouge (home market)
('Baton Rouge', 'standard', 3.00, 1.50, 0.30, 2.00, 6.00, true),
('Baton Rouge', 'comfort', 4.50, 2.25, 0.45, 2.50, 9.00, true),
('Baton Rouge', 'black', 8.00, 4.00, 0.80, 3.00, 15.00, true),
-- New Orleans (premium market)
('New Orleans', 'standard', 3.50, 1.75, 0.35, 2.50, 7.00, true),
('New Orleans', 'comfort', 5.00, 2.50, 0.50, 3.00, 10.00, true),
('New Orleans', 'black', 9.00, 4.50, 0.90, 3.50, 18.00, true),
-- Default fallback
('default', 'standard', 3.50, 1.75, 0.35, 2.50, 7.00, true);
```

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    CITY-BASED PRICING FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User selects pickup location                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────┐                                │
│  │ extractCityFromAddress()       │                                 │
│  │ Parse city from address string │                                 │
│  │ e.g. "123 Main St, Baton Rouge,│                                 │
│  │       LA 70801" → "Baton Rouge"│                                 │
│  └─────────────────────────────────┘                                │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────┐                                │
│  │ useCityPricing(city, rideType) │                                 │
│  │ Query: SELECT * FROM           │                                 │
│  │   city_pricing WHERE           │                                 │
│  │   city = ? AND ride_type = ?   │                                 │
│  └─────────────────────────────────┘                                │
│         │                                                           │
│    Found? ─────────No──────▶ Use global pricing_settings            │
│         │                                                           │
│        Yes                                                          │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────┐                    │
│  │ calculateCityRideFare()                     │                    │
│  │ fare = base_fare                            │                    │
│  │      + (distance * per_mile)                │                    │
│  │      + (duration * per_minute)              │                    │
│  │      + booking_fee                          │                    │
│  │ Apply minimum_fare, surge multiplier        │                    │
│  └─────────────────────────────────────────────┘                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────┐                    │
│  │ Edge Function: create-ride-payment-intent   │                    │
│  │ 1. Extract city from pickup_address         │                    │
│  │ 2. Query city_pricing for city + ride_type  │                    │
│  │ 3. Calculate fare server-side               │                    │
│  │ 4. Fall back to pricing_settings if needed  │                    │
│  └─────────────────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### 1. City Extraction Utility
New file: `src/lib/cityUtils.ts`

```typescript
/**
 * Extract city name from a formatted address
 * Handles formats like:
 * - "123 Main St, Baton Rouge, LA 70801"
 * - "875 Florida Blvd, Baton Rouge, LA"
 */
export function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  
  // Split by comma and look for city pattern
  const parts = address.split(',').map(p => p.trim());
  
  // Usually: [street, city, state+zip] or [place, street, city, state+zip]
  // City is typically the second-to-last segment before state
  if (parts.length >= 2) {
    // Check second-to-last part (before state/zip)
    const potentialCity = parts[parts.length - 2];
    // Remove any numbers (zip codes that may be attached)
    const cleaned = potentialCity.replace(/\d+/g, '').trim();
    if (cleaned && cleaned.length > 1) {
      return cleaned;
    }
  }
  
  return null;
}
```

### 2. City Pricing Hook
New file: `src/hooks/useCityPricing.ts`

```typescript
/**
 * Fetch city-specific pricing for a ride type
 * Falls back to global pricing_settings if no city match
 */
export function useCityPricing(
  city: string | null,
  rideType: string
) {
  return useQuery({
    queryKey: ["city-pricing", city, rideType],
    queryFn: async () => {
      if (!city) return null;
      
      // Query city_pricing table
      const { data } = await supabase
        .from("city_pricing")
        .select("*")
        .eq("city", city)
        .eq("ride_type", rideType)
        .eq("is_active", true)
        .single();
      
      return data;
    },
    enabled: !!city && !!rideType,
  });
}
```

### 3. Update `src/lib/pricing.ts`
Add city-specific calculation function:

```typescript
export interface CityPricing {
  city: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
}

export function calculateCityRideFare(
  cityPricing: CityPricing,
  distanceMiles: number,
  durationMinutes: number,
  surgeMultiplier: number = 1.0
): UnifiedRidePriceBreakdown {
  const baseFare = cityPricing.base_fare;
  const distanceFee = distanceMiles * cityPricing.per_mile;
  const timeFee = durationMinutes * cityPricing.per_minute;
  const bookingFee = cityPricing.booking_fee;
  
  let subtotal = baseFare + distanceFee + timeFee;
  subtotal *= surgeMultiplier;
  
  const minimumApplied = subtotal < cityPricing.minimum_fare;
  if (minimumApplied) {
    subtotal = cityPricing.minimum_fare;
  }
  
  const total = subtotal + bookingFee;
  
  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    rideTypeMultiplier: 1.0, // Already baked into city pricing
    surgeMultiplier,
    minimumApplied,
    total: round(total),
    estimatedMin: Math.floor(total * 0.9),
    estimatedMax: Math.ceil(total * 1.1),
  };
}
```

### 4. Update `src/pages/Rides.tsx`

```typescript
// Add city extraction state
const [pickupCity, setPickupCity] = useState<string | null>(null);

// Extract city when pickup changes
useEffect(() => {
  if (pickup) {
    const city = extractCityFromAddress(pickup);
    setPickupCity(city);
  }
}, [pickup]);

// Use city pricing hook
const { data: cityPricing } = useCityPricing(
  pickupCity,
  selectedOption?.id || "standard"
);

// Calculate fare using city pricing if available
const currentBreakdown = useMemo(() => {
  if (!selectedOption) return null;
  
  if (cityPricing) {
    // Use city-specific pricing
    return calculateCityRideFare(
      cityPricing,
      estimatedDistance,
      estimatedDuration,
      1.0 // surge
    );
  }
  
  // Fall back to global pricing
  return calculateUnifiedRideFare(
    pricing,
    estimatedDistance,
    estimatedDuration,
    selectedOption.multiplier || 1.0,
    1.0
  );
}, [cityPricing, pricing, selectedOption, estimatedDistance, estimatedDuration]);
```

### 5. Update Edge Function
Modify `supabase/functions/create-ride-payment-intent/index.ts`:

```typescript
// Add city extraction function
function extractCityFromAddress(address: string): string | null {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const potentialCity = parts[parts.length - 2];
    return potentialCity.replace(/\d+/g, '').trim() || null;
  }
  return null;
}

// In the handler:
const pickupCity = extractCityFromAddress(pickup_address);

// Try city_pricing first
const { data: cityPricing } = await supabase
  .from("city_pricing")
  .select("*")
  .eq("city", pickupCity || "")
  .eq("ride_type", ride_type)
  .eq("is_active", true)
  .single();

let breakdown: PriceBreakdown;

if (cityPricing) {
  // Use city-specific rates
  breakdown = calculateCityFare(cityPricing, distance_miles, duration_minutes, surge_multiplier);
} else {
  // Fall back to global pricing_settings
  breakdown = calculateServerFare(pricingSettings, distance_miles, duration_minutes, ride_type_multiplier, surge_multiplier);
}
```

---

## Price Calculation Flow

```text
User selects:
  Pickup: "875 Florida Blvd, Baton Rouge, LA"
  Ride Type: "comfort"
  Distance: 10 miles
  Duration: 20 minutes

1. Extract city: "Baton Rouge"

2. Query city_pricing:
   SELECT * FROM city_pricing 
   WHERE city = 'Baton Rouge' AND ride_type = 'comfort'
   
   Result: base_fare=4.50, per_mile=2.25, per_minute=0.45, 
           booking_fee=2.50, minimum_fare=9.00

3. Calculate:
   base_fare    = $4.50
   distance_fee = 10 * $2.25 = $22.50
   time_fee     = 20 * $0.45 = $9.00
   ─────────────────────────────────
   subtotal     = $36.00 (no minimum needed)
   booking_fee  = $2.50
   ─────────────────────────────────
   TOTAL        = $38.50

4. If no city match, fall back to global pricing with multiplier
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/cityUtils.ts` | **NEW** - City extraction utility |
| `src/hooks/useCityPricing.ts` | **NEW** - Hook to fetch city-specific pricing |
| `src/lib/pricing.ts` | Add `CityPricing` interface and `calculateCityRideFare` function |
| `src/pages/Rides.tsx` | Integrate city detection and city pricing |
| `supabase/functions/create-ride-payment-intent/index.ts` | Server-side city pricing lookup |
| Database migration | Add `is_active` column and seed data |

---

## Fallback Strategy

```text
Priority order:
1. city_pricing (city + ride_type match) → Use city-specific rates
2. city_pricing (city + 'default' ride_type) → City default
3. city_pricing ('default' + ride_type) → Global default by type
4. pricing_settings → Global settings with multiplier

This ensures pricing always works, even for new cities.
```

---

## UI Display

The existing `RidePriceBreakdown` component will display:
- Base fare (city-specific)
- Distance fee (city-specific per_mile rate)
- Time fee (city-specific per_minute rate)
- Booking fee
- Total

No UI changes needed - just different underlying values.
