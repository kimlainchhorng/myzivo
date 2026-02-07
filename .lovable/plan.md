

# Rider: Surge Pricing System

## Summary

Add surge pricing logic that increases fares when driver supply is low. The system checks available driver count and applies a multiplier (1.0x normal, 1.5x when <3 drivers, 1.8x when <2 drivers). Show "High demand" indicators on ride cards and a surge warning message when active.

---

## Current State

| Component | Status |
|-----------|--------|
| `calculateRidePrice()` | Exists in `tripCalculator.ts` - no surge support |
| `useAvailableDriversCount()` | Already exists - returns driver count |
| Surge indicator on RideCard | Not implemented |
| Surge message | Not implemented |

---

## Implementation Approach

### 1. Create Surge Pricing Hook

New hook `useSurgePricing` that:
- Uses existing `useAvailableDriversCount()` to get driver count
- Returns surge multiplier based on rules:
  - <2 drivers: 1.8x
  - <3 drivers: 1.5x
  - Otherwise: 1.0x
- Returns surge status (active/inactive) and display label

### 2. Update Price Calculation

Modify `calculateRidePrice()` to accept optional surge multiplier, or create wrapper function that applies surge to final price.

### 3. Update RideCard Component

Add props for surge indicator:
- Show "High demand" badge when surge > 1.0
- Price already dynamically calculated - just need to pass surged price

### 4. Update RidePage

- Fetch surge multiplier
- Pass to RideGrid/RideCard
- Show surge warning message when active

### 5. Update RideConfirmPage

- Apply surge multiplier to displayed price
- Show surge message in trip summary

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useSurgePricing.ts` | Create | New hook for surge multiplier calculation |
| `src/lib/tripCalculator.ts` | Modify | Add surge multiplier parameter to price calculation |
| `src/components/ride/RideCard.tsx` | Modify | Add surge indicator badge |
| `src/components/ride/RideGrid.tsx` | Modify | Pass surge multiplier to price calculations |
| `src/pages/ride/RidePage.tsx` | Modify | Integrate surge hook, show surge message |
| `src/components/ride/RideStickyCTA.tsx` | Modify | Apply surge to displayed price |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Apply surge to price, show surge message |

---

## Technical Details

### New Hook: `useSurgePricing`

```typescript
// src/hooks/useSurgePricing.ts
import { useAvailableDriversCount } from "./useAvailableDrivers";

export interface SurgePricingInfo {
  multiplier: number;
  isActive: boolean;
  label: string;
  driverCount: number;
  isLoading: boolean;
}

export function useSurgePricing(): SurgePricingInfo {
  const { count, isLoading } = useAvailableDriversCount();

  // Surge rules
  let multiplier = 1.0;
  let label = "";

  if (count < 2) {
    multiplier = 1.8;
    label = "Very high demand";
  } else if (count < 3) {
    multiplier = 1.5;
    label = "High demand";
  }

  return {
    multiplier,
    isActive: multiplier > 1.0,
    label,
    driverCount: count,
    isLoading,
  };
}
```

### Update `calculateRidePrice` in tripCalculator.ts

```typescript
export function calculateRidePrice(
  rideId: string, 
  distance: number, 
  duration: number,
  surgeMultiplier: number = 1.0  // Add optional parameter
): number {
  const basePrice = calculateBasePrice(distance, duration);
  const rideMultiplier = RIDE_MULTIPLIERS[rideId] || 1.0;
  return Math.round(basePrice * rideMultiplier * surgeMultiplier * 100) / 100;
}
```

### Update RideCard Component

Add surge indicator badge next to price:

```typescript
interface RideCardProps {
  ride: RideOption;
  isSelected: boolean;
  onSelect: () => void;
  calculatedPrice?: number;
  surgeActive?: boolean;  // New prop
}

// In the component, add surge badge
{surgeActive && (
  <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
    <span className="text-[10px] font-bold text-white">High demand</span>
  </div>
)}
```

### Update RideGrid Component

Pass surge info to each card:

```typescript
interface RideGridProps {
  rides: RideOption[];
  selectedRideId: string | null;
  onSelectRide: (ride: RideOption) => void;
  tripDetails: TripDetails | null;
  surgeMultiplier?: number;  // New prop
}

// Apply surge to price calculation
const calculatedPrice = tripDetails 
  ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration, surgeMultiplier || 1.0)
  : undefined;

<RideCard
  ride={ride}
  isSelected={selectedRideId === ride.id}
  onSelect={() => onSelectRide(ride)}
  calculatedPrice={calculatedPrice}
  surgeActive={(surgeMultiplier || 1) > 1}
/>
```

### Update RidePage

Add surge hook and warning message:

```typescript
const { multiplier: surgeMultiplier, isActive: surgeActive, label: surgeLabel, driverCount } = useSurgePricing();

// Pass to RideGrid
<RideGrid
  rides={rideOptions[activeTab]}
  selectedRideId={selectedRide?.id || null}
  onSelectRide={setSelectedRide}
  tripDetails={tripDetails}
  surgeMultiplier={surgeMultiplier}
/>

// Surge Warning Message (above ride grid or below tabs)
{surgeActive && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
  >
    <TrendingUp className="w-5 h-5 text-amber-500 shrink-0" />
    <div>
      <p className="text-sm font-medium text-amber-400">{surgeLabel}</p>
      <p className="text-xs text-white/60">
        Prices are higher due to high demand
      </p>
    </div>
  </motion.div>
)}
```

### Pass Surge to Confirm Page

Update navigation state in RidePage:

```typescript
navigate("/ride/confirm", {
  state: {
    ride: selectedRide,
    pickup,
    destination,
    tripDetails,
    pickupCoords,
    dropoffCoords,
    routePolyline,
    surgeMultiplier,  // Add this
  },
});
```

### Update RideConfirmPage

Apply surge in price calculation and show message:

```typescript
// Add to LocationState interface
interface LocationState {
  // ... existing
  surgeMultiplier?: number;
}

// Apply surge to price
const displayPrice = tripDetails
  ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration, surgeMultiplier || 1.0)
  : ride.price;

// Show surge indicator in summary card
{surgeMultiplier && surgeMultiplier > 1 && (
  <div className="flex items-center justify-center gap-2 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
    <TrendingUp className="w-4 h-4 text-amber-500" />
    <span className="text-sm text-amber-400">
      Prices are higher due to high demand ({surgeMultiplier}x)
    </span>
  </div>
)}
```

### Update RideStickyCTA

Pass surge to price calculation:

```typescript
interface RideStickyCTAProps {
  // ... existing
  surgeMultiplier?: number;  // Add
}

const displayPrice = tripDetails && selectedRide
  ? calculateRidePrice(selectedRide.id, tripDetails.distance, tripDetails.duration, surgeMultiplier || 1.0)
  : selectedRide?.price || 0;
```

---

## User Flow

```text
User opens /ride
      │
      ▼
useSurgePricing() checks available drivers
      │
  ┌───┴───────────────┐
  │                   │
  ▼                   ▼
≥3 drivers         <3 drivers
(surge=1.0)        (surge=1.5 or 1.8)
      │                   │
      ▼                   ▼
Normal prices      Show surge warning:
displayed         "Prices are higher due
                   to high demand"
      │                   │
      └─────────┬─────────┘
                │
                ▼
      Ride cards show prices
      with surge applied
                │
                ▼
      If surge: "High demand" badge
                │
                ▼
      User selects ride, sees
      surged price in CTA
                │
                ▼
      Navigate to /ride/confirm
      with surgeMultiplier in state
                │
                ▼
      Confirm page shows final
      surged price + warning
```

---

## UI Mockup: Surge Active

```text
+----------------------------------+
| [←] Where to?                    |
+----------------------------------+
| 📍 109 Hickory Street...         |
| 📍 Downtown Station              |
+----------------------------------+
|                                  |
| ⚠️ HIGH DEMAND                   |
| Prices are higher due to high    |
| demand                           |
|                                  |
+----------------------------------+
| Choose Your Ride                 |
| [Economy] [Premium] [Elite]      |
+----------------------------------+
| +------------+ +------------+    |
| | HIGH DEMAND|             |     |
| |  $18.50    |  $24.00    |     |
| | Wait&Save  |  Standard  |     |
| +------------+ +------------+    |
+----------------------------------+
| [SELECT STANDARD ($24.00) →]     |
+----------------------------------+
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Loading driver count | Show normal prices until loaded |
| Error fetching drivers | Fall back to 1.0x (no surge) |
| Driver count changes during booking | Surge calculated at confirm time; price locked once trip created |
| 0 drivers available | 1.8x surge + "No drivers" message from existing logic |

---

## No Changes To

- Database schema
- Driver app
- Admin panel
- Existing availability filtering (integrates with it)

