

# Rider: Assign Only Available Drivers

## Summary

Enhance the ride booking flow to verify driver availability before creating a trip. Filter drivers by `is_online = true` **and** current time within their configured schedule. If no drivers are available, show "No drivers available right now" instead of creating a trip that may never be matched.

---

## Current State

| Component | Status |
|-----------|--------|
| `driver_schedules` table | Exists (day_of_week, start_time, end_time, is_active) |
| `is_online` check | Exists in `useOnlineDrivers` hook |
| Schedule-based filtering | Not implemented |
| "No drivers" message | Not implemented |
| Pre-request availability check | Not implemented |

---

## Implementation Approach

### 1. Create Availability Check Hook

New hook `useAvailableDrivers` that:
- Fetches drivers where `is_online = true` and `status = verified`
- Joins with `driver_schedules` to filter by current day/time
- Returns count of available drivers + loading state

### 2. Create Edge Function or RPC

Option A: **Client-side filtering** (simpler)
- Fetch online drivers + their schedules
- Filter in JavaScript based on current time

Option B: **Database RPC function** (more efficient)
- Create `get_available_drivers_count()` RPC
- Filter at database level using current timestamp

**Recommendation:** Start with client-side filtering for simplicity, optimize later if needed.

### 3. Update RideConfirmPage

Before creating a trip:
1. Check if any drivers are available (online + within schedule)
2. If no drivers → show "No drivers available" message with options
3. If drivers available → proceed with existing flow

### 4. Update RideSearchingPage

Add timeout handling:
- If no driver assigned within 60 seconds, show "No drivers available right now"
- Allow user to cancel or retry

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useAvailableDrivers.ts` | Create | Check driver availability with schedule filtering |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Add availability check before booking |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Add timeout with "no drivers" message |
| `src/components/ride/NoDriversAvailable.tsx` | Create | Reusable "no drivers" UI component |

---

## Technical Details

### New Hook: `useAvailableDrivers`

```typescript
// src/hooks/useAvailableDrivers.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AvailableDriver {
  id: string;
  full_name: string;
  current_lat: number;
  current_lng: number;
}

export function useAvailableDrivers() {
  return useQuery({
    queryKey: ["available-drivers"],
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      // Fetch online, verified drivers
      const { data: drivers, error } = await supabase
        .from("drivers")
        .select(`
          id, 
          full_name, 
          current_lat, 
          current_lng,
          driver_schedules!inner(
            day_of_week,
            start_time,
            end_time,
            is_active
          )
        `)
        .eq("is_online", true)
        .eq("status", "verified")
        .eq("is_suspended", false)
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) throw error;

      // Filter by current day and time
      const available = (drivers || []).filter(driver => {
        const schedule = driver.driver_schedules?.find(
          s => s.day_of_week === dayOfWeek && s.is_active
        );
        if (!schedule) return false;
        
        // Check if current time is within schedule
        return currentTime >= schedule.start_time && 
               currentTime <= schedule.end_time;
      });

      return available as AvailableDriver[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

export function useAvailableDriversCount() {
  const { data, isLoading, error } = useAvailableDrivers();
  return {
    count: data?.length || 0,
    isLoading,
    hasDrivers: (data?.length || 0) > 0,
    error,
  };
}
```

### Alternative: Handle drivers without schedules

Some drivers may not have schedules configured. Treat them as "always available" if online:

```typescript
// Filter logic with fallback
const available = (drivers || []).filter(driver => {
  // If driver has no schedules, consider them available when online
  if (!driver.driver_schedules || driver.driver_schedules.length === 0) {
    return true; // Available if online
  }
  
  const schedule = driver.driver_schedules.find(
    s => s.day_of_week === dayOfWeek && s.is_active
  );
  if (!schedule) return false;
  
  return currentTime >= schedule.start_time && 
         currentTime <= schedule.end_time;
});
```

### New Component: `NoDriversAvailable`

```typescript
// src/components/ride/NoDriversAvailable.tsx
import { motion } from "framer-motion";
import { Car, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoDriversAvailableProps {
  onRetry: () => void;
  onCancel: () => void;
  isRetrying?: boolean;
}

export function NoDriversAvailable({ onRetry, onCancel, isRetrying }: NoDriversAvailableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <Car className="w-8 h-8 text-amber-500" />
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">
        No drivers available right now
      </h3>
      
      <p className="text-sm text-white/60 mb-6">
        All drivers are currently busy or offline. Please try again in a few minutes.
      </p>
      
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-primary"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
```

### Update RideConfirmPage

Add availability check before creating trip:

```typescript
const { hasDrivers, isLoading: isCheckingDrivers, refetch } = useAvailableDriversCount();
const [showNoDrivers, setShowNoDrivers] = useState(false);

const handleConfirm = async () => {
  if (isSubmitting) return;
  
  // Check availability first
  const { data } = await refetch();
  if (!data || data.length === 0) {
    setShowNoDrivers(true);
    return;
  }
  
  setShowNoDrivers(false);
  setIsSubmitting(true);
  // ... existing booking logic
};

// In JSX, conditionally show NoDriversAvailable or confirm button
{showNoDrivers ? (
  <NoDriversAvailable
    onRetry={() => refetch().then(({ data }) => {
      if (data && data.length > 0) setShowNoDrivers(false);
    })}
    onCancel={() => navigate("/ride")}
  />
) : (
  <motion.button onClick={handleConfirm} ...>
    PAY & REQUEST
  </motion.button>
)}
```

### Update RideSearchingPage

Add timeout handling for "no drivers found":

```typescript
const [timedOut, setTimedOut] = useState(false);
const SEARCH_TIMEOUT = 60000; // 60 seconds

useEffect(() => {
  const timer = setTimeout(() => {
    if (state.status === 'searching') {
      setTimedOut(true);
    }
  }, SEARCH_TIMEOUT);
  
  return () => clearTimeout(timer);
}, [state.status]);

// In JSX
{timedOut ? (
  <NoDriversAvailable
    onRetry={() => {
      setTimedOut(false);
      // Reset progress and try again
    }}
    onCancel={() => {
      cancelRide();
      navigate("/ride");
    }}
  />
) : (
  // Existing searching UI
)}
```

---

## User Flow

```text
User taps "PAY & REQUEST"
        │
        ▼
Check available drivers (online + in schedule)
        │
    ┌───┴───┐
    │       │
    ▼       ▼
 Drivers  No Drivers
 Found    Available
    │       │
    ▼       ▼
 Create   Show "No drivers
  Trip    available" message
    │       │
    ▼       └──> [Retry] or [Cancel]
 Navigate to
 /ride/searching
        │
        ▼
 Wait for driver (60s timeout)
        │
    ┌───┴───┐
    │       │
    ▼       ▼
 Driver   Timeout
 Assigned (no match)
    │       │
    ▼       ▼
 Continue Show "No drivers"
  flow    [Retry] or [Cancel]
```

---

## UI Mockup: No Drivers Message

```text
+----------------------------------+
|                                  |
|           🚗                     |
|    (amber car icon)              |
|                                  |
|  No drivers available right now  |
|                                  |
|  All drivers are currently busy  |
|  or offline. Please try again    |
|  in a few minutes.               |
|                                  |
|  [Cancel]    [⏰ Try Again]      |
|                                  |
+----------------------------------+
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Driver has no schedule configured | Treat as always available when online |
| All drivers offline | Show "no drivers" message |
| Drivers online but outside schedule | Show "no drivers" message |
| Network error checking availability | Fall back to existing flow (let backend handle) |
| Driver goes offline during search | 60s timeout catches this |

---

## No Changes To

- Driver app components
- Admin panel
- Database schema (uses existing `driver_schedules` table)
- Manual dispatch edge function (already filters correctly)

