

# Real-Time Driver Tracking for Eats Orders

## Overview
Implement live driver location tracking on the customer order page with a moving map marker, ETA countdown, and stale location fallback handling.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `drivers` table | ✅ Complete | Has `current_lat`, `current_lng`, `is_online`, `last_active_at` |
| `driver_locations` table | ✅ Exists | Columns: `driver_id`, `lat`, `lng`, `heading`, `speed`, `updated_at` (one row per driver) |
| `update-driver-location` edge function | ✅ Complete | GPS spoof detection, updates `drivers.current_lat/lng` and `driver_location_history` |
| `useDriverLocationTracking` hook | ✅ Complete | Tracks location via watchPosition, 5-second interval |
| `useEatsDriver` hook | ✅ Complete | Fetches driver info + subscribes to realtime updates on `drivers` table |
| `DeliveryMap` component | ✅ Complete | Google Maps with driver marker, delivery marker, bounds fitting |
| `DriverInfoCard` component | ✅ Complete | Shows driver name, rating, vehicle, call button |
| `EatsOrderDetail` page | ✅ Complete | Already shows map, driver card, and ETA from order |
| `EatsOrderCard` (driver) | ✅ Complete | Has Google Maps navigation button |
| Google Maps Provider | ✅ Complete | Central provider with API key management |
| `food_orders.eta_minutes` | ✅ Exists | Set by dispatch function |

### Missing / Needs Enhancement
| Feature | Status |
|---------|--------|
| Driver location upsert to `driver_locations` | ❌ Edge function only updates `drivers` table, not `driver_locations` |
| Realtime subscription on `driver_locations` | ❌ `useEatsDriver` subscribes to `drivers` table, should use `driver_locations` for faster updates |
| ETA countdown component | ❌ No arrival countdown timer on order page |
| Dynamic ETA recalculation | ❌ ETA is static once set, doesn't update based on live position |
| Stale location indicator | ❌ No "Updating location..." fallback message |
| Driver location update frequency | ⚠️ Currently uses watchPosition (variable); need 10-15 second throttle |
| Status-based subscription control | ⚠️ Subscription runs always; should only run for `out_for_delivery` status |

---

## Implementation Plan

### A) Update Edge Function to Write to `driver_locations`

Modify `update-driver-location` to also upsert the `driver_locations` table with latest position.

**File to Modify:** `supabase/functions/update-driver-location/index.ts`

**Changes:**
```typescript
// After updating drivers table, also upsert driver_locations for realtime tracking
await supabaseAdmin
  .from("driver_locations")
  .upsert({
    driver_id: driverId,
    lat,
    lng,
    heading: heading ?? null,
    speed: speed ?? null,
    updated_at: nowISO(),
  }, { onConflict: "driver_id" });
```

This ensures one row per driver with their latest location, enabling efficient realtime subscriptions.

### B) Create `useLiveDriverLocation` Hook

A dedicated hook for real-time driver location tracking with stale detection.

**File to Create:** `src/hooks/useLiveDriverLocation.ts`

**Features:**
- Subscribe to `driver_locations` table filtered by `driver_id`
- Track `lastUpdatedAt` timestamp
- Detect stale location (> 60 seconds since last update)
- Only subscribe when order status is `out_for_delivery`
- Return `{ lat, lng, heading, isStale, lastUpdatedAt }`

**Implementation:**
```typescript
export function useLiveDriverLocation(
  driverId: string | null | undefined,
  orderStatus: string | undefined
) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  // Only track when order is out_for_delivery
  const shouldTrack = driverId && orderStatus === "out_for_delivery";
  
  useEffect(() => {
    if (!shouldTrack) {
      setLocation(null);
      return;
    }
    
    // Initial fetch
    const fetchLocation = async () => {
      const { data } = await supabase
        .from("driver_locations")
        .select("lat, lng, heading, speed, updated_at")
        .eq("driver_id", driverId)
        .maybeSingle();
      
      if (data) setLocation(data);
    };
    fetchLocation();
    
    // Realtime subscription
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.new) {
            setLocation(payload.new as DriverLocation);
            setIsStale(false);
          }
        }
      )
      .subscribe();
    
    // Stale detection interval (check every 10 seconds)
    const staleInterval = setInterval(() => {
      if (location?.updated_at) {
        const age = Date.now() - new Date(location.updated_at).getTime();
        setIsStale(age > 60000); // > 60 seconds
      }
    }, 10000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(staleInterval);
    };
  }, [driverId, shouldTrack]);
  
  return { location, isStale };
}
```

### C) Create ETA Countdown Component

A countdown timer that shows minutes until arrival, updating every minute.

**File to Create:** `src/components/eats/EtaCountdown.tsx`

**Features:**
- Display minutes remaining based on `eta_dropoff` timestamp
- Update every minute
- Show "Arriving soon!" when under 2 minutes
- Animate countdown changes
- Optional: Recalculate based on live driver distance

**UI:**
```text
┌─────────────────────────────────────┐
│ 🕐 Arriving in                      │
│                                     │
│         12 min                      │
│                                     │
│ Updated 30 seconds ago              │
└─────────────────────────────────────┘
```

**Props:**
```typescript
interface EtaCountdownProps {
  etaDropoff: string | null;  // ISO timestamp when driver should arrive
  driverLat?: number | null;  // For dynamic recalculation
  driverLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  className?: string;
}
```

### D) Enhance DeliveryMap with Live Tracking

Update the `DeliveryMap` component for smoother live tracking.

**File to Modify:** `src/components/eats/DeliveryMap.tsx`

**Changes:**
1. Add restaurant marker (third marker type)
2. Add stale location indicator overlay
3. Smooth marker animation using CSS/Framer Motion
4. Add driver heading rotation to marker

**Props Update:**
```typescript
interface DeliveryMapProps {
  // Existing
  driverLat?: number | null;
  driverLng?: number | null;
  deliveryLat?: number;
  deliveryLng?: number;
  // New
  restaurantLat?: number;
  restaurantLng?: number;
  driverHeading?: number | null;
  isLocationStale?: boolean;
  className?: string;
}
```

**New Features:**
- Restaurant marker (orange/red)
- Driver heading rotation on arrow marker
- Stale overlay: "Updating location..." when `isLocationStale` is true

### E) Update EatsOrderDetail Page

Integrate live tracking and countdown into the order detail page.

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Import and use `useLiveDriverLocation` hook
2. Add `EtaCountdown` component to hero section
3. Pass live location to `DeliveryMap`
4. Add stale location warning banner
5. Only show map when status is active (`confirmed` through `out_for_delivery`)

**Integration:**
```typescript
// Use live driver location instead of static driver query
const { location: driverLocation, isStale } = useLiveDriverLocation(
  order?.driver_id,
  order?.status
);

// Pass to DeliveryMap
<DeliveryMap
  driverLat={driverLocation?.lat}
  driverLng={driverLocation?.lng}
  driverHeading={driverLocation?.heading}
  restaurantLat={order?.restaurants?.lat}
  restaurantLng={order?.restaurants?.lng}
  deliveryLat={order?.delivery_lat}
  deliveryLng={order?.delivery_lng}
  isLocationStale={isStale}
/>

// Show ETA countdown when driver is assigned
{order.driver_id && order.eta_dropoff && (
  <EtaCountdown
    etaDropoff={order.eta_dropoff}
    driverLat={driverLocation?.lat}
    driverLng={driverLocation?.lng}
    deliveryLat={order.delivery_lat}
    deliveryLng={order.delivery_lng}
  />
)}

// Stale warning banner
{isStale && order.status === "out_for_delivery" && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
    <p className="text-sm text-yellow-400">
      Updating driver location...
    </p>
  </div>
)}
```

### F) Throttle Driver Location Updates

Ensure driver app sends location updates every 10-15 seconds (not more frequently).

**File to Modify:** `src/hooks/useDriverApp.ts`

The current `useDriverLocationTracking` uses `navigator.geolocation.watchPosition` which can fire very frequently. Add throttling:

**Changes:**
```typescript
// Add throttle ref
const lastUpdateRef = useRef<number>(0);
const UPDATE_INTERVAL_MS = 12000; // 12 seconds

// In watchPosition callback
const id = navigator.geolocation.watchPosition(
  (position) => {
    const now = Date.now();
    
    // Throttle to every 12 seconds
    if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) {
      return;
    }
    lastUpdateRef.current = now;
    
    updateLocation({
      driverId,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      accuracy: position.coords.accuracy,
    });
  },
  // ... error handler
);
```

### G) Add Dynamic ETA Recalculation (Optional Enhancement)

Calculate updated ETA based on live driver distance.

**Logic (client-side):**
```typescript
// Haversine distance calculation
function calculateDistanceMiles(lat1, lng1, lat2, lng2): number

// ETA calculation
const AVG_SPEED_MILES_PER_MIN = 0.5; // ~30 mph

const remainingDistance = calculateDistanceMiles(
  driverLat, driverLng,
  deliveryLat, deliveryLng
);
const dynamicEtaMinutes = Math.ceil(remainingDistance / AVG_SPEED_MILES_PER_MIN);
```

This can be shown alongside or instead of the static `eta_dropoff` timestamp.

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useLiveDriverLocation.ts` | Realtime subscription to driver_locations with stale detection |
| `src/components/eats/EtaCountdown.tsx` | Arrival countdown timer component |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/functions/update-driver-location/index.ts` | Add upsert to `driver_locations` table |
| `src/components/eats/DeliveryMap.tsx` | Add restaurant marker, heading rotation, stale overlay |
| `src/pages/EatsOrderDetail.tsx` | Integrate live location hook, ETA countdown, stale warning |
| `src/hooks/useDriverApp.ts` | Add 12-second throttle to location updates |

---

## Data Flow

```text
Driver App
    ↓
watchPosition() fires (browser GPS)
    ↓
Throttle check (12 seconds since last)
    ↓
Call update-driver-location edge function
    ↓
Edge function updates:
  1. drivers.current_lat/lng
  2. driver_location_history (insert)
  3. driver_locations (upsert) ← NEW
    ↓
Supabase Realtime fires on driver_locations
    ↓
Customer's useLiveDriverLocation receives update
    ↓
DeliveryMap re-renders with new marker position
    ↓
EtaCountdown recalculates remaining time
```

---

## Stale Location Handling

```text
Last location update received
    ↓
Start 10-second check interval
    ↓
If (now - updated_at) > 60 seconds:
  - Set isStale = true
  - Show "Updating location..." overlay on map
  - Keep showing last known position
    ↓
When new location arrives:
  - Set isStale = false
  - Hide overlay
  - Update marker
```

---

## Performance Considerations

1. **Throttling**: Driver updates limited to every 12 seconds to reduce database writes and realtime traffic
2. **Conditional Subscription**: Only subscribe to realtime when `status = "out_for_delivery"`
3. **Single Row Table**: `driver_locations` uses upsert with one row per driver, making queries O(1)
4. **Client-side ETA**: Calculate remaining time client-side to avoid server roundtrips
5. **Cleanup**: Properly unsubscribe from realtime channels on unmount

---

## Summary

This implementation adds:

1. **Live Location Streaming**: Driver positions upserted to `driver_locations` every 12 seconds
2. **Realtime Subscription**: Customer order page subscribes to driver location updates
3. **ETA Countdown**: Minutes-remaining timer that updates based on time and optionally recalculates from distance
4. **Stale Detection**: Shows "Updating location..." if no update received in 60 seconds
5. **Enhanced Map**: Restaurant marker, driver heading rotation, stale overlay
6. **Throttled Updates**: Driver app limited to one update per 12 seconds for performance
7. **Conditional Tracking**: Only track when order status is `out_for_delivery`

