
# Supabase Backend + Realtime Ride Status Integration

## Overview

This update adds Supabase backend integration to the ZIVO Ride system with realtime status updates, while keeping the current mock mode as a fallback when Supabase isn't configured.

## Current State Analysis

**Existing Infrastructure:**
- Supabase client already exists at `src/integrations/supabase/client.ts` with hardcoded credentials
- `trips` table exists with columns: `rider_id`, `driver_id`, `pickup_address`, `dropoff_address`, `pickup_lat/lng`, `dropoff_lat/lng`, `fare_amount`, `distance_km`, `duration_minutes`, `status`, `ride_type`, etc.
- Trip status enum: `requested`, `accepted`, `en_route`, `arrived`, `in_progress`, `completed`, `cancelled`
- Realtime hooks exist in `src/hooks/useTripRealtime.ts`
- RideStore exists with localStorage persistence

**Key Insight:** The database `trip_status` enum uses `accepted` while the frontend `RideStatus` uses `assigned`. These need to be mapped.

---

## Implementation Plan

### 1. Create Supabase Connection Utility

Create `src/lib/supabaseRide.ts` that:
- Exports a flag `isSupabaseConfigured` to check if Supabase is available
- Provides utility functions for ride operations
- Handles graceful fallback to mock mode

```text
┌──────────────────────────────────────────────┐
│            supabaseRide.ts                   │
├──────────────────────────────────────────────┤
│ isSupabaseConfigured: boolean                │
│ createRideInDb(rideData) → tripId            │
│ subscribeToRide(tripId, callbacks) → cleanup │
│ fetchDriverInfo(driverId) → DriverInfo       │
│ mapDbStatusToFrontend(dbStatus) → RideStatus │
└──────────────────────────────────────────────┘
```

### 2. Create Demo Mode Banner Component

Create `src/components/ride/DemoModeBanner.tsx`:
- Small, dismissible banner
- Shows "Demo mode (no backend)" when Supabase isn't configured
- Positioned at top of ride screens

### 3. Update Ride Store with DB Integration

Modify `src/stores/rideStore.tsx`:
- Add action `SET_RIDE_ID` to store database trip ID
- Add action `SYNC_FROM_DB` to update state from realtime updates
- Keep localStorage sync for persistence across refreshes

**Status Mapping:**
```text
Database → Frontend
──────────────────────
requested  → searching
accepted   → assigned
arrived    → arrived
in_progress → in_trip
completed  → completed
cancelled  → cancelled
```

### 4. Create useRideRealtime Hook

Create `src/hooks/useRideRealtime.ts`:
- Subscribe to trips table for specific `rideId`
- On status change → update RideStore
- On `driver_id` assignment → fetch driver info
- Handle navigation based on status changes
- Clean up subscription on unmount

```text
┌─────────────────────────────────────────────────────────┐
│ Realtime Flow                                          │
├─────────────────────────────────────────────────────────┤
│ 1. User books ride                                      │
│ 2. INSERT into trips (status='requested')              │
│ 3. Frontend subscribes to trip updates                 │
│ 4. Admin/system assigns driver → status='accepted'    │
│ 5. Realtime pushes update → Frontend navigates         │
│ 6. Driver arrives → status='arrived'                  │
│ 7. Trip starts → status='in_progress'                 │
│ 8. Trip ends → status='completed'                     │
└─────────────────────────────────────────────────────────┘
```

### 5. Update RideSearchingPage

Modify `src/pages/ride/RideSearchingPage.tsx`:
- If Supabase configured: Subscribe to realtime updates
- If status becomes `accepted` → assign driver, navigate to `/ride/driver`
- If status becomes `cancelled` → show toast, return to `/ride`
- Fallback: Keep existing 5-second mock simulation

### 6. Update RideDriverPage

Modify `src/pages/ride/RideDriverPage.tsx`:
- Subscribe to realtime updates for current ride
- Fetch driver info from `drivers` table when `driver_id` is set
- Update ETA based on driver location updates (future enhancement)
- Show "Waiting for driver..." if no driver assigned yet

### 7. Update RideTripPage

Modify `src/pages/ride/RideTripPage.tsx`:
- Subscribe to realtime status changes
- When status becomes `completed` → show receipt
- Keep trip timer and progress animation

### 8. Integration Points

**On "Pay & Request" (after payment success):**
1. Insert trip into `trips` table with status `requested`
2. Store `tripId` in RideStore and localStorage
3. Navigate to `/ride/searching?rideId=<id>`

**File Changes Summary:**
| File | Action |
|------|--------|
| `src/lib/supabaseRide.ts` | Create |
| `src/components/ride/DemoModeBanner.tsx` | Create |
| `src/hooks/useRideRealtime.ts` | Create |
| `src/stores/rideStore.tsx` | Modify |
| `src/pages/ride/RideSearchingPage.tsx` | Modify |
| `src/pages/ride/RideDriverPage.tsx` | Modify |
| `src/pages/ride/RideTripPage.tsx` | Modify |

---

## Technical Details

### Database Trip Insert
```typescript
// When creating a ride in Supabase
const { data, error } = await supabase
  .from("trips")
  .insert({
    rider_id: user?.id ?? null,
    pickup_address: pickup,
    pickup_lat: pickupCoords.lat,
    pickup_lng: pickupCoords.lng,
    dropoff_address: destination,
    dropoff_lat: dropoffCoords.lat,
    dropoff_lng: dropoffCoords.lng,
    fare_amount: price,
    distance_km: distance * 1.60934, // miles to km
    duration_minutes: duration,
    ride_type: rideType,
    status: "requested",
    payment_status: "paid",
  })
  .select()
  .single();
```

### Realtime Subscription
```typescript
// Subscribe to trip updates
const channel = supabase
  .channel(`ride-${tripId}`)
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "trips",
    filter: `id=eq.${tripId}`,
  }, (payload) => {
    const newStatus = payload.new.status;
    const driverId = payload.new.driver_id;
    // Handle status changes and driver assignment
  })
  .subscribe();
```

### Driver Info Fetch
```typescript
// Fetch driver when assigned
const { data: driver } = await supabase
  .from("drivers")
  .select("full_name, rating, vehicle_model, vehicle_plate, avatar_url, total_trips")
  .eq("id", driverId)
  .single();
```

---

## Mock Mode Fallback

When Supabase is not configured or unavailable:
- Show "Demo mode" banner
- Use existing localStorage + setTimeout simulation
- 5-second search → mock driver assigned → ETA countdown → trip
- All current functionality preserved

---

## No UI Changes

This update focuses purely on:
- Backend integration logic
- Realtime subscriptions
- State synchronization
- Graceful fallbacks

No visual or layout changes to existing screens.
