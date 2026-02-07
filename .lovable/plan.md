

# Prepare Real Dispatch Logic (Mock Backend)

## Overview

This update introduces a central ride state manager with localStorage persistence and improves timing behaviors across all ride flow pages. The current UI remains unchanged while we add proper state management and realistic timing.

---

## Current State

| Component | Current Behavior |
|-----------|------------------|
| State Management | Each page loads from localStorage independently |
| Searching Timing | 6 seconds to find driver |
| Driver Page | Hardcoded mock driver, ETA countdown exists |
| Trip Page | Progress animation, no elapsed timer |
| Receipt | Shows calculated fare, rating works |
| Persistence | Partial - some pages read from localStorage |

---

## Changes Summary

### 1. Create Central Ride Store

Create `src/stores/rideStore.ts` - a React Context-based store for ride state:

| Field | Type | Description |
|-------|------|-------------|
| rideId | string | UUID for the ride |
| pickup | string | Pickup address |
| destination | string | Destination address |
| rideType | string | Ride category (economy, comfort, etc.) |
| price | number | Fare amount |
| distance | number | Trip distance in miles |
| duration | number | Estimated duration in minutes |
| status | string | Current ride status |
| driverName | string | Assigned driver name |
| driverCar | string | Driver's vehicle |
| driverPlate | string | License plate |
| driverRating | number | Driver rating |
| eta | number | ETA in minutes |
| tripStartTime | number | When trip started (for elapsed timer) |
| createdAt | number | Timestamp when ride was created |

Status values: `idle` | `searching` | `driver_found` | `driver_en_route` | `driver_arrived` | `in_trip` | `completed` | `cancelled`

### 2. Searching Screen Improvements

Update `/ride/searching`:

- Initialize with `status = "searching"`
- After **3 seconds** (changed from 6):
  - Update `status = "driver_found"`
  - Assign mock driver:
    - Name: "Alex Johnson"
    - Car: "Toyota Camry"
    - Plate: "ZIVO123"
    - Rating: 4.9
    - ETA: 5 min
- Auto-navigate to `/ride/driver`

### 3. Driver Screen Improvements

Update `/ride/driver`:

- Read driver info from ride store (not hardcoded)
- ETA countdown timer (5 min → 0)
- When ETA reaches 0:
  - Show message: "Driver has arrived"
  - Update `status = "driver_arrived"`
  - Enable START TRIP button (already implemented)

### 4. Trip Screen Improvements

Update `/ride/trip`:

- Show trip elapsed timer (counting up from 0)
- After **60 seconds**:
  - Enable END TRIP button
  - Before 60 seconds: show disabled button with countdown
- Store `tripStartTime` when trip begins

### 5. Receipt Improvements

Update receipt modal to display:

- Trip time (elapsed time)
- Distance (from ride store)
- Fare (from ride store)
- Rating stars (already works)
- "Done" clears store and returns home

### 6. LocalStorage Persistence

The ride store auto-syncs to localStorage:
- Any state change persists immediately
- Page refresh loads persisted state
- `clearRide()` removes all stored data

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/stores/rideStore.ts` | Central ride state context + provider |
| `src/types/rideTypes.ts` | TypeScript interfaces for ride state |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap app with RideStoreProvider |
| `src/pages/ride/RideConfirmPage.tsx` | Initialize ride in store on confirm |
| `src/pages/ride/RideSearchingPage.tsx` | Use store, 3s timer, set driver |
| `src/pages/ride/RideDriverPage.tsx` | Read driver from store, ETA countdown |
| `src/pages/ride/RideTripPage.tsx` | Elapsed timer, 60s enable logic |
| `src/components/ride/RideReceiptModal.tsx` | Show trip time and distance |
| `src/hooks/useRideTripState.ts` | Refactor to use new store (or deprecate) |

---

## Technical Details

### Ride Store Implementation

```typescript
// src/stores/rideStore.ts

interface RideState {
  rideId: string | null;
  pickup: string;
  destination: string;
  rideType: string;
  price: number;
  distance: number;
  duration: number;
  status: RideStatus;
  driverName: string | null;
  driverCar: string | null;
  driverPlate: string | null;
  driverRating: number | null;
  eta: number;
  tripStartTime: number | null;
  tripElapsed: number;
  createdAt: number | null;
}

// Actions
type RideAction =
  | { type: 'CREATE_RIDE'; payload: CreateRidePayload }
  | { type: 'SET_STATUS'; status: RideStatus }
  | { type: 'ASSIGN_DRIVER'; driver: DriverInfo }
  | { type: 'UPDATE_ETA'; eta: number }
  | { type: 'START_TRIP' }
  | { type: 'UPDATE_ELAPSED'; elapsed: number }
  | { type: 'COMPLETE_RIDE' }
  | { type: 'CANCEL_RIDE' }
  | { type: 'CLEAR_RIDE' }
  | { type: 'LOAD_FROM_STORAGE'; state: RideState };
```

### Searching Page Logic

```typescript
// Timer: 3 seconds to find driver
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch({
      type: 'ASSIGN_DRIVER',
      driver: {
        name: 'Alex Johnson',
        car: 'Toyota Camry',
        plate: 'ZIVO123',
        rating: 4.9,
      }
    });
    dispatch({ type: 'SET_STATUS', status: 'driver_found' });
    
    // Brief delay then navigate
    setTimeout(() => {
      navigate('/ride/driver');
    }, 500);
  }, 3000);
  
  return () => clearTimeout(timer);
}, []);
```

### Driver Page ETA Countdown

```typescript
// Countdown from 5 minutes (300 seconds) to 0
useEffect(() => {
  if (state.eta <= 0 || state.status === 'driver_arrived') return;
  
  const interval = setInterval(() => {
    const newEta = Math.max(0, state.eta - 1);
    dispatch({ type: 'UPDATE_ETA', eta: newEta });
    
    if (newEta === 0) {
      dispatch({ type: 'SET_STATUS', status: 'driver_arrived' });
      toast.success("Driver has arrived!");
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [state.eta, state.status]);
```

### Trip Page Elapsed Timer

```typescript
// Count up from 0
const [elapsed, setElapsed] = useState(0);
const canEndTrip = elapsed >= 60;

useEffect(() => {
  if (state.status !== 'in_trip') return;
  
  const interval = setInterval(() => {
    setElapsed(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [state.status]);

// Format elapsed time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Receipt with Trip Data

```typescript
// In RideReceiptModal
<div className="flex justify-between">
  <span className="text-white/60">Trip time</span>
  <span className="text-white">{formatTime(tripElapsed)}</span>
</div>
<div className="flex justify-between">
  <span className="text-white/60">Distance</span>
  <span className="text-white">{distance.toFixed(1)} mi</span>
</div>
```

---

## State Flow Diagram

```text
User taps "Pay & Request"
    ↓
[RideConfirmPage] 
    → dispatch(CREATE_RIDE) 
    → status: 'searching'
    → navigate to /ride/searching
    ↓
[RideSearchingPage]
    → 3 second timer
    → dispatch(ASSIGN_DRIVER)
    → status: 'driver_found'
    → navigate to /ride/driver
    ↓
[RideDriverPage]
    → status: 'driver_en_route'
    → ETA countdown (5 min → 0)
    → When ETA = 0: status: 'driver_arrived'
    → User taps START TRIP
    ↓
[RideTripPage]
    → status: 'in_trip'
    → tripStartTime = Date.now()
    → Elapsed timer counting up
    → After 60s: END TRIP enabled
    → User taps END TRIP
    ↓
[Receipt Modal]
    → status: 'completed'
    → Show trip time, distance, fare
    → User rates + tips
    → User taps DONE
    ↓
dispatch(CLEAR_RIDE) → navigate to /ride
```

---

## No UI Changes

The visual design remains exactly the same:
- Same cards, buttons, colors, animations
- Same layout and typography
- Same map views and components

Only the underlying state management and timing logic changes.

---

## Testing Checklist

After implementation:

1. **Confirm Page**: Verify ride data saved to store on "Pay & Request"
2. **Searching**: Verify 3-second timer (not 6), driver assigned correctly
3. **Driver Page**: Verify ETA counts down from 5 min, "Driver arrived" shows at 0
4. **Trip Page**: Verify elapsed timer counts up, END TRIP disabled for 60 seconds
5. **Receipt**: Verify trip time and distance shown correctly
6. **Refresh**: At any step, refresh page and verify state persists
7. **Cancel**: Verify cancellation clears store and returns home

