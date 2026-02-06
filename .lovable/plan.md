
# ZIVO Ride Dynamic Pricing Enhancement

## Overview

This update adds dynamic ride pricing based on pickup and destination. When both locations are filled, the system calculates a mock distance and updates all ride prices automatically.

---

## Current State

The location card already has dropdown suggestions working:
- `RideLocationCard.tsx` has `mockSuggestions` array
- Focus shows suggestions, typing filters them
- Clicking a suggestion fills the input

What needs to be added:
1. Calculate mock trip details when both locations are filled
2. Update ride prices dynamically based on distance
3. Display trip distance and estimated time below the ride grid

---

## Implementation Plan

### 1. Create Trip Calculation Utility

**New File**: `src/lib/tripCalculator.ts`

Add mock trip calculation logic:

```text
+------------------------------------------+
| calculateMockTrip(pickup, destination)   |
+------------------------------------------+
| Inputs: pickup string, destination string|
| Output: { distance, duration, prices }   |
+------------------------------------------+
```

Functions:
- `calculateMockTrip(pickup, destination)` - Returns mock distance (2-12 mi) and duration
- `calculateRidePrices(distance, duration)` - Returns prices for each ride type using the formula:
  - Base fare: $2.00
  - Per mile: $1.25
  - Economy multiplier: 1.0
  - Premium multiplier: 1.4
  - Elite multiplier: 1.8

The mock distance is deterministically generated from a hash of the pickup+destination strings so it remains consistent for the same addresses.

---

### 2. Update RidePage State Management

**File**: `src/pages/ride/RidePage.tsx`

Add trip details state:

```typescript
const [tripDetails, setTripDetails] = useState<{
  distance: number;  // miles
  duration: number;  // minutes
} | null>(null);
```

Add `useEffect` to recalculate when pickup/destination change:

```typescript
useEffect(() => {
  if (pickup.trim() && destination.trim()) {
    const trip = calculateMockTrip(pickup, destination);
    setTripDetails(trip);
  } else {
    setTripDetails(null);
  }
}, [pickup, destination]);
```

Pass `tripDetails` to `RideGrid` component.

---

### 3. Update Ride Data Structure

**File**: `src/components/ride/rideData.ts`

Add multipliers to the static data:

```typescript
economy: [
  { id: "wait-save", ..., multiplier: 0.85 },  // Discount for waiting
  { id: "standard", ..., multiplier: 1.0 },
],
premium: [
  { id: "extra-comfort", ..., multiplier: 1.2 },
  { id: "zivo-black", ..., multiplier: 1.4 },
],
elite: [
  { id: "zivo-lux", ..., multiplier: 2.0 },
  { id: "executive", ..., multiplier: 1.8 },
],
```

---

### 4. Update RideGrid to Accept Trip Details

**File**: `src/components/ride/RideGrid.tsx`

Add props for trip details:

```typescript
interface RideGridProps {
  rides: RideOption[];
  selectedRideId: string | null;
  onSelectRide: (ride: RideOption) => void;
  tripDetails: { distance: number; duration: number } | null;  // NEW
}
```

Pass calculated prices to each `RideCard`.

---

### 5. Update RideCard to Show Dynamic Pricing

**File**: `src/components/ride/RideCard.tsx`

Update interface to accept optional calculated price:

```typescript
interface RideCardProps {
  ride: RideOption;
  isSelected: boolean;
  onSelect: () => void;
  calculatedPrice?: number;  // NEW - overrides ride.price when provided
}
```

Display `calculatedPrice` if provided, otherwise show static `ride.price`.

---

### 6. Add Trip Info Display

**File**: `src/pages/ride/RidePage.tsx`

Add a trip summary pill below the ride grid (only when tripDetails exists):

```text
+---------------------------------------+
|     6.2 miles  •  14 min estimated    |
+---------------------------------------+
```

Style: Same glassmorphic pill style as "35 DRIVERS NEARBY"

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/tripCalculator.ts` | Create | Mock trip calculation utilities |
| `src/pages/ride/RidePage.tsx` | Modify | Add tripDetails state, useEffect, pass to components |
| `src/components/ride/rideData.ts` | Modify | Add multiplier field to each ride option |
| `src/components/ride/RideCard.tsx` | Modify | Accept optional calculatedPrice prop |
| `src/components/ride/RideGrid.tsx` | Modify | Accept tripDetails, calculate and pass prices |

---

## Pricing Formula

```text
Base Price Calculation:
  baseFare = $2.00
  distanceCost = distance × $1.25
  timeCost = duration × $0.20
  basePrice = baseFare + distanceCost + timeCost

Per Ride Type:
  Wait & Save:    basePrice × 0.85  (15% discount)
  Standard:       basePrice × 1.0
  Extra Comfort:  basePrice × 1.2
  ZIVO Black:     basePrice × 1.4
  Executive:      basePrice × 1.8
  ZIVO Lux:       basePrice × 2.0
```

**Example** (6 miles, 14 min):
- Base: $2 + (6 × $1.25) + (14 × $0.20) = $2 + $7.50 + $2.80 = $12.30
- Standard: $12.30
- ZIVO Black: $12.30 × 1.4 = $17.22
- ZIVO Lux: $12.30 × 2.0 = $24.60

---

## Mock Distance Generation

To keep the mock consistent for the same addresses, use a simple hash:

```typescript
function generateMockDistance(pickup: string, destination: string): number {
  const combined = (pickup + destination).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  // Map to range 2-12 miles
  return 2 + (Math.abs(hash) % 100) / 10;
}
```

Duration calculated as: `distance × 2.3 minutes` (mock average speed)

---

## No Breaking Changes

- Existing UI layout preserved
- Static prices shown when no destination entered
- Dropdown suggestions already working
- CTA validation already in place from previous update
