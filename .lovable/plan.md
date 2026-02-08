

# Fix Pricing: Correct Rates and Apply Long-Trip Discount

## Problem Summary

The current pricing for a 71.3 mi / 67 min trip is showing $308.59 (Standard) which is too high. Two issues:

1. **Long-trip discount not applied** - The 12% discount for trips over 50 miles is defined but never used
2. **Database rates are above industry standard** - Per-mile, per-minute, and booking fees need adjustment

## Current vs Expected Pricing

| Ride Type | Current Price | Expected Price | Difference |
|-----------|---------------|----------------|------------|
| Wait & Save | $283.90 | ~$145 | -49% |
| Standard | $308.59 | ~$155 | -50% |
| Green | $314.76 | ~$158 | -50% |
| Priority | $345.62 | ~$174 | -50% |
| Black | $509.17 | ~$256 | -50% |

## Root Cause Analysis

### Issue 1: Long-Trip Discount Not Applied
The `getLongTripMultiplier()` function exists but is never called in `quoteRidePrice()`:

```text
Current formula:
  total = subtotal × multiplier × surge

Should be:
  total = subtotal × multiplier × surge × longTripDiscount
```

For 71.3 miles, the discount should be 0.88 (12% off).

### Issue 2: Database Rates Too High

Current rates vs industry average:

| Component | Current | Industry Avg | Recommended |
|-----------|---------|--------------|-------------|
| base_fare | $3.50 | $2.75 | $2.50 |
| per_mile | $1.75 | $1.25 | $1.25 |
| per_minute | $0.35 | $0.25 | $0.25 |
| booking_fee | $2.50 | $0.85 | $1.50 |
| minimum_fare | $7.00 | $6.50 | $6.50 |

## Implementation Plan

### Step 1: Apply Long-Trip Discount in quoteRidePrice()

**File**: `src/lib/pricing.ts`

Update the `quoteRidePrice()` function to include the long-trip discount:

```text
Before:
  const combinedMultiplier = zoneMultiplier * surgeMultiplier;

After:
  const longTripDiscount = getLongTripMultiplier(distanceMiles);
  const combinedMultiplier = zoneMultiplier * surgeMultiplier * longTripDiscount;
```

This alone will reduce the 71.3 mi trip by 12%.

### Step 2: Update Database Rates

Update the `zone_pricing_rates` table with industry-standard rates:

**Standard ride (ride_type = 'standard'):**
```text
base_fare: $2.50
per_mile: $1.25
per_minute: $0.25
booking_fee: $1.50
minimum_fare: $6.50
multiplier: 1.0
```

**Wait & Save (ride_type = 'wait_save'):**
```text
base_fare: $2.00
per_mile: $1.00
per_minute: $0.20
booking_fee: $1.00
minimum_fare: $5.50
multiplier: 0.92
```

**All other ride types:** Adjust base rates proportionally while keeping multipliers.

### Step 3: Update RidePriceQuote Interface

**File**: `src/lib/pricing.ts`

Add `longTripDiscount` to the debug info for transparency:

```text
debug: {
  distanceMiles: number;
  durationMinutes: number;
  rideType: string;
  longTripDiscount?: number;
}
```

## Price Calculation After Fix

For 71.3 mi / 67 min trip with 2.0× surge:

```text
subtotal = 2.50 + (71.3 × 1.25) + (67 × 0.25) + 1.50
         = 2.50 + 89.13 + 16.75 + 1.50
         = 109.88

With long-trip discount (12%):
         = 109.88 × 0.88 = 96.69

With surge 2.0×:
         = 96.69 × 2.0 = $193.38 (Standard)

Wait & Save with 0.92 multiplier:
         = 96.69 × 2.0 × 0.92 = $177.91
```

These prices are much more realistic and competitive with Uber/Lyft.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/pricing.ts` | Apply `getLongTripMultiplier()` in `quoteRidePrice()` |
| Database | Update `zone_pricing_rates` with industry-standard values |

## New Rate Values for Database

```text
ride_type      | base_fare | per_mile | per_min | booking | min_fare | multi
---------------|-----------|----------|---------|---------|----------|------
wait_save      | 2.00      | 1.00     | 0.20    | 1.00    | 5.50     | 0.92
standard       | 2.50      | 1.25     | 0.25    | 1.50    | 6.50     | 1.00
green          | 2.50      | 1.20     | 0.22    | 1.50    | 6.50     | 1.02
priority       | 2.50      | 1.20     | 0.22    | 1.50    | 6.50     | 1.12
pet            | 2.50      | 1.20     | 0.22    | 1.50    | 6.50     | 1.15
comfort        | 3.00      | 1.50     | 0.28    | 1.75    | 8.00     | 1.45
xl             | 3.00      | 1.50     | 0.28    | 1.75    | 8.00     | 1.45
black          | 4.00      | 2.00     | 0.35    | 2.00    | 12.00    | 1.65
black_suv      | 5.00      | 2.50     | 0.42    | 2.25    | 15.00    | 2.10
xxl            | 3.50      | 1.75     | 0.30    | 2.00    | 9.00     | 1.75
premium        | 4.00      | 2.00     | 0.35    | 2.00    | 12.00    | 1.65
elite          | 6.00      | 2.80     | 0.48    | 2.50    | 20.00    | 2.10
lux            | 12.00     | 5.00     | 0.85    | 4.00    | 60.00    | 3.50
sprinter       | 10.00     | 4.00     | 0.70    | 4.00    | 40.00    | 2.50
secure         | 20.00     | 7.00     | 1.10    | 8.00    | 80.00    | 4.00
```

## Testing Checklist

1. Navigate to `/rides` and enter pickup/destination for 71.3 mi trip
2. Verify Standard price is approximately $155-195 (with surge)
3. Verify Wait & Save shows savings compared to Standard
4. Verify Black and premium rides show appropriate premium pricing
5. Verify long-trip discount is applied (check debug panel)
6. Test shorter trips (< 25 mi) to ensure no discount is applied

