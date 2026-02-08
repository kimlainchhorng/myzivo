

# Unified Supabase Pricing Engine with Dynamic Multipliers

## Overview

Create ONE `quoteRidePrice` function that fetches rates from Supabase and applies all multipliers (time, weather, surge, event, long-trip). This single function will power ALL ride cards and checkout.

## Database Schema Updates

The following tables need to be created (they don't currently exist):

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NEW TABLES TO CREATE                                   │
├─────────────────────┬───────────────────────────────────────────────────────────┤
│ time_multipliers    │ Hour-based pricing (rush hour, late night)               │
│ weather_multipliers │ Weather conditions (rain, snow) - global or zone         │
│ event_zones         │ Special events (stadium, concert) with radius            │
│ ride_quotes         │ Audit/debug log of all quotes generated                  │
└─────────────────────┴───────────────────────────────────────────────────────────┘
```

## Implementation Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         quoteRidePrice() Flow                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   INPUT: rideType, pickup{lat,lng}, destination{lat,lng}                        │
│                                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                         │
│   │  1. Route   │───>│  2. Zone    │───>│  3. Rates   │                         │
│   │  (Google)   │    │  (bbox)     │    │  (DB)       │                         │
│   └─────────────┘    └─────────────┘    └─────────────┘                         │
│        │                   │                   │                                 │
│        v                   v                   v                                 │
│   miles, minutes      zone_id            base_fare, per_mile, etc.              │
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐           │
│   │              MULTIPLIER STACK (all applied)                     │           │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │           │
│   │  │ Time   │ │Weather │ │ Surge  │ │ Event  │ │LongTrip│        │           │
│   │  │1.0-1.15│ │1.0-1.25│ │1.0-1.5 │ │1.0-1.2 │ │0.88-1.0│        │           │
│   │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │           │
│   └─────────────────────────────────────────────────────────────────┘           │
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐           │
│   │                    PRICE CALCULATION                            │           │
│   │  subtotal = base_fare + (miles × per_mile) + (min × per_min)   │           │
│   │  subtotal = max(subtotal, minimum_fare)                        │           │
│   │  insurance = dynamic(minutes, weatherMult, surgeMult)          │           │
│   │  final = subtotal × allMultipliers + booking_fee + insurance   │           │
│   └─────────────────────────────────────────────────────────────────┘           │
│                                                                                  │
│   OUTPUT: {zoneName, miles, minutes, subtotal, multipliers, insurance, final}   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Implementation Plan

### Step 1: Create Database Tables

Create a migration with all 4 new tables and seed initial data:

**time_multipliers** - Hour-based multipliers per zone

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| zone_id | uuid | FK to pricing_zones |
| day_mask | int | 7-bit bitmask (127 = all days) |
| start_hour | int | 0-23 |
| end_hour | int | 0-23 (wrap allowed) |
| multiplier | numeric | e.g., 1.10 for rush hour |

**weather_multipliers** - Weather-based multipliers

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| zone_id | uuid | NULL for global, FK for zone-specific |
| weather_key | text | clear, rain, heavy_rain, snow |
| multiplier | numeric | e.g., 1.20 for heavy rain |

**event_zones** - Stadium/concert surge zones

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Event name |
| zone_id | uuid | FK to pricing_zones |
| center_lat | numeric | Event center latitude |
| center_lng | numeric | Event center longitude |
| radius_km | numeric | Radius (default 3km) |
| start_time | timestamptz | Event start |
| end_time | timestamptz | Event end |
| multiplier | numeric | e.g., 1.15 |
| is_active | boolean | Toggle |

**ride_quotes** - Audit log (optional, for debugging)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Requesting user |
| pickup_lat/lng | numeric | Pickup coords |
| dest_lat/lng | numeric | Destination coords |
| ride_type | text | e.g., standard |
| miles | numeric | Route distance |
| minutes | numeric | Route duration |
| subtotal | numeric | Before multipliers |
| multipliers | jsonb | Breakdown of all multipliers |
| insurance_fee | numeric | Dynamic insurance |
| final_price | numeric | Final quote |
| created_at | timestamptz | Timestamp |

### Step 2: Create Core Quote Function

**File:** `src/lib/quoteRidePrice.ts`

This will be the SINGLE SOURCE OF TRUTH for all pricing:

```typescript
// Returns:
interface RideQuoteResult {
  zoneName: string;
  miles: number;
  minutes: number;
  subtotal: number;
  multipliers: {
    rideType: number;
    time: number;
    weather: number;
    surge: number;
    event: number;
    longTrip: number;
    combined: number;
  };
  insurance_fee: number;
  booking_fee: number;
  final: number;
}
```

**Multiplier Calculations:**

1. **Time Multiplier** - Query `time_multipliers` for current hour/day
   - Handle wrap hours (20→2 means 20:00 to 02:00)
   - Default 1.0 if no match

2. **Weather Multiplier** - Query `weather_multipliers`
   - For now: always 1.0 (no weather API key)
   - Later: map weather condition to key

3. **Surge Multiplier (Capped)** - Modified from current logic:
   - driversCount ≤ 0 → 1.5 (capped from 2.0)
   - ratio ≥ 2.0 → 1.5
   - ratio ≥ 1.5 → 1.3
   - ratio ≥ 1.0 → 1.15
   - else → 1.0

4. **Event Multiplier** - Query `event_zones`:
   - Check if pickup within radius of any active event
   - Use max multiplier if multiple events overlap
   - Default 1.0

5. **Long Trip Discount** - Already exists:
   - > 50 miles → 0.88 (12% off)
   - > 25 miles → 0.92 (8% off)
   - else → 1.0

6. **Dynamic Insurance Fee:**
   ```
   insurance = max(1.00, minutes × 0.06)
   risk = 1 + ((weatherMult - 1) × 0.6) + ((surgeMult - 1) × 0.5)
   insurance = min(6.00, insurance × risk)
   ```

### Step 3: Create React Hook

**File:** `src/hooks/useRideQuote.ts`

Hook that wraps `quoteRidePrice` with caching:

```typescript
function useRideQuote(
  rideType: string,
  pickupCoords: {lat: number, lng: number} | null,
  dropoffCoords: {lat: number, lng: number} | null,
  routeMiles: number | null,
  routeMinutes: number | null
): {
  quote: RideQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}
```

### Step 4: Update RideGrid to Use New Hook

**File:** `src/components/ride/RideGrid.tsx`

Replace `calculateRidePrice` calls with the new `useRideQuote` hook:

- Each RideCard receives its quote from the centralized function
- All multipliers are already applied
- No extra math needed in the card

### Step 5: Update RideConfirmPage

**File:** `src/pages/ride/RideConfirmPage.tsx`

Changes:
1. Use `useRideQuote` for final price calculation
2. Display breakdown when `?debug=1` is in URL
3. On confirm, save all pricing data to trips table

### Step 6: Update Trip Creation

**File:** `src/lib/supabaseRide.ts`

Add new fields to `CreateRideDbPayload`:

```typescript
interface CreateRideDbPayload {
  // ...existing fields
  price_total: number;
  insurance_fee: number;
  route_distance_miles: number;
  route_duration_minutes: number;
  zone_name: string;
  multipliers: {
    time: number;
    weather: number;
    surge: number;
    event: number;
    longTrip: number;
  };
  commission_amount: number; // round(price_total × 0.15, 2)
  driver_earning: number;    // price_total - commission_amount
}
```

### Step 7: Add Debug Mode

When URL contains `?debug=1`, show breakdown under price:

```text
┌─────────────────────────────────┐
│  Standard - $24.87              │
├─────────────────────────────────┤
│  Zone: Baton Rouge              │
│  Distance: 10.2 mi (23 min)     │
│  Base: $12.55                   │
│  × Time: 1.10 (rush hour)       │
│  × Surge: 1.15 (moderate)       │
│  × Long Trip: 1.00              │
│  + Insurance: $1.38             │
│  + Booking: $0.75               │
│  = Final: $24.87                │
└─────────────────────────────────┘
```

## Files to Create

| File | Description |
|------|-------------|
| `supabase/migrations/xxx_pricing_multipliers.sql` | Create 4 new tables + seed data |
| `src/lib/quoteRidePrice.ts` | Core pricing engine function |
| `src/hooks/useRideQuote.ts` | React hook wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ride/RideGrid.tsx` | Use `useRideQuote` instead of `calculateRidePrice` |
| `src/components/ride/RideCard.tsx` | Display final price from quote, show debug if enabled |
| `src/pages/ride/RideConfirmPage.tsx` | Use quote for final price, save full breakdown |
| `src/lib/supabaseRide.ts` | Add new fields to trip creation |
| `src/lib/surge.ts` | Cap surge multiplier at 1.5 instead of 2.0 |

## Surge Pricing Adjustment

The current surge goes up to 2.0x. To stay cheaper than Uber/Lyft, cap at 1.5x:

| Condition | Current | New (Capped) |
|-----------|---------|--------------|
| No drivers | 2.0x | 1.5x |
| ratio ≥ 2.0 | 2.0x | 1.5x |
| ratio ≥ 1.5 | 1.6x | 1.3x |
| ratio ≥ 1.0 | 1.3x | 1.15x |
| ratio < 1.0 | 1.0x | 1.0x |

## Example Price Calculation

10-mile, 23-minute standard ride during rush hour:

```text
Base calculation:
  base_fare = $1.99
  distance  = 10 × $0.89 = $8.90
  time      = 23 × $0.18 = $4.14
  subtotal  = $15.03 (above $4.99 minimum)

Multipliers:
  rideType × 1.00 (standard)
  time     × 1.10 (rush hour 7am)
  weather  × 1.00 (clear)
  surge    × 1.00 (low demand)
  event    × 1.00 (no events)
  longTrip × 1.00 (< 25 miles)
  combined = 1.10

Insurance:
  base = max(1.00, 23 × 0.06) = $1.38
  risk = 1 + 0 + 0 = 1.0
  insurance = min(6.00, 1.38 × 1.0) = $1.38

Final:
  ($15.03 × 1.10) + $0.75 + $1.38 = $18.66
```

