

# Fix Ride Type Mapping + Enhanced Debug Mode

## Problem Analysis

The ride cards are not displaying correct prices because there's a **mismatch between UI ride type IDs and database ride type IDs**:

| UI Tab | Current UI IDs | Database IDs |
|--------|----------------|--------------|
| Economy | `wait-save`, `standard` | `wait_save`, `standard`, `green`, `priority` |
| Premium | `extra-comfort`, `zivo-black` | `premium`, `black`, `comfort` |
| Elite | `zivo-lux`, `executive` | `elite`, `xl`, `lux` |

When the pricing engine queries for `wait-save` (with hyphen), it finds no match and falls back to default rates.

## Solution

### Step 1: Update rideData.ts with Correct Database IDs

Update all ride option IDs to match the actual database `ride_type` values:

**Economy tab (4 options):**
- `wait_save` (not `wait-save`)
- `standard`
- `green`
- `priority`

**Premium tab (2 options):**
- `comfort` (renamed from "Extra Comfort")
- `premium` (renamed from "ZIVO Black")

**Elite tab (2 options):**
- `elite`
- `xl`

### Step 2: Add Debug Info for Miles/Minutes

Enhance the debug panel to prominently show:
- Miles
- Minutes
- Subtotal
- All multipliers
- Insurance
- Final price

### Step 3: Update RideGrid with Correct Ride Type Arrays

Ensure each tab fetches quotes for the correct ride types that exist in the database.

### Step 4: Verify Trip Creation Has All Fields

Ensure `createRideInDb` includes:
- `price_total` = final
- `insurance_fee`
- `route_distance_miles` = miles
- `route_duration_minutes` = minutes
- `zone_name`
- `platform_fee` = round(price_total * 0.15, 2)
- `driver_earning` = round(price_total - platform_fee, 2)

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ride/rideData.ts` | Update ride option IDs to match database |
| `src/components/ride/RideCard.tsx` | Enhance debug panel to show miles/minutes |
| `src/lib/supabaseRide.ts` | Add explicit platform_fee and driver_earning fields |

## Detailed Changes

### rideData.ts

```typescript
export const rideOptions = {
  economy: [
    { id: "wait_save", name: "Wait & Save", ... },
    { id: "standard", name: "Standard", ... },
    { id: "green", name: "Green", subtitle: "Eco-friendly rides", ... },
    { id: "priority", name: "Priority", subtitle: "Skip the queue", ... },
  ],
  premium: [
    { id: "comfort", name: "Comfort", subtitle: "Newer cars, more legroom", ... },
    { id: "premium", name: "Premium", subtitle: "Premium leather sedans", ... },
  ],
  elite: [
    { id: "elite", name: "Elite", subtitle: "Ultimate luxury experience", ... },
    { id: "xl", name: "XL", subtitle: "Extra room for groups", ... },
  ],
};
```

### RideCard.tsx Debug Panel Enhancement

Add miles and minutes to the debug display:

```typescript
{showDebug && quote && (
  <div className="debug-panel">
    <div>Zone: {quote.zoneName}</div>
    <div>{quote.miles.toFixed(1)} mi / {quote.minutes} min</div>
    <div>Base: ${quote.subtotal.toFixed(2)}</div>
    <div>× Multiplier: {quote.multipliers.combined.toFixed(2)}</div>
    <div>× LongTrip: {quote.multipliers.longTrip.toFixed(2)}</div>
    <div>+ Insurance: ${quote.insurance_fee.toFixed(2)}</div>
    <div>+ Booking: ${quote.booking_fee.toFixed(2)}</div>
    <div>= Final: ${quote.final.toFixed(2)}</div>
  </div>
)}
```

### supabaseRide.ts - Add platform_fee and driver_earning

The file already calculates `commission_amount = price * 0.15`. We'll ensure this is clearly named and also calculate driver earning:

```typescript
const insertData = {
  // ...existing fields
  insurance_fee: payload.insuranceFee || 0,
  platform_fee: Math.round(payload.price * 0.15 * 100) / 100,
  driver_earning: Math.round(payload.price * 0.85 * 100) / 100,
  // Or: driver_earning = price - platform_fee
};
```

## Expected Result

After this fix:
- All ride cards will show correct prices from Supabase
- Debug mode (`?debug=1`) will show full breakdown including miles/minutes
- Trip creation will save all required pricing fields
- Economy tab: 4 ride types (wait_save, standard, green, priority)
- Premium tab: 2 ride types (comfort, premium)
- Elite tab: 2 ride types (elite, xl)

