

# Rider ETA + Arrival Behavior Update

## Summary

Add real-time driver ETA calculation and arrival banner to the `/ride/driver` page. When the driver's status becomes `arrived`, show a prominent banner. Calculate and update ETA based on driver's real-time location and distance to pickup using 30 mph average speed.

---

## Current Behavior

| Feature | Current | Issue |
|---------|---------|-------|
| Status subscription | ✅ Via `useRideRealtime` | Already handles `arrived` toast |
| ETA display | Static countdown from 300s | Doesn't use real driver location |
| Driver location tracking | Not subscribed on rider side | No real-time updates |
| Arrival banner | Toast only | No persistent visual |

---

## Implementation Approach

### 1. Extend DriverInfo to Include ID

Add `id` to `DriverInfo` so we can subscribe to driver location updates.

### 2. Modify useRideRealtime to Provide Driver ID

Return the driver ID from the realtime hook so the page can subscribe to location updates.

### 3. Add Driver Location Subscription to RideDriverPage

Use the existing `useDriverLocationRealtime` hook to subscribe to driver's `current_lat`/`current_lng` updates.

### 4. Calculate ETA from Distance

When driver location updates:
- Calculate distance to pickup using Haversine formula
- Assume 30 mph average speed
- Update ETA in minutes

### 5. Add Arrival Banner

When status becomes `arrived`, show a fixed banner at top of card (not a toast).

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/rideTypes.ts` | Modify | Add `id?: string` to `DriverInfo` interface |
| `src/lib/supabaseRide.ts` | Modify | Return driver `id` in `fetchDriverInfo` |
| `src/stores/rideStore.tsx` | Modify | Store driver ID in state |
| `src/hooks/useRideRealtime.ts` | Modify | Return driver ID for location subscription |
| `src/pages/ride/RideDriverPage.tsx` | Modify | Add location subscription, ETA calc, arrival banner |

---

## Technical Details

### DriverInfo Extension

```typescript
// src/types/rideTypes.ts
export interface DriverInfo {
  id?: string;  // NEW: Driver ID for location tracking
  name: string;
  car: string;
  plate: string;
  rating: number;
  avatar?: string;
  trips?: number;
}
```

### fetchDriverInfo Update

```typescript
// src/lib/supabaseRide.ts
export const fetchDriverInfo = async (driverId: string): Promise<DriverInfo | null> => {
  const { data, error } = await supabase
    .from("drivers")
    .select("id, full_name, rating, vehicle_model, vehicle_plate, avatar_url, total_trips")
    .eq("id", driverId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,  // NEW
    name: data.full_name,
    rating: data.rating || 4.8,
    car: data.vehicle_model || "Vehicle",
    plate: data.vehicle_plate,
    avatar: data.avatar_url || undefined,
    trips: data.total_trips || 0,
  };
};
```

### Haversine Distance Function (Client-Side)

```typescript
// Add to RideDriverPage or a utility file
const haversineMiles = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3958.8; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
```

### ETA Calculation Logic

```typescript
// In RideDriverPage
const ASSUMED_SPEED_MPH = 30;

// When driver location updates:
const handleDriverLocationUpdate = useCallback((lat: number, lng: number) => {
  setRealTimeDriverLocation({ lat, lng });
  
  if (pickupLocation) {
    const distanceMiles = haversineMiles(lat, lng, pickupLocation.lat, pickupLocation.lng);
    const etaMinutes = Math.ceil((distanceMiles / ASSUMED_SPEED_MPH) * 60);
    updateEta(Math.max(0, etaMinutes * 60)); // Convert to seconds for store
  }
}, [pickupLocation, updateEta]);

// Subscribe to driver location
useDriverLocationRealtime(driverId, handleDriverLocationUpdate);
```

### Arrival Banner Component

```typescript
// Inline in RideDriverPage (no new component per spec)
{state.status === 'arrived' && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-green-500 text-white text-center py-3 px-4 font-semibold text-lg"
  >
    🚗 Your driver has arrived
  </motion.div>
)}
```

---

## Data Flow

```text
Driver updates location (via edge function)
        │
        ▼
Supabase `drivers` table updated
        │
        ▼
Realtime subscription fires in useDriverLocationRealtime
        │
        ▼
handleDriverLocationUpdate called with new lat/lng
        │
        ▼
Calculate distance to pickup (Haversine)
        │
        ▼
ETA = (distance_miles / 30 mph) * 60 minutes
        │
        ▼
Update RideStore ETA → UI re-renders
```

---

## UI Changes (Minimal)

### Current ETA Display (Unchanged Layout)
The existing ETA display component stays the same, just uses the new calculated value.

### New Arrival Banner (Added)
A simple green banner above the driver card when `status === 'arrived'`.

```text
┌─────────────────────────────────────┐
│  🚗 Your driver has arrived         │  ← NEW banner (green bg)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [Driver Card - existing layout]    │
│  ...                                │
└─────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Driver ID not available | Fall back to existing countdown logic |
| Driver location null | Keep showing last calculated ETA |
| Distance < 0.1 miles | Show "Arriving now" instead of "0 min" |
| Demo mode (no realtime) | Continue using existing mock countdown |
| Status already arrived on page load | Show banner immediately |

---

## No Changes To

- DriverMapView component
- Map visualization
- Action buttons
- Trip summary section
- Bottom navigation

