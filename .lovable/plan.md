

# Rider Trip Progress Bar + Auto-Completion

## Summary

Add real-time trip progress calculation based on driver location to the `/ride/trip` page. Calculate progress as the ratio of distance traveled vs total trip distance, update as driver moves, and auto-complete the ride when driver is within 100 meters of the destination.

---

## Current Behavior

| Feature | Current | Issue |
|---------|---------|-------|
| Trip progress | Based on elapsed time (120s simulation) | Not using real driver location |
| Driver location tracking | Not subscribed on trip page | Missing real-time updates |
| Auto-completion | Manual "END TRIP" button only | No proximity-based detection |
| Progress display | Shows percentage from timer | Inaccurate to actual position |

---

## Implementation Approach

### 1. Subscribe to Driver Location on Trip Page

Use existing `useDriverLocationRealtime` hook to track driver's `current_lat`/`current_lng` during the trip.

### 2. Calculate Real Trip Progress

When driver location updates:
- Calculate `totalDistance` = haversine(pickup, destination)
- Calculate `remainingDistance` = haversine(driver, destination)
- Progress = `(1 - remainingDistance / totalDistance) * 100`

### 3. Auto-Complete Trip at Arrival

If `remainingDistance < 0.0621 miles` (100 meters):
- Automatically trigger `handleEndTrip()`
- Show receipt screen

### 4. Keep Existing UI

Only modify the progress calculation logic - keep the existing progress bar, ETA display, and layout unchanged.

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ride/RideTripPage.tsx` | Modify | Add driver location subscription, real progress calc, auto-complete |

---

## Technical Details

### Distance Calculation

Uses the existing `haversineMiles` function from `src/services/mapsApi.ts`:

```typescript
import { haversineMiles } from "@/services/mapsApi";

// Total trip distance (pickup → destination)
const totalDistance = haversineMiles(
  pickupLocation.lat, pickupLocation.lng,
  destinationLocation.lat, destinationLocation.lng
);

// Remaining distance (driver → destination)  
const remainingDistance = haversineMiles(
  driverLat, driverLng,
  destinationLocation.lat, destinationLocation.lng
);

// Progress percentage (0 to 1)
const progress = Math.max(0, Math.min(1, 1 - (remainingDistance / totalDistance)));
```

### Auto-Complete Threshold

```typescript
// 100 meters = 0.0621 miles
const ARRIVAL_THRESHOLD_MILES = 0.0621;

if (remainingDistance <= ARRIVAL_THRESHOLD_MILES && !hasAutoCompleted) {
  setHasAutoCompleted(true);
  handleEndTrip();
}
```

### Driver Location Handler

```typescript
const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
const [hasAutoCompleted, setHasAutoCompleted] = useState(false);

const handleDriverLocationUpdate = useCallback((lat: number, lng: number) => {
  setDriverLocation({ lat, lng });
  
  // Calculate progress
  const total = haversineMiles(
    pickupLocation.lat, pickupLocation.lng,
    destinationLocation.lat, destinationLocation.lng
  );
  
  const remaining = haversineMiles(
    lat, lng,
    destinationLocation.lat, destinationLocation.lng
  );
  
  const newProgress = Math.max(0, Math.min(1, 1 - (remaining / total)));
  setTripProgress(newProgress);
  
  // Update car position for map
  // (existing interpolation logic remains for smooth animation)
  
  // Auto-complete check
  if (remaining <= ARRIVAL_THRESHOLD_MILES && !hasAutoCompleted) {
    setHasAutoCompleted(true);
    toast.success("You've arrived at your destination!");
    handleEndTrip();
  }
}, [pickupLocation, destinationLocation, hasAutoCompleted, handleEndTrip]);

// Subscribe to driver location
useDriverLocationRealtime(
  isDemoMode ? undefined : state.driver?.id,
  handleDriverLocationUpdate
);
```

---

## Data Flow

```text
Driver updates location
        │
        ▼
Supabase `drivers` table updated
        │
        ▼
useDriverLocationRealtime fires callback
        │
        ▼
handleDriverLocationUpdate called with new lat/lng
        │
        ├───────────────────────────────────────┐
        ▼                                       ▼
Calculate remaining distance            Update car position
to destination (Haversine)              on map (existing logic)
        │
        ▼
Progress = 1 - (remaining / total)
        │
        ├─────────────────────────────┐
        ▼                             ▼
Update progress bar UI        Check if remaining < 100m
                                      │
                                      ▼
                              Auto-complete trip
                              + Show receipt
```

---

## Demo Mode Fallback

When in demo mode (no real driver tracking):
- Keep existing timer-based progress simulation
- The 120-second simulated trip continues to work

```typescript
// Only use realtime if not in demo mode and driver ID exists
useDriverLocationRealtime(
  isDemoMode ? undefined : state.driver?.id,
  handleDriverLocationUpdate
);

// Fallback to timer-based progress in demo mode
useEffect(() => {
  if (isDemoMode || !state.driver?.id) {
    // Existing timer simulation
    const simulatedDuration = 120;
    const newProgress = Math.min(1, elapsed / simulatedDuration);
    setTripProgress(newProgress);
  }
}, [isDemoMode, state.driver?.id, elapsed]);
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Driver ID not available | Fall back to timer-based progress |
| Demo mode | Continue using elapsed time simulation |
| totalDistance = 0 | Set progress to 0 (prevent division by zero) |
| Driver overshoots destination | Cap progress at 100% |
| Already auto-completed | Prevent duplicate completion via `hasAutoCompleted` flag |
| Page reload during trip | Recalculate progress from current positions |

---

## UI Changes (None)

The existing progress bar and layout remain unchanged. Only the data source changes:

**Before:** `progress = elapsed / 120` (time-based)  
**After:** `progress = 1 - (remaining / total)` (distance-based)

---

## No Changes To

- Progress bar styling
- Trip status banner
- ETA display logic
- End trip button behavior
- Receipt modal
- Map visualization
- Bottom navigation

