

# Make ZIVO Pricing Cheaper Than Uber/Lyft

## Industry Comparison

| Component | Uber/Lyft Avg | Current ZIVO | Target ZIVO | Savings |
|-----------|---------------|--------------|-------------|---------|
| Base fare | $2.75 | $2.50 | $1.99 | -28% |
| Per-mile | $1.80 | $1.25 | $0.89 | -51% |
| Per-minute | $0.35 | $0.25 | $0.18 | -49% |
| Booking fee | $0.85 | $1.50 | $0.75 | -12% |
| Minimum fare | $6.50 | $6.50 | $4.99 | -23% |

## Price Example: 10 miles / 20 minutes trip

| Service | Calculation | Total |
|---------|-------------|-------|
| **Uber (avg)** | $2.75 + (10 × $1.80) + (20 × $0.35) + $0.85 | **$28.60** |
| **ZIVO current** | $2.50 + (10 × $1.25) + (20 × $0.25) + $1.50 | **$21.50** |
| **ZIVO new** | $1.99 + (10 × $0.89) + (20 × $0.18) + $0.75 | **$15.44** |

ZIVO new pricing will be ~46% cheaper than Uber average!

## Implementation Plan

### Step 1: Update Database Rates

Update the `zone_pricing_rates` table with competitive rates:

```text
ride_type    | base_fare | per_mile | per_min | booking | min_fare | multi
-------------|-----------|----------|---------|---------|----------|------
wait_save    | 1.49      | 0.69     | 0.12    | 0.50    | 3.99     | 0.92
standard     | 1.99      | 0.89     | 0.18    | 0.75    | 4.99     | 1.00
green        | 1.99      | 0.85     | 0.16    | 0.75    | 4.99     | 1.02
priority     | 1.99      | 0.85     | 0.16    | 0.75    | 4.99     | 1.12
pet          | 1.99      | 0.85     | 0.16    | 0.75    | 4.99     | 1.15
comfort      | 2.49      | 1.10     | 0.22    | 1.00    | 6.49     | 1.45
xl           | 2.49      | 1.10     | 0.22    | 1.00    | 6.49     | 1.45
black        | 3.49      | 1.60     | 0.28    | 1.25    | 9.99     | 1.65
black_suv    | 4.49      | 2.00     | 0.35    | 1.50    | 12.99    | 2.10
xxl          | 2.99      | 1.35     | 0.24    | 1.25    | 7.49     | 1.75
premium      | 3.49      | 1.60     | 0.28    | 1.25    | 9.99     | 1.65
elite        | 5.49      | 2.40     | 0.42    | 1.75    | 17.99    | 2.10
lux          | 10.99     | 4.25     | 0.75    | 3.50    | 54.99    | 3.50
sprinter     | 8.99      | 3.50     | 0.60    | 3.00    | 34.99    | 2.50
secure       | 17.99     | 6.00     | 0.95    | 6.50    | 69.99    | 4.00
```

### Step 2: Update Default Settings in Code

**File**: `src/lib/pricing.ts`

Update `DEFAULT_RIDE_ZONE` to match the new competitive rates as fallback.

### Step 3: Update Default Hook Settings

**File**: `src/hooks/useRidePricingSettings.ts`

Update `DEFAULT_SETTINGS` to match new competitive rates.

## Price Comparison: Long Trip (71 mi / 67 min)

| Service | Calculation | Total |
|---------|-------------|-------|
| **Uber (avg)** | $2.75 + (71 × $1.80) + (67 × $0.35) + $0.85 | **$154.00** |
| **ZIVO new (Standard)** | $1.99 + (71 × $0.89) + (67 × $0.18) + $0.75 | **$78.04** |
| **With 12% long-trip discount** | $78.04 × 0.88 | **$68.68** |

ZIVO will be ~55% cheaper than Uber for long trips!

## Files to Modify

| File | Changes |
|------|---------|
| Database | Update `zone_pricing_rates` with new competitive values |
| `src/lib/pricing.ts` | Update `DEFAULT_RIDE_ZONE` fallback rates |
| `src/hooks/useRidePricingSettings.ts` | Update `DEFAULT_SETTINGS` to match |

## Expected Results

After implementation:
- Standard 10mi trip: ~$15 (vs Uber ~$29)
- Wait & Save 10mi trip: ~$12 (vs Uber ~$29)
- Long 71mi trip: ~$69 (vs Uber ~$154)
- All ride types: 40-55% cheaper than Uber/Lyft average

