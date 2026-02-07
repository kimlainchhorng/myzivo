

# Add Retry Logic to cancelRideInDb and updateRideStatusInDb

## Summary

Add exponential backoff retry logic to the remaining rider-side database operations (`cancelRideInDb` and `updateRideStatusInDb`) to ensure ride cancellations and status updates don't fail silently due to transient network issues.

## Current State

| Function | Current Handling | Issue |
|----------|------------------|-------|
| `cancelRideInDb` | Single attempt, returns `boolean` | Cancel may silently fail, ride stuck in "searching" |
| `updateRideStatusInDb` | Single attempt, returns `boolean` | Status change may fail, UI/DB out of sync |

These functions are used in:
- `RideSearchingPage.tsx` - Cancel ride during driver search
- `RideDriverPage.tsx` - Cancel ride and start trip
- `RideTripPage.tsx` - Complete trip

## Implementation Approach

Follow the same pattern established for:
- `createRideInDb` (rider-side) - uses `withRetry` with `CreateRideResult` type
- `updateTripStatusWithRetry` (driver-side) - uses `DriverOperationResult` type

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabaseRide.ts` | Modify | Add retry-enabled versions with detailed error results |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Handle cancel errors, show retry option |
| `src/pages/ride/RideDriverPage.tsx` | Modify | Handle cancel/status update errors with retry UI |
| `src/pages/ride/RideTripPage.tsx` | Modify | Handle complete trip errors with retry option |

---

## Technical Details

### Enhanced Result Types

```typescript
// Result type for status update operations
export interface UpdateRideResult {
  success: boolean;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

// Options for retry operations
export interface UpdateRideOptions {
  enableRetry?: boolean;
  maxAttempts?: number;
  onRetry?: (attempt: number, error: SupabaseErrorInfo) => void;
}
```

### Updated cancelRideInDb

```typescript
export const cancelRideInDb = async (
  tripId: string,
  options: UpdateRideOptions = {}
): Promise<UpdateRideResult> => {
  const { enableRetry = true, maxAttempts = 3, onRetry } = options;

  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async (): Promise<boolean> => {
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) throw error;
    return true;
  };

  if (enableRetry) {
    const result = await withRetry(operation, { 
      maxAttempts,
      onRetry: (attempt, err) => {
        console.log(`[cancelRide] Retry ${attempt}...`);
        onRetry?.(attempt, err);
      }
    });
    return {
      success: result.data ?? false,
      error: result.error,
      attempts: result.attempts,
    };
  }

  // Single attempt without retry
  try {
    await operation();
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to cancel ride:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};
```

### Updated updateRideStatusInDb

```typescript
export const updateRideStatusInDb = async (
  tripId: string,
  status: RideStatus,
  options: UpdateRideOptions = {}
): Promise<UpdateRideResult> => {
  const { enableRetry = true, maxAttempts = 3, onRetry } = options;

  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async (): Promise<boolean> => {
    const dbStatus = mapFrontendStatusToDb(status) as DbTripStatus;
    const { error } = await supabase
      .from("trips")
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) throw error;
    return true;
  };

  if (enableRetry) {
    const result = await withRetry(operation, { 
      maxAttempts,
      onRetry: (attempt, err) => {
        console.log(`[updateRideStatus] Retry ${attempt}...`);
        onRetry?.(attempt, err);
      }
    });
    return {
      success: result.data ?? false,
      error: result.error,
      attempts: result.attempts,
    };
  }

  // Single attempt without retry
  try {
    await operation();
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to update ride status:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};
```

### Updated Page Components

**RideSearchingPage.tsx - Cancel with retry:**
```typescript
const [cancelError, setCancelError] = useState<SupabaseErrorInfo | null>(null);
const [isCancelling, setIsCancelling] = useState(false);

const handleCancel = async () => {
  setIsCancelling(true);
  setCancelError(null);
  
  if (state.tripId) {
    const result = await cancelRideInDb(state.tripId);
    
    if (!result.success && result.error) {
      setCancelError(result.error);
      setIsCancelling(false);
      
      if (result.error.isRetryable) {
        toast.error("Failed to cancel", {
          description: result.error.userMessage,
        });
      }
      return; // Don't navigate if cancel failed
    }
  }
  
  cancelRide();
  navigate("/ride/select");
};
```

**RideDriverPage.tsx - Start trip with retry:**
```typescript
const [statusError, setStatusError] = useState<SupabaseErrorInfo | null>(null);
const [isUpdating, setIsUpdating] = useState(false);

const handleStartTrip = async () => {
  setIsUpdating(true);
  setStatusError(null);
  
  if (state.tripId) {
    const result = await updateRideStatusInDb(state.tripId, "in_trip");
    
    if (!result.success && result.error) {
      setStatusError(result.error);
      setIsUpdating(false);
      toast.error("Failed to start trip", {
        description: result.error.userMessage,
      });
      return; // Don't start trip if update failed
    }
  }
  
  startTrip();
  navigate("/ride/trip");
};
```

---

## User Experience

### Cancel Ride Flow

```text
User taps "Cancel"
        │
        ▼
┌─────────────────────────┐
│ Attempt 1               │
│ ─────────────────────── │
│ → Failed? Auto-retry    │
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
│ Toast: "Failed to       │
│ cancel. Tap to retry."  │
│                         │
│ Stay on current page    │
│ Allow retry             │
└─────────────────────────┘
```

### Status Update Flow

```text
User taps "Start Trip" / "End Trip"
        │
        ▼
┌─────────────────────────┐
│ Button shows loading    │
│ Auto-retry if failed    │
└─────────────────────────┘
        │
        ▼ (if all fail)
┌─────────────────────────┐
│ Error toast appears     │
│ Button re-enabled       │
│ User can retry          │
│                         │
│ Status NOT changed      │
│ locally until success   │
└─────────────────────────┘
```

---

## Error Messages

| Scenario | User Message |
|----------|--------------|
| Offline during cancel | "No internet connection. Please check your network." |
| Cancel failed after retries | "Failed to cancel. Please try again." |
| Status update timeout | "Request timed out. Tap to retry." |
| Complete trip failed | "Failed to complete trip. Please try again." |

---

## Benefits

1. **Reliable cancellations** - Riders can cancel even with spotty network
2. **Consistent state** - UI and database stay in sync
3. **Same patterns** - Follows established retry logic from `createRideInDb` and driver operations
4. **Clear feedback** - Users know when operations fail and can retry

