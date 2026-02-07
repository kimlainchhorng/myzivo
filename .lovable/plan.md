

# Prepare ZIVO Ride Backend Connection (Local Mock Structure)

## Overview

This update prepares the ride booking flow for real backend integration by introducing a structured local mock service that mimics database behavior. The current UI remains unchanged while we improve state handling and add proper data structures.

---

## Current State

| Component | Status |
|-----------|--------|
| `RideConfirmPage.tsx` | Already creates database records via `useCreateTrip` |
| `RideSearchingPage.tsx` | Has realtime hooks but auto-navigates after 6s anyway |
| `RideDriverPage.tsx` | Uses hardcoded mock driver data |
| `RideTripPage.tsx` | Uses localStorage, no database connection |
| `RideReceiptModal.tsx` | Mock fare breakdown, null safety added |

The system already has partial database integration, but the flow doesn't properly use database responses for the UI.

---

## What This Update Adds

### 1. Enhanced Ride Request Object

Create a unified `RideRequest` interface with all required fields:

```typescript
interface RideRequest {
  id: string;                    // uuid
  pickup_text: string;
  destination_text: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  ride_type: string;
  price: number;
  distance_miles: number;
  duration_min: number;
  status: 'requested' | 'assigned' | 'arrived' | 'in_trip' | 'completed' | 'cancelled';
  driver_id?: string;
  created_at: number;
  driver?: MockDriver;
}
```

### 2. Mock Backend Service

Create a new `src/services/mockRideService.ts`:

- `createRideRequest(data)` - Creates ride object with UUID and timestamp
- `getRide(id)` - Retrieves current ride state
- `updateRideStatus(id, status)` - Updates ride status
- `simulateDriverAssignment(id)` - Assigns mock driver after delay
- `getActiveRide()` - Returns current active ride or null

### 3. Searching Screen Improvements

On `/ride/searching`:
- Display searching animation (already exists)
- After 6 seconds, call `simulateDriverAssignment(rideId)`
- Update ride status to "assigned"
- Navigate to `/ride/driver` with full ride data

### 4. Driver Screen Improvements

On `/ride/driver`:
- Display mock driver info:
  - Name: "Marcus Johnson" 
  - Vehicle: "Toyota Camry"
  - Plate: "ABC 1234"
  - Rating: 4.9 stars
- ETA countdown (already exists)
- Functional buttons: Call, Message, Cancel
- Cancel updates ride status to "cancelled"

### 5. Receipt Improvements

After trip ends:
- Show receipt with:
  - Distance (from ride request)
  - Time (from ride request)
  - Price breakdown (already exists)
  - Interactive rating stars (already exists)
- "Done" clears ride state and returns to `/ride`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/mockRideService.ts` | Mock backend service with localStorage persistence |
| `src/types/ride.ts` | Unified ride types and interfaces |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ride/RideConfirmPage.tsx` | Use mock service instead of Supabase for now |
| `src/pages/ride/RideSearchingPage.tsx` | Call mock driver assignment after 6s |
| `src/pages/ride/RideDriverPage.tsx` | Load driver from ride state, show real data |
| `src/pages/ride/RideTripPage.tsx` | Update ride status during trip |
| `src/components/ride/RideReceiptModal.tsx` | Show distance/time from ride data |
| `src/hooks/useRideTripState.ts` | Extend to use new RideRequest structure |

---

## Technical Implementation

### Mock Ride Service Structure

```typescript
// src/services/mockRideService.ts

const STORAGE_KEY = "zivo_active_ride_request";

const mockDrivers = [
  {
    id: "driver_001",
    name: "Marcus Johnson",
    rating: 4.9,
    trips: 2847,
    car: "Toyota Camry",
    plate: "ABC 1234",
    avatar: "https://images.unsplash.com/...",
  },
  // Additional mock drivers for variety
];

export const createRideRequest = (data) => {
  const request = {
    id: crypto.randomUUID(),
    ...data,
    status: 'requested',
    created_at: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
  return request;
};

export const simulateDriverAssignment = async (rideId: string) => {
  // 6 second delay handled by caller
  const ride = getRide(rideId);
  if (ride) {
    const driver = mockDrivers[0];
    ride.status = 'assigned';
    ride.driver_id = driver.id;
    ride.driver = driver;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ride));
  }
  return ride;
};
```

### Updated Searching Flow

```typescript
// In RideSearchingPage.tsx
useEffect(() => {
  if (progress >= 100 && rideId) {
    // Simulate driver assignment
    const ride = simulateDriverAssignment(rideId);
    if (ride) {
      navigate("/ride/driver", { 
        state: { 
          ...state, 
          rideId: ride.id,
          driver: ride.driver 
        } 
      });
    }
  }
}, [progress, rideId]);
```

### Driver Page Uses Ride Data

```typescript
// In RideDriverPage.tsx
// Instead of hardcoded mockDriver:
const driver = state?.driver || getRide(rideId)?.driver || defaultMockDriver;
```

### Receipt Shows Trip Details

```typescript
// In RideReceiptModal.tsx
// Add props for distance and duration
interface RideReceiptModalProps {
  ride: RideOption;
  distanceMiles?: number;
  durationMin?: number;
  // ...existing props
}

// Display actual trip data
<div className="flex justify-between">
  <span>Distance ({distanceMiles?.toFixed(1)} mi)</span>
  <span>${distanceCost.toFixed(2)}</span>
</div>
```

---

## Data Flow

```text
[User selects ride] 
    ↓
[Confirm Page] → createRideRequest() → status: 'requested'
    ↓
[Searching Page] → 6s timer → simulateDriverAssignment() → status: 'assigned'
    ↓
[Driver Page] → Display driver info from ride.driver
    ↓
[Start Trip] → updateRideStatus('in_trip')
    ↓
[Trip Page] → Progress animation → updateRideStatus('completed')
    ↓
[Receipt Modal] → Show distance/time/price → clearRide()
    ↓
[Home]
```

---

## No UI Changes

All visual elements remain exactly as they are:
- Same animations and transitions
- Same card designs and layouts
- Same colors and typography
- Same button styles and interactions

Only the underlying state management and data structures are improved.

---

## Testing Checklist

After implementation:

1. Book a ride from `/ride` → Verify ride object created with UUID
2. Navigate through searching → Verify 6s timer and driver assignment
3. View driver page → Verify driver info displays correctly
4. Start and complete trip → Verify status updates
5. View receipt → Verify distance/time shown correctly
6. Click Done → Verify ride state cleared and returned home
7. Refresh at any step → Verify state persistence from localStorage

