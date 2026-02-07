
# ZIVO Ride Real-Time Dispatch System

## Summary

Connect the existing rider app to Supabase real-time dispatch and add a complete driver-side experience. This builds on your existing `drivers` and `trips` tables, enabling:

- Riders request real trips stored in the database
- Drivers see incoming requests and accept them in real-time
- Both apps sync status updates via Supabase Realtime

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `drivers` table | Already exists with all needed fields |
| `trips` table | Already exists with all needed fields |
| Realtime hooks | Already implemented (`useTripRealtime.ts`) |
| Rider UI | Uses simulated data, not connected to database |
| Driver UI | Does not exist yet |

---

## Implementation Plan

### Phase 1: Database Enhancement

Add a new column to `trips` table for ride type:

```text
ride_type (text) - e.g., "standard", "black", "comfort"
```

Also, you may want to add a `rider_phone` column if it doesn't exist (currently only `customer_phone` is used for guest bookings).

---

### Phase 2: New Routes to Create

| Route | Purpose |
|-------|---------|
| `/driver` | Driver home with online toggle |
| `/driver/login` | Driver authentication |
| `/driver/trips` | Incoming requests + active trip |
| `/admin/dispatch` | Admin dispatch dashboard |

---

### Phase 3: Rider App Integration

Modify the existing rider flow to write to the database:

**A) When user taps "Pay & Request" (in `Rides.tsx` or `RideConfirmPage.tsx`):**

1. Insert a row into `trips` table:
   - pickup_text, dest_text, pickup/dropoff lat/lng
   - ride_type, fare_amount, distance_km, duration_minutes
   - status = 'requested'
   - customer_name, customer_phone (or rider_id if logged in)

2. Save the `trip_id` to localStorage

3. Navigate to `/ride/searching?tripId=<id>`

**B) Update `/ride/searching` page:**

1. Subscribe (realtime) to the trip row by tripId
2. When status becomes 'accepted', navigate to `/ride/driver?tripId=<id>`
3. Fetch driver info by joining via driver_id → drivers table

**C) Update `/ride/driver` page:**

1. Subscribe (realtime) to the drivers row for the assigned driver
2. Update UI with driver name, car, plate, rating, ETA
3. Move driver marker using drivers.current_lat/current_lng
4. Cancel button → update trips.status='cancelled'

**D) Status flow:**

- 'arrived' → show "Driver arrived"
- 'in_progress' → show trip screen
- 'completed' → show receipt

---

### Phase 4: Driver App Implementation

**A) Driver Authentication (`/driver/login`):**

- Supabase Auth login for drivers
- On first login, upsert into drivers table with user_id, name, phone, car_model, plate
- Check if driver record exists for user_id

**B) Driver Home (`/driver`):**

- Show "Go Online / Go Offline" toggle → updates `drivers.is_online`
- When online, start location updates every 5 seconds:
  - Use browser geolocation if allowed
  - If denied, simulate location with small random movement
  - Update `drivers.current_lat`, `drivers.current_lng`

**C) Incoming Requests (`/driver/trips`):**

- Subscribe to `trips` where `status='requested'` (realtime)
- Show list of available trips with pickup/dropoff, fare, distance
- Accept button:
  - Update `trips.status='accepted'`
  - Set `trips.driver_id` to current driver id
  - Show active ride details

**D) Active Ride Controls:**

- "Arrived" → `trips.status='arrived'`
- "Start Trip" → `trips.status='in_progress'`
- "Complete Trip" → `trips.status='completed'`
- "Cancel" → `trips.status='cancelled'`

---

### Phase 5: Admin Dispatch (`/admin/dispatch`)

Simple dispatch dashboard showing:

- Map with online drivers (using existing `useOnlineDrivers` hook)
- List of requested rides
- Button: "Assign nearest driver" with basic distance logic
- On assign: set `ride.driver_id` + `status='accepted'`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/driver/DriverHomePage.tsx` | Main driver dashboard |
| `src/pages/driver/DriverLoginPage.tsx` | Driver authentication |
| `src/pages/driver/DriverTripsPage.tsx` | Incoming + active trips |
| `src/pages/admin/DispatchPage.tsx` | Admin dispatch view |
| `src/hooks/useDriverApp.ts` | Driver-specific hooks (location, status) |
| `src/hooks/useRiderTrip.ts` | Rider trip management |
| `src/components/driver/DriverOnlineToggle.tsx` | Online/offline toggle |
| `src/components/driver/TripRequestCard.tsx` | Incoming trip card |
| `src/components/driver/ActiveTripCard.tsx` | Active trip controls |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add new routes |
| `src/pages/Rides.tsx` | Insert trip to DB on request |
| `src/pages/ride/RideSearchingPage.tsx` | Subscribe to trip realtime |
| `src/pages/ride/RideDriverPage.tsx` | Subscribe to driver location realtime |
| `src/pages/ride/RideTripPage.tsx` | Subscribe to trip status realtime |

---

## Technical Details

### Database Migration

```sql
-- Add ride_type column if not exists
ALTER TABLE trips ADD COLUMN IF NOT EXISTS ride_type TEXT;
```

### Realtime Subscriptions

The project already has realtime enabled for `trips` and `drivers` tables. The existing hooks in `useTripRealtime.ts` will be reused:

- `useTripRealtime(tripId)` - for rider watching their trip
- `useDriverTripRealtime(driverId)` - for driver watching assignments
- `useDriverLocationRealtime(driverId, callback)` - for rider watching driver location

### Location Updates (Driver)

```typescript
// Update driver location every 5 seconds
navigator.geolocation.watchPosition(
  (position) => {
    supabase.from('drivers').update({
      current_lat: position.coords.latitude,
      current_lng: position.coords.longitude,
      updated_at: new Date().toISOString()
    }).eq('id', driverId);
  },
  (error) => {
    // Fallback to simulated location
  }
);
```

### Trip Status Flow

```text
requested → accepted → en_route → arrived → in_progress → completed
                                                        ↘ cancelled
```

---

## Security Considerations

- Driver routes protected by auth check (must be logged in + have driver record)
- RLS policies already exist for trips and drivers tables
- Drivers can only update trips they are assigned to
- Riders can only cancel their own trips

---

## Testing Recommendations

After implementation:
1. Test rider flow: request ride → see searching → driver accepts → see driver approach → complete trip
2. Test driver flow: login → go online → receive request → accept → navigate through statuses
3. Test realtime: open rider and driver in separate tabs, verify instant updates
4. Test location: verify driver marker moves on rider's map
5. Test admin dispatch: verify manual driver assignment works
