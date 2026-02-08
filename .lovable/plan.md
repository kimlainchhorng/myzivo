

# Unified Ride Price Calculation

## Summary
Create a centralized ride pricing system that:
1. Fetches pricing settings from `pricing_settings` table (service_type = 'rides')
2. Calculates fare using the formula: base_fare + (distance × per_mile) + (duration × per_minute) + booking_fee
3. Enforces minimum fare
4. Applies surge multiplier when active
5. Calculates commission/driver earnings and saves to ride_requests
6. Displays a detailed price breakdown to the rider

---

## Current State

| Component | Location | Status |
|-----------|----------|--------|
| `pricing_settings` table | Database | Has rides settings (base_fare: $3.50, per_mile: $1.75, per_minute: $0.35, booking_fee: $2.50, minimum_fare: $7.00) |
| `commission_settings` table | Database | Has per-vehicle-type commission (25% for all ride types) |
| `ride_requests` table | Database | Missing `commission_amount`, `driver_earning` columns |
| `calculateFare` function | `src/pages/Rides.tsx` line 86 | Hardcoded values, no DB fetch |
| Edge function | `create-ride-payment-intent` | Uses passed `estimated_fare`, doesn't calculate server-side |
| `RidePriceBreakdown` component | Exists but not used | Ready for integration |

---

## Database Changes

Add new columns to `ride_requests` table:

```sql
ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2);
ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS driver_earning NUMERIC(10,2);
ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS ride_type_multiplier NUMERIC(4,2);
```

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         PRICING FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User selects ride type                                          │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────┐                                            │
│  │ useRidePricing hook │ ← Fetches pricing_settings (service=rides) │
│  └─────────────────────┘                                            │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────┐                    │
│  │ calculateUnifiedRideFare()                  │                    │
│  │ - base_fare + (miles × per_mile)            │                    │
│  │ - + (minutes × per_minute)                  │                    │
│  │ - + booking_fee                             │                    │
│  │ - × ride_type_multiplier                    │                    │
│  │ - × surge_multiplier                        │                    │
│  │ - enforce minimum_fare                       │                    │
│  └─────────────────────────────────────────────┘                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────┐                    │
│  │ RidePriceBreakdownCard (UI Component)       │                    │
│  │ - Shows: Base, Distance, Time, Booking fee  │                    │
│  │ - Surge indicator if active                 │                    │
│  │ - Total with estimate range                 │                    │
│  └─────────────────────────────────────────────┘                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────┐                    │
│  │ Edge Function: create-ride-payment-intent   │                    │
│  │ - Re-calculates server-side                 │                    │
│  │ - Fetches commission from commission_settings│                    │
│  │ - Saves: price_total, commission_amount,    │                    │
│  │          driver_earning to ride_requests    │                    │
│  └─────────────────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### 1. Database Migration
Add commission/earning columns to `ride_requests`:

```sql
ALTER TABLE ride_requests 
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS driver_earning NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS ride_type_multiplier NUMERIC(4,2);

COMMENT ON COLUMN ride_requests.commission_amount IS 'Platform commission = price_total * commission_percent';
COMMENT ON COLUMN ride_requests.driver_earning IS 'Driver payout = price_total - commission_amount';
```

### 2. Create `useRidePricingSettings` Hook
New file: `src/hooks/useRidePricingSettings.ts`

```typescript
// Fetches pricing_settings where service_type = 'rides'
// Returns: { base_fare, per_mile_rate, per_minute_rate, minimum_fare, booking_fee, multipliers }
// Cached with TanStack Query (5 min stale time)
```

### 3. Update `src/lib/pricing.ts`
Add new unified calculation function:

```typescript
export interface UnifiedRidePriceBreakdown {
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  rideTypeMultiplier: number;
  surgeMultiplier: number;
  minimumApplied: boolean;
  total: number;
  estimatedMin: number;
  estimatedMax: number;
  // Commission fields (calculated server-side only)
  commissionPercent?: number;
  commissionAmount?: number;
  driverEarning?: number;
}

export function calculateUnifiedRideFare(
  settings: RidePricingSettings,
  distanceMiles: number,
  durationMinutes: number,
  rideTypeMultiplier: number,
  surgeMultiplier: number = 1.0
): UnifiedRidePriceBreakdown {
  // 1. Calculate base components
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile_rate;
  const timeFee = durationMinutes * settings.per_minute_rate;
  const bookingFee = settings.booking_fee;
  
  // 2. Calculate subtotal before multipliers
  let subtotal = baseFare + distanceFee + timeFee;
  
  // 3. Apply multipliers
  subtotal *= rideTypeMultiplier;
  subtotal *= surgeMultiplier;
  
  // 4. Enforce minimum fare
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  // 5. Add booking fee to get total
  const total = subtotal + bookingFee;
  
  return {
    baseFare,
    distanceFee,
    timeFee,
    bookingFee,
    subtotal,
    rideTypeMultiplier,
    surgeMultiplier,
    minimumApplied,
    total: round(total),
    estimatedMin: Math.floor(total * 0.9),
    estimatedMax: Math.ceil(total * 1.1),
  };
}
```

### 4. Update `src/pages/Rides.tsx`

Replace hardcoded `calculateFare` function with:
- Import and use `useRidePricingSettings` hook
- Use `calculateUnifiedRideFare` for price calculation
- Pass breakdown to UI component

```typescript
// Replace line 86-92:
const calculateFare = (distanceMiles: number, durationMinutes: number, multiplier: number) => {
  const baseFare = 2.00;
  // ...hardcoded
};

// With:
const { data: pricingSettings } = useRidePricingSettings();
const breakdown = calculateUnifiedRideFare(
  pricingSettings,
  estimatedDistance,
  estimatedDuration,
  selectedOption?.multiplier || 1.0,
  surgeMultiplier
);
```

### 5. Update Edge Function
Modify `supabase/functions/create-ride-payment-intent/index.ts`:

```typescript
// 1. Fetch pricing_settings from DB
const { data: settings } = await supabase
  .from('pricing_settings')
  .select('setting_key, setting_value')
  .eq('service_type', 'rides');

// 2. Calculate fare server-side (source of truth)
const breakdown = calculateServerRideFare(settings, distance, duration, multiplier, surge);

// 3. Fetch commission rate from commission_settings
const { data: commission } = await supabase
  .from('commission_settings')
  .select('commission_percentage')
  .eq('service_type', 'rides')
  .eq('vehicle_type', vehicleType)
  .single();

const commissionPercent = commission?.commission_percentage || 15;
const commissionAmount = breakdown.total * (commissionPercent / 100);
const driverEarning = breakdown.total - commissionAmount;

// 4. Save to ride_requests with all breakdown fields
await supabase.from('ride_requests').insert({
  // ... existing fields
  quoted_base_fare: breakdown.baseFare,
  quoted_distance_fee: breakdown.distanceFee,
  quoted_time_fee: breakdown.timeFee,
  quoted_booking_fee: breakdown.bookingFee,
  quoted_surge_multiplier: breakdown.surgeMultiplier,
  quoted_total: breakdown.total,
  ride_type_multiplier: breakdown.rideTypeMultiplier,
  payment_amount: breakdown.total,
  commission_amount: commissionAmount,
  driver_earning: driverEarning,
});
```

### 6. Add Price Breakdown UI
Update the confirm step in `Rides.tsx` to show `RidePriceBreakdown`:

```tsx
{step === "confirm" && breakdown && (
  <div className="space-y-4">
    <RidePriceBreakdown
      breakdown={breakdown}
      rideType={mapToRideType(selectedOption.id)}
      distance={estimatedDistance}
      duration={estimatedDuration}
      showEstimateNote={true}
    />
  </div>
)}
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/hooks/useRidePricingSettings.ts` | **NEW** - Hook to fetch rides pricing from DB |
| `src/lib/pricing.ts` | Add `calculateUnifiedRideFare` function |
| `src/pages/Rides.tsx` | Replace hardcoded pricing with DB-driven calculation, add breakdown UI |
| `supabase/functions/create-ride-payment-intent/index.ts` | Server-side price calculation, commission split |
| Database migration | Add `commission_amount`, `driver_earning`, `ride_type_multiplier` columns |

---

## Price Breakdown Display (UI Mock)

```text
┌───────────────────────────────────────┐
│ 📋 Fare Breakdown                     │
├───────────────────────────────────────┤
│ Base fare                    $3.50    │
│ Distance (15.1 mi)          $26.43    │
│ Time (~21 min)               $7.35    │
│ ─────────────────────────────────     │
│ Subtotal                    $37.28    │
│ Booking fee                  $2.50    │
├───────────────────────────────────────┤
│ Total                       $39.78    │
│                                       │
│ ⚠️ Estimated range: $35-$44           │
└───────────────────────────────────────┘
```

With surge active:
```text
│ ⚡ 1.5x surge pricing in effect       │
│ Surge applied                 +50%    │
```

---

## Technical Notes

### Why Server-Side Recalculation?
- Client-side calculations can be tampered with
- Server is source of truth for payment amounts
- Ensures commission/driver splits are accurate

### Commission Formula
```
commission_amount = price_total × (commission_percent / 100)
driver_earning = price_total - commission_amount
```

Default commission: 25% (from `commission_settings` table)
Driver earning: 75%

### Surge Integration
- `useSurgePricing` hook already provides `multiplier`
- Pass to calculation function
- Display surge badge in breakdown

