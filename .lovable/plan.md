

# Fix: Wrong Prices for Missing Ride Types

## Problem

Many ride types show incorrect prices because the database is missing rate entries for them.

| Ride Type | Has DB Rates? | Current Behavior |
|-----------|--------------|------------------|
| wait_save | Yes | Correct |
| standard | Yes | Correct |
| green | Yes | Correct |
| priority | Yes | Correct |
| pet | No | Falls back to standard rates + 1.15x multiplier |
| comfort | No | Falls back to standard rates + 1.45x multiplier |
| black | No | Falls back to standard rates + 1.65x multiplier |
| black_suv | No | Falls back to standard rates + 2.10x multiplier |
| xxl | No | Falls back to standard rates (but xl exists) + 2.10x |
| lux | No | Falls back to standard rates + 3.50x |
| sprinter | No | Falls back to standard rates + 2.50x |
| secure | No | Falls back to standard rates + 4.00x |

**The core issue**: When a ride type is missing from the database, the code correctly applies the multiplier from `RIDE_TYPE_MULTIPLIERS`, but uses the wrong **base rates** (standard economy rates instead of appropriate premium base rates).

## Solution

Add all missing ride types to the `zone_pricing_rates` table in the USA Default zone (`00000000-0000-0000-0000-000000000001`).

### Rate Tiers (Based on Existing Data)

| Tier | Ride Types | Base Fare | Per Mile | Per Minute | Booking Fee | Min Fare | Multiplier |
|------|------------|-----------|----------|------------|-------------|----------|------------|
| Economy | wait_save | $2.50 | $1.15 | $0.20 | $1.50 | $6.50 | 0.92 |
| Economy | standard | $3.50 | $1.75 | $0.35 | $2.50 | $7.00 | 1.00 |
| Economy | green | $2.50 | $1.28 | $0.22 | $1.50 | $6.50 | 1.02 |
| Economy | priority | $2.50 | $1.25 | $0.22 | $1.50 | $6.50 | 1.12 |
| Economy | **pet** (NEW) | $2.50 | $1.28 | $0.22 | $1.50 | $6.50 | 1.15 |
| Premium | xl | $3.50 | $1.75 | $0.28 | $2.00 | $9.00 | 1.45 |
| Premium | **comfort** (NEW) | $3.50 | $1.75 | $0.28 | $2.00 | $9.00 | 1.45 |
| Premium | **xxl** (NEW) | $4.00 | $1.90 | $0.32 | $2.25 | $10.00 | 1.75 |
| Premium | premium | $5.00 | $2.30 | $0.38 | $2.50 | $14.00 | 1.65 |
| Premium | **black** (NEW) | $5.00 | $2.30 | $0.38 | $2.50 | $14.00 | 1.65 |
| Premium | **black_suv** (NEW) | $6.00 | $2.75 | $0.45 | $2.75 | $18.00 | 2.10 |
| Elite | elite | $8.00 | $3.20 | $0.52 | $3.00 | $25.00 | 2.10 |
| Elite | **sprinter** (NEW) | $12.00 | $4.50 | $0.75 | $5.00 | $45.00 | 2.50 |
| Elite | **lux** (NEW) | $15.00 | $6.00 | $1.00 | $5.00 | $75.00 | 3.50 |
| Elite | **secure** (NEW) | $25.00 | $8.00 | $1.25 | $10.00 | $100.00 | 4.00 |

### Changes Required

**Database INSERT statements** to add missing ride types:

```sql
INSERT INTO zone_pricing_rates (zone_id, ride_type, base_fare, per_mile, per_minute, booking_fee, minimum_fare, multiplier)
VALUES
  -- Economy: pet
  ('00000000-0000-0000-0000-000000000001', 'pet', 2.50, 1.28, 0.22, 1.50, 6.50, 1.15),
  
  -- Premium tier
  ('00000000-0000-0000-0000-000000000001', 'comfort', 3.50, 1.75, 0.28, 2.00, 9.00, 1.45),
  ('00000000-0000-0000-0000-000000000001', 'black', 5.00, 2.30, 0.38, 2.50, 14.00, 1.65),
  ('00000000-0000-0000-0000-000000000001', 'black_suv', 6.00, 2.75, 0.45, 2.75, 18.00, 2.10),
  ('00000000-0000-0000-0000-000000000001', 'xxl', 4.00, 1.90, 0.32, 2.25, 10.00, 1.75),
  
  -- Elite tier
  ('00000000-0000-0000-0000-000000000001', 'sprinter', 12.00, 4.50, 0.75, 5.00, 45.00, 2.50),
  ('00000000-0000-0000-0000-000000000001', 'lux', 15.00, 6.00, 1.00, 5.00, 75.00, 3.50),
  ('00000000-0000-0000-0000-000000000001', 'secure', 25.00, 8.00, 1.25, 10.00, 100.00, 4.00);
```

### No Code Changes Required

The existing code logic is correct:
1. `useAllZoneRatesMap` fetches all rates for the zone
2. `getRatesForRideType` looks up rates by ride type ID
3. Falls back to standard if not found (but this is only for truly unknown ride types)
4. `quoteRidePrice` calculates correctly with the provided rates and multiplier

Once the database has all ride types, each card will use its proper rates.

## Testing

After inserting the rates:
1. Navigate to `/rides?debug=1`
2. Enter pickup and destination
3. Verify each ride type shows different prices
4. Check the debug panel shows the correct multiplier for each ride type

## Example Price Calculation

For a 10-mile, 25-minute trip:

**Standard (Economy)**:
- Subtotal = $3.50 + (10 × $1.75) + (25 × $0.35) + $2.50 = $32.25
- Total = $32.25 × 1.00 = **$32.25**

**Black (Premium)**:
- Subtotal = $5.00 + (10 × $2.30) + (25 × $0.38) + $2.50 = $40.00
- Total = $40.00 × 1.65 = **$66.00**

**Lux (Elite)**:
- Subtotal = $15.00 + (10 × $6.00) + (25 × $1.00) + $5.00 = $100.00
- Total = $100.00 × 3.50 = **$350.00**

