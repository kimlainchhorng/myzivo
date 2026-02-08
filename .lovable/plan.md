

# Fix Pricing Accuracy + Add Breakdown Debug

## Summary
This update consolidates all ride pricing logic into a single source of truth function (`quoteRidePrice`) to prevent double-multiplier issues, adds long-trip discounts, implements Uber-like sane multipliers, includes sanity checks for bad route data, and adds a developer debug panel to verify pricing calculations.

---

## Current Issues Identified

| Issue | Location | Problem |
|-------|----------|---------|
| Multipliers duplicated | `rideCategories` in Rides.tsx + `city_pricing` table | Ride type multiplier applied in UI AND in city pricing |
| Inconsistent multipliers | Various places | `wait_save: 0.75` vs Uber-like `0.92` |
| No long-trip discount | Pricing functions | Long trips aren't discounted |
| No sanity checks | Pricing functions | Extreme values not validated |
| Price calculated multiple times | `getFareForOption()` + `currentBreakdown` | Different code paths can yield different results |
| No debug visibility | UI | Hard to verify pricing is correct |

---

## Architecture

```text
┌────────────────────────────────────────────────────────────────────┐
│                    UNIFIED PRICING FLOW                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Route Data (from maps-route edge function)                        │
│  ├── distance_miles (meters / 1609.344)  ← Already correct         │
│  └── duration_minutes (seconds / 60)     ← Already correct         │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ quoteRidePrice() - SINGLE SOURCE OF TRUTH                  │    │
│  │                                                            │    │
│  │ Inputs:                                                    │    │
│  │  - distance_miles, duration_minutes                        │    │
│  │  - rideType (wait_save, standard, premium, etc.)           │    │
│  │  - cityPricing or fallback settings                        │    │
│  │  - surgeMultiplier, zoneMultiplier                         │    │
│  │                                                            │    │
│  │ Steps:                                                     │    │
│  │  1. Sanity check: if miles > 300 or mins > 600 → error     │    │
│  │  2. subtotal = base + (miles * perMile) + (mins * perMin)  │    │
│  │  3. Apply rideTypeMultiplier                               │    │
│  │  4. Apply zoneMultiplier                                   │    │
│  │  5. Apply surgeMultiplier                                  │    │
│  │  6. Apply longTripMultiplier:                              │    │
│  │     - > 25 miles: 0.92                                     │    │
│  │     - > 50 miles: 0.88                                     │    │
│  │  7. Enforce minimum fare                                   │    │
│  │  8. Add booking fee                                        │    │
│  │  9. Return breakdown object                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│         │                                                          │
│         ▼                                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ UI Components                                              │    │
│  │ - Display returned finalPrice directly                     │    │
│  │ - NO extra math in rendering                               │    │
│  └────────────────────────────────────────────────────────────┘    │
│         │                                                          │
│         ▼                                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Debug Panel (behind localStorage toggle)                   │    │
│  │ Shows: miles, minutes, subtotal, all multipliers, final    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Sane Ride Type Multipliers (Uber-like)

| Ride Type | Current | New (Uber-like) |
|-----------|---------|-----------------|
| wait_save | 0.75 | 0.92 |
| standard | 1.00 | 1.00 |
| green | 1.02 | 1.02 |
| priority | 1.30 | 1.12 |
| pet | 1.15 | 1.15 |
| comfort | 1.55 | 1.45 |
| black | 2.65 | 1.65 |
| black_suv | 3.50 | 2.10 |
| xxl | 3.70 | 2.10 |
| lux | 10.00 | 3.50 |
| sprinter | 7.30 | 2.50 |
| secure | 20.00 | 4.00 |

---

## Long-Trip Discount Logic

```typescript
function getLongTripMultiplier(distanceMiles: number): number {
  if (distanceMiles > 50) return 0.88;  // 12% discount
  if (distanceMiles > 25) return 0.92;  // 8% discount
  return 1.0;
}
```

---

## Implementation Steps

### 1. Update `src/lib/pricing.ts`

**Add new exports:**

```typescript
// Sane ride type multipliers (Uber-like behavior)
export const RIDE_TYPE_MULTIPLIERS: Record<string, number> = {
  wait_save: 0.92,
  standard: 1.00,
  green: 1.02,
  priority: 1.12,
  pet: 1.15,
  comfort: 1.45,
  xl: 1.45,
  black: 1.65,
  black_suv: 2.10,
  xxl: 2.10,
  premium: 1.65,
  elite: 2.10,
  lux: 3.50,
  sprinter: 2.50,
  secure: 4.00,
};

// Sanity check limits
export const ROUTE_LIMITS = {
  MAX_DISTANCE_MILES: 300,
  MAX_DURATION_MINUTES: 600,
};

// Long-trip discount
export function getLongTripMultiplier(distanceMiles: number): number {
  if (distanceMiles > 50) return 0.88;
  if (distanceMiles > 25) return 0.92;
  return 1.0;
}

// Price quote result with debug info
export interface RidePriceQuote {
  // Core breakdown
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  total: number;
  
  // Multipliers applied
  rideTypeMultiplier: number;
  zoneMultiplier: number;
  surgeMultiplier: number;
  longTripMultiplier: number;
  
  // Metadata
  minimumApplied: boolean;
  estimatedMin: number;
  estimatedMax: number;
  city?: string;
  
  // Debug info
  debug: {
    distanceMiles: number;
    durationMinutes: number;
    rideType: string;
  };
}

// Validation result
export interface RouteValidation {
  valid: boolean;
  error?: string;
}

export function validateRouteData(
  distanceMiles: number,
  durationMinutes: number
): RouteValidation {
  if (distanceMiles > ROUTE_LIMITS.MAX_DISTANCE_MILES) {
    return { valid: false, error: `Bad route data: distance ${distanceMiles} miles exceeds maximum` };
  }
  if (durationMinutes > ROUTE_LIMITS.MAX_DURATION_MINUTES) {
    return { valid: false, error: `Bad route data: duration ${durationMinutes} min exceeds maximum` };
  }
  if (distanceMiles < 0 || durationMinutes < 0) {
    return { valid: false, error: "Bad route data: negative values" };
  }
  return { valid: true };
}

/**
 * SINGLE SOURCE OF TRUTH for ride pricing
 * All UI and server-side code should use this function
 */
export function quoteRidePrice(
  settings: { base_fare: number; per_mile: number; per_minute: number; booking_fee: number; minimum_fare: number },
  distanceMiles: number,
  durationMinutes: number,
  rideType: string,
  options?: {
    surgeMultiplier?: number;
    zoneMultiplier?: number;
    city?: string;
  }
): RidePriceQuote {
  const surgeMultiplier = options?.surgeMultiplier ?? 1.0;
  const zoneMultiplier = options?.zoneMultiplier ?? 1.0;
  const rideTypeMultiplier = RIDE_TYPE_MULTIPLIERS[rideType] ?? 1.0;
  const longTripMultiplier = getLongTripMultiplier(distanceMiles);
  
  // 1. Calculate base components
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile;
  const timeFee = durationMinutes * settings.per_minute;
  const bookingFee = settings.booking_fee;
  
  // 2. Calculate subtotal
  let subtotal = baseFare + distanceFee + timeFee;
  
  // 3. Apply all multipliers
  subtotal *= rideTypeMultiplier;
  subtotal *= zoneMultiplier;
  subtotal *= surgeMultiplier;
  subtotal *= longTripMultiplier;
  
  // 4. Enforce minimum fare
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  // 5. Add booking fee
  const total = round(subtotal + bookingFee);
  
  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    total,
    rideTypeMultiplier,
    zoneMultiplier,
    surgeMultiplier,
    longTripMultiplier,
    minimumApplied,
    estimatedMin: Math.floor(total * 0.9),
    estimatedMax: Math.ceil(total * 1.1),
    city: options?.city,
    debug: {
      distanceMiles: round(distanceMiles),
      durationMinutes: Math.round(durationMinutes),
      rideType,
    },
  };
}
```

### 2. Update `src/pages/Rides.tsx`

**Remove multipliers from `rideCategories`** - multipliers are now in `RIDE_TYPE_MULTIPLIERS`:

```typescript
// Remove multiplier property from each ride option
// multiplier is now looked up from RIDE_TYPE_MULTIPLIERS[option.id]
```

**Replace pricing logic:**

```typescript
import { 
  quoteRidePrice, 
  validateRouteData, 
  RIDE_TYPE_MULTIPLIERS,
  type RidePriceQuote 
} from "@/lib/pricing";

// Add debug toggle state
const [showDebugPanel, setShowDebugPanel] = useState(() => {
  return localStorage.getItem('zivo_debug_pricing') === 'true';
});

// Validate route data
const routeValidation = useMemo(() => {
  return validateRouteData(estimatedDistance, estimatedDuration);
}, [estimatedDistance, estimatedDuration]);

// Single price quote function - used everywhere
const getQuoteForOption = useCallback((option: RideOption): RidePriceQuote | null => {
  if (!routeValidation.valid) return null;
  
  // Use city pricing if available, otherwise global
  const settings = cityPricing 
    ? {
        base_fare: cityPricing.base_fare,
        per_mile: cityPricing.per_mile,
        per_minute: cityPricing.per_minute,
        booking_fee: cityPricing.booking_fee,
        minimum_fare: cityPricing.minimum_fare,
      }
    : {
        base_fare: pricing.base_fare,
        per_mile: pricing.per_mile_rate,
        per_minute: pricing.per_minute_rate,
        booking_fee: pricing.booking_fee,
        minimum_fare: pricing.minimum_fare,
      };
  
  return quoteRidePrice(
    settings,
    estimatedDistance,
    estimatedDuration,
    option.id,
    {
      surgeMultiplier: 1.0, // TODO: integrate with useSurgePricing
      zoneMultiplier: 1.0,
      city: cityPricing?.city,
    }
  );
}, [cityPricing, pricing, estimatedDistance, estimatedDuration, routeValidation]);

// Display price - just format the quote's total
const getFareDisplay = (option: RideOption): string => {
  const quote = getQuoteForOption(option);
  if (!quote) return "--";
  return formatCurrency(quote.total);
};
```

**Add error display for bad routes:**

```typescript
{!routeValidation.valid && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
    <strong>Error:</strong> {routeValidation.error}
  </div>
)}
```

### 3. Add Debug Panel Component

New file: `src/components/ride/PricingDebugPanel.tsx`

```typescript
/**
 * Debug panel for verifying pricing calculations
 * Only visible when localStorage.zivo_debug_pricing = 'true'
 */
export function PricingDebugPanel({ quote }: { quote: RidePriceQuote | null }) {
  if (!quote) return null;
  
  return (
    <div className="fixed bottom-20 left-4 z-50 bg-black/90 text-green-400 font-mono text-xs p-3 rounded-lg max-w-xs">
      <div className="font-bold text-yellow-400 mb-2">🔧 Pricing Debug</div>
      <div>Miles: {quote.debug.distanceMiles}</div>
      <div>Minutes: {quote.debug.durationMinutes}</div>
      <div>Ride: {quote.debug.rideType}</div>
      <div className="border-t border-green-800 my-1 pt-1">
        <div>Subtotal: ${quote.subtotal}</div>
        <div>× rideType: {quote.rideTypeMultiplier}</div>
        <div>× zone: {quote.zoneMultiplier}</div>
        <div>× surge: {quote.surgeMultiplier}</div>
        <div>× longTrip: {quote.longTripMultiplier}</div>
        {quote.minimumApplied && <div className="text-yellow-400">⚠ Min fare applied</div>}
      </div>
      <div className="border-t border-green-800 mt-1 pt-1 font-bold text-white">
        Final: ${quote.total}
      </div>
    </div>
  );
}
```

### 4. Update Edge Function

Modify `supabase/functions/create-ride-payment-intent/index.ts`:

- Add the same `RIDE_TYPE_MULTIPLIERS` and `getLongTripMultiplier`
- Add sanity checks before calculation
- Use the same formula as client-side

```typescript
// Add at top
const RIDE_TYPE_MULTIPLIERS: Record<string, number> = {
  wait_save: 0.92,
  standard: 1.00,
  green: 1.02,
  priority: 1.12,
  // ... etc
};

const ROUTE_LIMITS = {
  MAX_DISTANCE_MILES: 300,
  MAX_DURATION_MINUTES: 600,
};

function getLongTripMultiplier(distanceMiles: number): number {
  if (distanceMiles > 50) return 0.88;
  if (distanceMiles > 25) return 0.92;
  return 1.0;
}

// In handler, add validation
if (distance_miles > ROUTE_LIMITS.MAX_DISTANCE_MILES || 
    duration_minutes > ROUTE_LIMITS.MAX_DURATION_MINUTES) {
  throw new Error("Invalid route data: values exceed limits");
}

// Update calculate functions to apply long-trip multiplier
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/pricing.ts` | Add `quoteRidePrice()`, `RIDE_TYPE_MULTIPLIERS`, `getLongTripMultiplier()`, `validateRouteData()` |
| `src/pages/Rides.tsx` | Remove hardcoded multipliers from categories, use `quoteRidePrice()` everywhere, add debug panel |
| `src/components/ride/PricingDebugPanel.tsx` | **NEW** - Debug overlay component |
| `supabase/functions/create-ride-payment-intent/index.ts` | Add same multipliers, long-trip discount, sanity checks |

---

## Debug Panel Usage

To enable the debug panel:
1. Open browser console
2. Run: `localStorage.setItem('zivo_debug_pricing', 'true')`
3. Refresh page
4. Debug panel appears in bottom-left corner

To disable:
```javascript
localStorage.removeItem('zivo_debug_pricing')
```

---

## Price Display Example

```text
Route: 30 miles, 45 minutes
Ride Type: black (multiplier: 1.65)
Long-trip: 0.92 (8% discount for > 25 miles)

Calculation:
  base_fare     = $3.50
  distance_fee  = 30 × $1.75 = $52.50
  time_fee      = 45 × $0.35 = $15.75
  ────────────────────────────────
  subtotal      = $71.75
  × rideType    = × 1.65 = $118.39
  × longTrip    = × 0.92 = $108.92
  + booking_fee = + $2.50
  ════════════════════════════════
  TOTAL         = $111.42
```

---

## Verification Checklist

After implementation, verify:
1. Route edge function returns distance in miles, duration in minutes (already correct)
2. `quoteRidePrice()` is called exactly once per price display
3. UI cards show the returned `total` with no additional math
4. Long-trip discounts apply correctly for 25+ and 50+ mile trips
5. Sanity checks trigger error UI for extreme route values
6. Debug panel shows all multipliers correctly
7. Edge function uses identical logic to client

