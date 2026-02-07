
# Payment + Request Flow Update

## Summary

Modify the ride payment flow to use a two-stage status system:
1. When user taps "Pay & Request" → Create ride with `status='requested_unpaid'`
2. Redirect to payments app for checkout
3. When returning from payments app → Update status to `status='requested'`
4. Continue normal searching/dispatch flow

This ensures rides are only dispatched to drivers AFTER payment is confirmed.

---

## Current Flow

```text
User taps "Pay & Request"
        │
        ▼
Create ride (status='requested') ──► Auto-dispatch triggers immediately
        │
        ▼
Redirect to payments app
        │
        ▼
Return to /ride/searching
```

**Problem**: Auto-dispatch triggers BEFORE payment is completed.

---

## New Flow

```text
User taps "Pay & Request"
        │
        ▼
Create ride (status='requested_unpaid') ──► No auto-dispatch yet
        │
        ▼
Redirect to payments app
        │
        ▼
Payment succeeds, return to /ride/searching?rideId=xxx
        │
        ▼
Update ride (status='requested') ──► Auto-dispatch triggers NOW
        │
        ▼
Continue normal realtime flow
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabaseRide.ts` | Modify | Add status parameter to `createRideInDb`, add `updateRideStatusAndDispatch` function, update status mappings |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Pass `status='requested_unpaid'` when creating ride, skip auto-dispatch on creation |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Update ride status to `'requested'` and trigger dispatch on return from payments |

---

## Technical Details

### 1. Update supabaseRide.ts

Add `requested_unpaid` to status mappings:

```typescript
export const mapDbStatusToFrontend = (dbStatus: string): RideStatus => {
  const statusMap: Record<string, RideStatus> = {
    requested_unpaid: "searching",  // NEW - treat as searching but not dispatched
    requested: "searching",
    accepted: "assigned",
    // ... rest unchanged
  };
  return statusMap[dbStatus] || "idle";
};
```

Modify `createRideInDb` to accept initial status and skip auto-dispatch for unpaid:

```typescript
export interface CreateRideDbPayload {
  // ... existing fields ...
  initialStatus?: 'requested' | 'requested_unpaid';
}

export const createRideInDb = async (
  payload: CreateRideDbPayload,
  options: CreateRideOptions = {}
): Promise<CreateRideResult> => {
  // ... existing code ...
  
  const { data, error } = await supabase
    .from("trips")
    .insert({
      // ... existing fields ...
      status: payload.initialStatus || "requested",  // Use provided status
    })
    .select("id")
    .single();

  // Only trigger auto-dispatch if status is 'requested' (paid)
  if (payload.initialStatus !== 'requested_unpaid') {
    // Existing auto-dispatch logic
  }
  
  return data.id;
};
```

Add new function to update status and trigger dispatch:

```typescript
export const updateRideStatusAndDispatch = async (
  tripId: string
): Promise<UpdateRideResult> => {
  // Update status to 'requested'
  const { error } = await supabase
    .from("trips")
    .update({ status: "requested", updated_at: new Date().toISOString() })
    .eq("id", tripId);

  if (error) {
    return { success: false, error: categorizeError(error), attempts: 1 };
  }

  // Trigger auto-dispatch
  try {
    const dispatchResponse = await fetch(
      `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/auto-dispatch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ trip_id: tripId }),
      }
    );
    const dispatchResult = await dispatchResponse.json();
    console.log("[supabaseRide] Auto-dispatch result:", dispatchResult);
  } catch (dispatchError) {
    console.warn("[supabaseRide] Auto-dispatch failed:", dispatchError);
  }

  return { success: true, error: null, attempts: 1 };
};
```

### 2. Update RideConfirmPage.tsx

When calling `createRideInDb`, pass `requested_unpaid` as initial status:

```typescript
const result = await createRideInDb(
  {
    pickup,
    destination,
    pickupCoords,
    dropoffCoords,
    rideType: ride.id,
    price: finalPrice,
    distance: tripDetails?.distance || 0,
    duration: tripDetails?.duration || 0,
    initialStatus: PAYMENTS_APP_URL ? 'requested_unpaid' : 'requested',  // NEW
  },
  {
    enableRetry: true,
    maxAttempts: 3,
    onRetry: (attempt, retryError) => {
      console.log(`[RideConfirm] Retry attempt ${attempt}:`, retryError.message);
    },
  }
);
```

Key change: If payments app is configured, create with `requested_unpaid`. If not (demo/fallback mode), create with `requested` so dispatch works immediately.

### 3. Update RideSearchingPage.tsx

When returning from payments app, update status to trigger dispatch:

```typescript
import { fetchTripById, updateRideStatusAndDispatch } from "@/lib/supabaseRide";

// In the restore effect:
useEffect(() => {
  const rideIdFromUrl = searchParams.get("rideId");
  
  if (rideIdFromUrl && (!state.tripId || state.tripId !== rideIdFromUrl)) {
    setIsRestoring(true);
    
    // ... existing localStorage restore logic ...
    
    // After restoring state, update ride status to 'requested' and trigger dispatch
    const activateRide = async () => {
      const trip = await fetchTripById(rideIdFromUrl);
      
      if (trip) {
        // Restore UI state
        createRide({
          pickup: trip.pickup_address,
          destination: trip.dropoff_address,
          // ... rest unchanged
        });
        setTripId(rideIdFromUrl);
        
        // If ride was unpaid, now mark as paid and dispatch
        if (trip.status === 'requested_unpaid') {
          console.log("[RideSearching] Updating ride status after payment...");
          const result = await updateRideStatusAndDispatch(rideIdFromUrl);
          if (result.success) {
            console.log("[RideSearching] Ride activated and dispatch triggered");
          } else {
            toast.error("Failed to activate ride. Please try again.");
          }
        }
        
        localStorage.removeItem('zivo_pending_ride');
      } else {
        toast.error("Could not find ride details");
        navigate("/ride");
      }
      setIsRestoring(false);
    };
    
    activateRide();
  }
}, [searchParams, state.tripId]);
```

---

## Status Flow Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                    RIDE LIFECYCLE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [User taps Pay & Request]                              │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────────┐                                │
│  │  requested_unpaid   │  ← Ride created, no dispatch   │
│  └──────────┬──────────┘                                │
│             │ (redirect to payments)                    │
│             ▼                                           │
│  ┌─────────────────────┐                                │
│  │   PAYMENTS APP      │  ← External checkout           │
│  └──────────┬──────────┘                                │
│             │ (return with rideId)                      │
│             ▼                                           │
│  ┌─────────────────────┐                                │
│  │     requested       │  ← Status updated, dispatch!   │
│  └──────────┬──────────┘                                │
│             │ (auto-dispatch finds driver)              │
│             ▼                                           │
│  ┌─────────────────────┐                                │
│  │     accepted        │  ← Driver assigned             │
│  └──────────┬──────────┘                                │
│             │                                           │
│             ▼                                           │
│  ┌─────────────────────┐                                │
│  │    in_progress      │  ← Trip in progress            │
│  └──────────┬──────────┘                                │
│             │                                           │
│             ▼                                           │
│  ┌─────────────────────┐                                │
│  │     completed       │  ← Trip finished               │
│  └─────────────────────┘                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User abandons payment | Ride stays `requested_unpaid` - can be cleaned up by cron |
| User closes browser before returning | Ride stays `requested_unpaid` - no driver dispatched |
| Payments app URL not configured | Falls back to `requested` status, dispatch immediately (demo mode) |
| Network error updating status | Show error toast, user can retry by refreshing page |
| Auto-dispatch fails | Ride remains in `requested` - polling can retry later |

---

## No Changes To

- Database schema (using existing status column)
- UI design or button text
- Realtime subscription logic
- Driver assignment flow
- Trip completion/rating flow
