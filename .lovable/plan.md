

# Add Retry Logic to Driver-Side Database Operations

## Summary

Add exponential backoff retry logic to all critical driver-side database operations, ensuring drivers don't miss ride opportunities or lose earnings due to transient network issues.

## Current State

| Operation | Current Handling | Issue |
|-----------|------------------|-------|
| Accept Trip | Single attempt, error toast | Driver may lose ride opportunity |
| Update Trip Status | Single attempt, error toast | Trip lifecycle gets stuck |
| Update Location | Single attempt, console error | Driver appears "frozen" to riders |
| Toggle Online/Offline | Single attempt, error toast | Driver status not synced |
| Create Profile | Single attempt, returns null | Signup may silently fail |

## Implementation Approach

### 1. Enhanced Driver Database Utilities

Create a new `src/lib/supabaseDriverOperations.ts` file with retry-enabled versions of all driver operations, following the same pattern as `supabaseRide.ts`.

### 2. Updated Driver Hooks with Retry

Modify the React Query mutations in `useDriverApp.ts` to use the new retry-enabled functions and provide better error feedback.

### 3. Location Update with Silent Retry

Special handling for location updates - retry silently with shorter delays since these are high-frequency and shouldn't interrupt the driver.

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabaseDriverOperations.ts` | Create | Retry-enabled driver database operations |
| `src/hooks/useDriverApp.ts` | Modify | Use new retry functions, add error states |
| `src/lib/supabaseDriver.ts` | Modify | Add retry to upsertDriverProfile |
| `src/components/driver/TripRequestCard.tsx` | Modify | Show retry button on failure |
| `src/components/driver/ActiveTripCard.tsx` | Modify | Show retry feedback for status updates |

---

## Technical Details

### New Driver Operations Module

```typescript
// src/lib/supabaseDriverOperations.ts

import { withRetry, categorizeError, isOnline, SupabaseErrorInfo } from "./supabaseErrors";
import { supabase } from "@/integrations/supabase/client";

// Result type for operations with error info
export interface DriverOperationResult<T = void> {
  data: T | null;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

// Accept trip with retry and race condition handling
export const acceptTripWithRetry = async (
  tripId: string,
  driverId: string,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult<{ id: string }>> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "No connection. Check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const { data, error } = await supabase
      .from("trips")
      .update({
        status: "accepted",
        driver_id: driverId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .eq("status", "requested")
      .is("driver_id", null)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("TRIP_ALREADY_TAKEN");
    return data;
  };

  const result = await withRetry(operation, {
    maxAttempts: options?.maxAttempts ?? 3,
    onRetry: (attempt) => console.log(`[acceptTrip] Retry ${attempt}...`),
  });

  // Handle "TRIP_ALREADY_TAKEN" as non-retryable
  if (result.error?.message === "TRIP_ALREADY_TAKEN") {
    return {
      data: null,
      error: {
        type: "database",
        message: "Trip already taken",
        userMessage: "This ride was accepted by another driver.",
        isRetryable: false,
      },
      attempts: result.attempts,
    };
  }

  return result;
};

// Update trip status with retry
export const updateTripStatusWithRetry = async (
  tripId: string,
  status: string,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "No connection. Status will sync when online.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const { error } = await supabase
      .from("trips")
      .update({
        status: status as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId);

    if (error) throw error;
  };

  return withRetry(operation, { maxAttempts: options?.maxAttempts ?? 3 });
};

// Update driver location with silent retry (shorter delays)
export const updateLocationWithRetry = async (
  driverId: string,
  lat: number,
  lng: number
): Promise<boolean> => {
  // Skip retry if offline - location will update on next cycle
  if (!isOnline()) return false;

  const operation = async () => {
    const { error } = await supabase
      .from("drivers")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    if (error) throw error;
    return true;
  };

  const result = await withRetry(operation, {
    maxAttempts: 2,
    baseDelayMs: 500, // Shorter delay for location updates
  });

  return result.data ?? false;
};

// Update online status with retry
export const updateDriverStatusWithRetry = async (
  driverId: string,
  isOnlineStatus: boolean,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "Cannot go online without internet connection.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const { error } = await supabase
      .from("drivers")
      .update({
        is_online: isOnlineStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    if (error) throw error;
  };

  return withRetry(operation, { maxAttempts: options?.maxAttempts ?? 3 });
};
```

### Updated useDriverApp.ts Hooks

```typescript
// Key changes to useAcceptTrip:
export const useAcceptTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const result = await acceptTripWithRetry(tripId, driverId);
      
      if (result.error) {
        // Attach error info for onError handler
        const err = new Error(result.error.userMessage);
        (err as any).errorInfo = result.error;
        (err as any).attempts = result.attempts;
        throw err;
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      toast.success("Trip accepted!");
    },
    onError: (error: Error & { errorInfo?: SupabaseErrorInfo; attempts?: number }) => {
      const info = error.errorInfo;
      
      if (info?.type === "database" && info.message === "Trip already taken") {
        toast.error("Ride unavailable", {
          description: "Another driver accepted this trip.",
        });
      } else if (info?.isRetryable) {
        toast.error("Failed to accept", {
          description: info.userMessage,
          action: { label: "Retry", onClick: () => {} }, // Re-attempt
        });
      } else {
        toast.error(info?.userMessage || error.message);
      }
    },
  });
};
```

### Location Update with Silent Retry

```typescript
// useDriverLocationTracking - updated to use retry
const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
  if (!driverId) return;
  
  const success = await updateLocationWithRetry(driverId, lat, lng);
  
  if (!success) {
    // Increment failure counter
    locationFailuresRef.current++;
    
    // Only show warning after 3 consecutive failures
    if (locationFailuresRef.current >= 3) {
      console.warn("[Location] Multiple update failures, may appear offline to riders");
    }
  } else {
    locationFailuresRef.current = 0; // Reset on success
  }
}, [driverId]);
```

---

## User Experience

### Accept Trip Flow

```text
Driver taps "ACCEPT RIDE"
        │
        ▼
┌─────────────────────────┐
│ Attempt 1               │
│ ─────────────────────── │
│ → Failed? Check error   │
│   ├── "TRIP_TAKEN"      │──→ Show "Ride unavailable" (no retry)
│   └── Network/DB error  │──→ Auto-retry
└─────────────────────────┘
        │
        ▼ (if retryable)
┌─────────────────────────┐
│ Attempt 2 (1s delay)    │
│ Attempt 3 (2s delay)    │
└─────────────────────────┘
        │
        ▼ (if all fail)
┌─────────────────────────┐
│ Show error with:        │
│ • "Failed to accept"    │
│ • [Retry] button        │
│ • Keeps card visible    │
└─────────────────────────┘
```

### Status Update Flow

```text
Driver taps "I'VE ARRIVED"
        │
        ▼
┌─────────────────────────┐
│ Button shows "Updating" │
│ Auto-retry if failed    │
└─────────────────────────┘
        │
        ▼ (if all fail)
┌─────────────────────────┐
│ Toast: "Failed to       │
│ update status"          │
│ [Retry] action          │
│                         │
│ Status NOT changed      │
│ locally until success   │
└─────────────────────────┘
```

### Location Update (Silent)

```text
GPS position received
        │
        ▼
┌─────────────────────────┐
│ Update with 2 attempts  │
│ 500ms delay between     │
└─────────────────────────┘
        │
        ├── Success: Reset failure counter
        │
        └── All fail: Increment counter
                      (warn after 3 failures)
```

---

## Error Messages

| Scenario | User Message |
|----------|--------------|
| Trip already taken | "This ride was accepted by another driver." |
| Network offline | "No connection. Check your network." |
| Status update failed | "Failed to update. Tap to retry." |
| Can't go online | "Cannot go online without internet connection." |
| Location failed (3x) | Console warning only (no user interruption) |

---

## Benefits

1. **Fewer missed rides** - Drivers get automatic retries on accept
2. **Race condition handling** - Clear feedback when another driver wins
3. **Silent location updates** - No annoying toasts for GPS sync
4. **Consistent patterns** - Same retry logic as rider-side operations
5. **Better debugging** - Console logs show retry attempts

