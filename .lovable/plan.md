
# Fix: All Ride Cards Showing Same Price

## Problem

All ride types (Wait & Save, Standard, Green, Priority, Pet) are displaying **$154.31** because the pricing logic fetches rates for only one ride type at a time.

**Current Flow (Broken):**
```text
1. User selects pickup → zone detected
2. useZonePricingRates(zoneId, selectedOption?.id ?? "standard")
   → Fetches rates for ONE ride type only
3. getQuoteForOption(option) called for each card
   → All use the SAME zoneRates.multiplier
   → All show same price
```

## Root Cause

| Issue | Location | Details |
|-------|----------|---------|
| Single fetch | `Rides.tsx` line 317 | `useZonePricingRates(zone, selectedOption?.id)` fetches rates for only the selected ride type |
| Shared multiplier | `Rides.tsx` line 385 | All ride cards use `zoneRates?.multiplier` from that single fetch |

## Solution

Fetch rates for **all ride types** in the zone, then use each ride type's specific rates when calculating that card's price.

### Step 1: Create New Hook `useAllZoneRatesMap`
**File**: `src/hooks/useZonePricingRates.ts`

Add a hook that fetches all ride-type rates for a zone and returns them as a Map for quick lookup:

```text
useAllZoneRatesMap(zoneId) → Map<ride_type, ZonePricingRate>

Query: SELECT * FROM zone_pricing_rates WHERE zone_id = ?
Returns: { "standard" → rates, "wait_save" → rates, "green" → rates, ... }
```

### Step 2: Update Pricing Logic in Rides.tsx
**File**: `src/pages/Rides.tsx`

1. Replace single-rate fetch with all-rates fetch
2. Update `getQuoteForOption(option)` to look up the correct rate for each option's `id`
3. Fall back to "standard" rate if ride type not found

```text
// Before
const { rates: zoneRates } = useZonePricingRates(zone?.id, selectedOption?.id);
const multiplier = zoneRates?.multiplier ?? 1.0; // Same for all

// After
const { ratesMap } = useAllZoneRatesMap(zone?.id);
const getQuoteForOption = (option) => {
  const rates = ratesMap.get(option.id) ?? ratesMap.get("standard");
  const multiplier = rates?.multiplier ?? RIDE_TYPE_MULTIPLIERS[option.id];
  // Now each card gets its own multiplier
}
```

### Step 3: Keep Per-Ride-Type Rates Intact
The pricing formula stays the same, but now uses the correct rates per ride type:

```text
subtotal = base_fare + (miles × per_mile) + (minutes × per_minute) + booking_fee
subtotal = max(subtotal, minimum_fare)
final = round(subtotal × multiplier, 2)
```

## Expected Outcome

| Ride Type | Current (Broken) | Expected (Fixed) |
|-----------|------------------|------------------|
| Wait & Save | $154.31 | ~$142 (0.92×) |
| Standard | $154.31 | ~$154 (1.00×) |
| Green | $154.31 | ~$157 (1.02×) |
| Priority | $154.31 | ~$173 (1.12×) |
| Pet | $154.31 | ~$177 (1.15×) |

## Files to Modify

### File 1: `src/hooks/useZonePricingRates.ts`
- Add `useAllZoneRatesMap(zoneId)` hook
- Returns `Map<string, ZonePricingRate>` for quick lookup by ride type
- Fallback to Default US zone if local zone has no rates

### File 2: `src/pages/Rides.tsx`
- Replace `useZonePricingRates()` with `useAllZoneRatesMap()`
- Update `getQuoteForOption()` to fetch rates from the map using `option.id`
- Update `pricingQuoteSettings` to be dynamic per option

### File 3: `src/lib/pricing.ts`
- Add fallback constant `RIDE_TYPE_MULTIPLIERS` usage when zone doesn't have specific ride-type rates
- Ensure `quoteRidePrice` works correctly with per-ride settings

## Technical Details

### Database Rate Lookup Priority
1. Zone + exact ride_type match
2. Zone + "standard" (if ride_type not found)
3. Default US zone + ride_type
4. Default US zone + "standard"

### Available Rates in DB
```text
USA Default Pricing zone:
- wait_save: multiplier 0.92
- standard: multiplier 1.00
- green: multiplier 1.02
- priority: multiplier 1.12
- xl: multiplier 1.45
- premium: multiplier 1.65
- elite: multiplier 2.10
```

## Verification Steps

1. Navigate to `/rides?debug=1`
2. Enter pickup (e.g., Baton Rouge address)
3. Enter destination (~70 miles away)
4. Verify each ride card shows different price
5. Select different ride types and verify debug panel shows correct multiplier
