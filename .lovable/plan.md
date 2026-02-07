
# Connect ZIVO Ride to Supabase trips table + Realtime Updates

## Summary

This update completes the connection between the in-app ride flow and the Supabase `trips` table. Most of the infrastructure is already in place - the key missing piece is the database insert when a user confirms a ride.

## Current State (Already Implemented)

| Component | Status |
|-----------|--------|
| Supabase client | Already exists at `src/integrations/supabase/client.ts` |
| Database utilities | `src/lib/supabaseRide.ts` has `createRideInDb()`, `subscribeToRide()` |
| Realtime hook | `src/hooks/useRideRealtime.ts` handles subscriptions |
| RideStore | Has `tripId` support and `setTripId()` action |
| Searching/Driver/Trip pages | Already use the realtime hook |

## What's Missing

The `RideConfirmPage.tsx` creates a local ride in the store but **does not insert into the database**. This means:
- No trip record is created in `trips` table
- Realtime subscriptions have no `tripId` to subscribe to
- Admin dashboard can't see new ride requests

---

## Implementation Plan

### 1. Update RideConfirmPage to Insert Trip in Database

**File:** `src/pages/ride/RideConfirmPage.tsx`

Modify `handleConfirm()` to:
1. Call `createRideInDb()` to insert trip in Supabase
2. Store the returned `tripId` in the ride store
3. Continue to searching page

```text
Before:
┌─────────────────────────────────────┐
│ User taps "Pay & Request"           │
│           ↓                         │
│ createRide() → local store only     │
│           ↓                         │
│ Navigate to /ride/searching         │
│           ↓                         │
│ No tripId → runs in demo mode       │
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│ User taps "Pay & Request"           │
│           ↓                         │
│ createRideInDb() → trips table      │
│           ↓                         │
│ Store tripId in rideStore           │
│           ↓                         │
│ Navigate to /ride/searching         │
│           ↓                         │
│ Realtime subscribes to trip updates │
└─────────────────────────────────────┘
```

### 2. Add Authenticated User ID Support

**File:** `src/lib/supabaseRide.ts`

Update `createRideInDb()` to:
- Accept optional `rider_id` parameter
- Get current auth user ID if available
- Include user ID in trip insert

### 3. Update CreateRideDbPayload Interface

Add fields for:
- `riderId` - optional authenticated user ID
- `pickupCoords` and `dropoffCoords` - currently optional, ensure they're passed

### 4. Handle Insert Errors Gracefully

In `RideConfirmPage.tsx`:
- If database insert fails, continue with demo mode (show warning)
- Log error for debugging
- Still navigate to searching page

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Add database insert before navigating to searching |
| `src/lib/supabaseRide.ts` | Modify | Add auth user ID support to `createRideInDb()` |

---

## Technical Details

### Updated handleConfirm in RideConfirmPage

```typescript
const handleConfirm = async () => {
  // Create ride in local store first
  createRide({ ... });

  // Try to insert into database
  const tripId = await createRideInDb({
    pickup,
    destination,
    pickupCoords,
    dropoffCoords,
    rideType: ride.id,
    price: displayPrice,
    distance: tripDetails?.distance || 0,
    duration: tripDetails?.duration || 0,
  });

  // If successful, store the tripId for realtime
  if (tripId) {
    setTripId(tripId);
  }

  // Navigate to searching
  navigate("/ride/searching");
};
```

### Updated createRideInDb

```typescript
export const createRideInDb = async (payload: CreateRideDbPayload): Promise<string | null> => {
  // Get current auth user if available
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("trips")
    .insert({
      rider_id: user?.id ?? null,
      pickup_address: payload.pickup,
      dropoff_address: payload.destination,
      pickup_lat: payload.pickupCoords?.lat,
      pickup_lng: payload.pickupCoords?.lng,
      dropoff_lat: payload.dropoffCoords?.lat,
      dropoff_lng: payload.dropoffCoords?.lng,
      // ... rest of fields
    })
    .select("id")
    .single();

  return data?.id ?? null;
};
```

---

## Flow After Implementation

```text
User Flow:
1. User selects ride, enters payment → /ride/confirm
2. User taps "Pay & Request"
3. Trip inserted into `trips` table (status='requested')
4. tripId stored in rideStore + localStorage
5. Navigate to /ride/searching
6. Realtime subscription starts for this trip
7. Admin assigns driver → status='accepted', driver_id set
8. Realtime pushes update → frontend navigates to /ride/driver
9. Driver info fetched from `drivers` table
10. Trip progresses through arrived → in_progress → completed
```

## Mock Mode Fallback

If database insert fails:
- Warning logged to console
- Demo mode banner shows
- 5-second mock simulation runs instead of realtime
- All current functionality preserved
