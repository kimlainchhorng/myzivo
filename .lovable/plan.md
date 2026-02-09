
# Driver Reassignment Transparency — Implementation Plan

## Overview
Keep customers informed when their delivery driver changes. When a driver cancels or is reassigned, the customer should see:
1. Clear messaging: "Finding another driver near you..."
2. Status transitions: Searching for new driver → New driver assigned
3. Automatic ETA recalculation after the new driver is assigned

---

## Current State Analysis

### Data Available
| Field | Location | Purpose |
|-------|----------|---------|
| `driver_id` | `food_orders` table | Current assigned driver (null if none) |
| `previous_driver_id` | `food_orders` table | Previous driver before reassignment |
| `assigned_at` | `food_orders` table | When current driver was assigned |
| `order_events` | Audit table | Logs `driver_assigned` and `driver_unassigned` events |

### Current Behavior
- When driver is unassigned, `driver_id` becomes null
- `DispatchSearchBanner` shows "Finding the best driver near you..." when `showSearching` is true
- `useSmartEta` already recalculates when `driverAssigned` changes
- **Missing**: No detection of driver *change* (old driver → null → new driver)
- **Missing**: No specific messaging for reassignment scenario

---

## Implementation Plan

### 1) Create useDriverReassignment Hook

**File to Create:** `src/hooks/useDriverReassignment.ts`

**Purpose:** Track driver changes and detect reassignment scenarios.

```typescript
export interface DriverReassignmentState {
  // Reassignment detection
  wasReassigned: boolean;           // A previous driver existed before current
  isSearchingForNewDriver: boolean; // Driver was unassigned, searching for new one
  previousDriverId: string | null;
  
  // Timestamps
  reassignedAt: Date | null;
  
  // For display
  showReassignmentBanner: boolean;
  reassignmentMessage: string;
  reassignmentSubMessage: string;
}

interface UseDriverReassignmentOptions {
  currentDriverId: string | null | undefined;
  previousDriverId?: string | null;
  orderStatus: string;
}
```

**Key Logic:**
```typescript
// Detect when driver changes
const prevDriverRef = useRef(currentDriverId);

useEffect(() => {
  // Had a driver, now searching (driver cancelled/unassigned)
  if (prevDriverRef.current && !currentDriverId) {
    setIsSearchingForNewDriver(true);
    setWasReassigned(true);
    setPreviousDriverId(prevDriverRef.current);
    setReassignedAt(new Date());
  }
  
  // New driver assigned after searching
  if (isSearchingForNewDriver && currentDriverId) {
    setIsSearchingForNewDriver(false);
    // Clear after 10 seconds to reset state
    setTimeout(() => setWasReassigned(false), 10000);
  }
  
  prevDriverRef.current = currentDriverId;
}, [currentDriverId]);
```

### 2) Create ReassignmentBanner Component

**File to Create:** `src/components/eats/ReassignmentBanner.tsx`

**Purpose:** Dedicated banner for driver reassignment scenarios with clear messaging.

**UI Design - Searching State:**
```
+-----------------------------------------------------+
| 🔄 Finding another driver near you...               |
|                                                     |
| [==================>------] Searching...            |
|                                                     |
| Your previous driver had to cancel. We're finding   |
| someone new!                                        |
+-----------------------------------------------------+
```

**UI Design - New Driver Assigned:**
```
+-----------------------------------------------------+
| ✅ New driver assigned!                             |
|                                                     |
| Your order is back on track                         |
+-----------------------------------------------------+
```

**Props:**
```typescript
interface ReassignmentBannerProps {
  isSearching: boolean;
  newDriverAssigned: boolean;
  nearbyCount?: number | null;
  className?: string;
}
```

**Styling:**
| State | Icon | Colors | Animation |
|-------|------|--------|-----------|
| Searching | RefreshCw | Amber/Orange | Rotating + pulse |
| New assigned | CheckCircle | Emerald | Brief scale-in |

### 3) Update useEatsDispatchStatus Hook

**File to Modify:** `src/hooks/useEatsDispatchStatus.ts`

**New Props:**
```typescript
interface UseEatsDispatchStatusOptions {
  // ... existing props
  
  // Reassignment context
  wasReassigned?: boolean;
  isSearchingForNewDriver?: boolean;
}
```

**New Phase:** Add `reassigning` phase for clarity.

```typescript
export type DispatchPhase = 
  | "pending"
  | "preparing"
  | "almost_ready"
  | "searching"
  | "reassigning"     // NEW: Looking for replacement driver
  | "assigned"
  | "near_pickup"
  | "at_pickup"
  | "en_route"
  | "arrived"
  | "delivered"
  | "cancelled";
```

**Updated Messaging:**
```typescript
// Reassignment scenario
if (isSearchingForNewDriver) {
  return {
    phase: "reassigning",
    message: "Finding another driver near you...",
    subMessage: "Your previous driver had to cancel",
    showSearching: true,
  };
}

// Normal searching
if (!driverId) {
  return {
    phase: "searching",
    message: "Finding the best driver near you...",
    subMessage: "We're matching you with a nearby driver",
    showSearching: true,
  };
}
```

### 4) Update EnhancedStatusBanner Component

**File to Modify:** `src/components/eats/EnhancedStatusBanner.tsx`

**Add `reassigning` phase styling:**
```typescript
const PHASE_STYLES: Record<DispatchPhase, {...}> = {
  // ... existing phases
  reassigning: {
    icon: RefreshCw,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    animate: true,  // Rotating animation
  },
};
```

### 5) Update useSmartEta Hook

**File to Modify:** `src/hooks/useSmartEta.ts`

**Add new recalc reason:**
```typescript
export type RecalcReason = 
  | "initial" 
  | "driver_assigned" 
  | "driver_reassigned"  // NEW
  | "pickup_complete" 
  | "location_change" 
  | "interval"
  | "prep_speed_change";
```

**Update recalc trigger logic:**
```typescript
// Detect driver reassignment (had driver → no driver → new driver)
if (prevDriverAssigned.current && !driverAssigned) {
  reason = "driver_reassigned";
}
// New driver assigned (triggers full ETA recalc)
if (!prevDriverAssigned.current && driverAssigned) {
  reason = "driver_assigned";
}
```

### 6) Update useLiveEatsOrder Hook

**File to Modify:** `src/hooks/useLiveEatsOrder.ts`

**Add `previous_driver_id` to interface and query:**
```typescript
export interface LiveEatsOrder {
  // ... existing fields
  previous_driver_id?: string | null;  // NEW
}

// Update select query to include it
const { data } = await supabase
  .from(EATS_TABLES.orders)
  .select(`
    *,
    restaurants:restaurant_id(name, logo_url, phone, address, lat, lng, avg_prep_time)
  `)
  .eq("id", orderId)
  .single();
```

### 7) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Integration:**
```typescript
import { useDriverReassignment } from "@/hooks/useDriverReassignment";
import { ReassignmentBanner } from "@/components/eats/ReassignmentBanner";

// Track driver reassignment
const reassignment = useDriverReassignment({
  currentDriverId: order?.driver_id,
  previousDriverId: order?.previous_driver_id,
  orderStatus: order?.status || "",
});

// Pass to dispatch status
const dispatchStatus = useEatsDispatchStatus({
  // ... existing props
  wasReassigned: reassignment.wasReassigned,
  isSearchingForNewDriver: reassignment.isSearchingForNewDriver,
});

// Show reassignment banner when applicable
{reassignment.showReassignmentBanner && isActiveOrder && (
  <ReassignmentBanner
    isSearching={reassignment.isSearchingForNewDriver}
    newDriverAssigned={reassignment.wasReassigned && !!order.driver_id}
    nearbyCount={deliveryFactors.nearbyDriverCount}
  />
)}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useDriverReassignment.ts` | Track driver changes and detect reassignment |
| `src/components/eats/ReassignmentBanner.tsx` | Visual banner for reassignment scenarios |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useEatsDispatchStatus.ts` | Add `reassigning` phase, accept reassignment props |
| `src/hooks/useSmartEta.ts` | Add `driver_reassigned` recalc reason |
| `src/hooks/useLiveEatsOrder.ts` | Include `previous_driver_id` in interface |
| `src/components/eats/EnhancedStatusBanner.tsx` | Add `reassigning` phase styling |
| `src/pages/EatsOrderDetail.tsx` | Integrate reassignment tracking and banner |

---

## Status Flow for Reassignment

```
Original Flow:
  Driver Assigned → En Route → Delivered

Reassignment Flow:
  Driver Assigned → [Driver Cancels] → "Finding another driver..." 
                                      → New Driver Assigned → En Route → Delivered
```

---

## Message Summary

| Scenario | Main Message | Sub-message |
|----------|--------------|-------------|
| Driver cancelled, searching | "Finding another driver near you..." | "Your previous driver had to cancel" |
| New driver assigned | "New driver assigned!" | "Your order is back on track" |
| ETA after reassignment | (Updated range) | "ETA recalculated for new driver" |

---

## ETA Recalculation Behavior

When driver reassignment occurs:
1. `driver_id` changes from old ID → null → new ID
2. `useSmartEta` detects `driverAssigned` transition
3. Full ETA recalculation triggers with `reason: "driver_assigned"`
4. New range displayed based on new driver's location

The existing Smart ETA system already handles this automatically since it tracks `driverAssigned` state changes.

---

## Summary

This implementation provides:

1. **Clear reassignment messaging**: "Finding another driver near you..." with context
2. **Dedicated `reassigning` phase**: Distinct from normal searching
3. **Automatic ETA recalculation**: Leverages existing Smart ETA recalc triggers
4. **Visual reassignment banner**: Shows progress and nearby driver count
5. **Smooth status transitions**: Searching → New driver assigned confirmation
