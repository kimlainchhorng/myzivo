
# Smart Dispatch Transparency — Implementation Plan

## Overview
Enhance customer visibility during the driver assignment process with clear status messaging ("Finding the best driver near you..."), explicit status updates (Searching → Assigned → En Route), and improved ETA calculations using driver distance and traffic estimates.

---

## Current State Analysis

### Already Complete
| Feature | Status | Location |
|---------|--------|----------|
| `EtaCountdown` component | Complete | Dynamic ETA with distance-based calculation (25 mph) |
| `DriverInfoCard` component | Complete | Shows "Driver Assigned" / "Driver En Route" |
| `StatusTimeline` component | Complete | Visual progress for order status |
| `useLiveEatsOrder` hook | Complete | Real-time order updates with `assigned_at` |
| `useLiveDriverTracking` hook | Complete | Distance-based ETA via Haversine formula |
| `useEatsDriver` hook | Complete | Fetches assigned driver details |
| Auto-dispatch RPC | Complete | `auto_assign_order_v2` in database |
| Ride searching UI | Complete | `RideSearchingPage.tsx` with animated progress |
| Live driver location | Complete | Real-time updates via Supabase Realtime |

### Missing
| Feature | What's Needed |
|---------|---------------|
| "Searching for driver" UI | Show animated search state when order ready but no driver yet |
| Driver search status banner | "Finding the best driver near you..." message |
| Status step: Searching | Add pre-assignment status to timeline when applicable |
| Driver distance in ETA | Use driver's actual location for more accurate ETA |
| Traffic-aware ETA | Apply time-of-day traffic multipliers |

---

## Implementation Plan

### 1) Create DispatchSearchBanner Component

**File to Create:** `src/components/eats/DispatchSearchBanner.tsx`

**Purpose:** Animated banner shown when order is ready for pickup but no driver has been assigned yet.

**UI Design:**
```
+----------------------------------------------------------+
| [🔍 ↻]  Finding the best driver near you...              |
|         We're matching you with a nearby driver          |
|                                                          |
| ═══════════════════════════░░░░░░░░                      |
| [🚗 12 drivers nearby]                                   |
+----------------------------------------------------------+
```

**Features:**
- Animated search icon with pulse
- Progress bar animation (indeterminate)
- Show nearby driver count when available (via `useNearbyDriversCount`)
- Blue/indigo theme (searching phase)
- Auto-hide when driver is assigned

**Display Conditions:**
- Order status is `confirmed`, `preparing`, or `ready`
- `driver_id` is null
- Order is not cancelled or delivered

### 2) Create useEatsDispatchStatus Hook

**File to Create:** `src/hooks/useEatsDispatchStatus.ts`

**Purpose:** Determine dispatch phase and provide messaging for the order.

```typescript
interface DispatchStatus {
  phase: "pending" | "searching" | "assigned" | "en_route" | "arrived";
  message: string;
  subMessage: string;
  showSearching: boolean;
  nearbyDriverCount: number | null;
}
```

**Logic:**
- `pending`: Order placed but not confirmed by restaurant
- `searching`: Order confirmed/ready but no `driver_id` assigned
- `assigned`: `driver_id` set but status not "out_for_delivery"
- `en_route`: Status is "out_for_delivery"
- `arrived`: Driver within 0.1 miles of delivery location

### 3) Enhance StatusTimeline with Driver Phases

**File to Modify:** `src/components/eats/StatusTimeline.tsx`

**Changes:**
Add optional driver-specific sub-steps that show:
- "🔍 Searching for driver..." (when ready but no driver)
- "✓ Driver assigned" (when driver_id set)
- "🚗 Driver en route" (when out_for_delivery)

**New Props:**
```typescript
interface StatusTimelineProps {
  currentStatus: string;
  timestamps?: OrderTimestamps;
  className?: string;
  // New props for dispatch transparency
  driverId?: string | null;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
}
```

**Sub-step Logic:**
Under the "Ready for Pickup" step, show driver substeps:
```text
[✓] Ready for Pickup         2:45 PM
    └─ [🔍] Searching...      (pulsing)
    └─ [✓] Driver assigned    2:47 PM
    └─ [🚗] Driver en route   2:50 PM
```

### 4) Enhance EtaCountdown with Traffic Multiplier

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
Add traffic-aware ETA calculation based on time of day.

**Traffic Multipliers:**
```typescript
function getTrafficMultiplier(): number {
  const hour = new Date().getHours();
  // Rush hours: 7-9 AM and 4-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return 1.4; // 40% longer during rush hour
  }
  // Late night: 10 PM - 6 AM (faster)
  if (hour >= 22 || hour <= 6) {
    return 0.8; // 20% faster at night
  }
  return 1.0; // Normal
}
```

**Updated Calculation:**
```typescript
const dynamicEtaMinutes = useMemo(() => {
  if (driverLat && driverLng && deliveryLat && deliveryLng) {
    const distance = calculateDistanceMiles(...);
    const baseMinutes = distance / AVG_SPEED_MILES_PER_MIN;
    const withTraffic = baseMinutes * getTrafficMultiplier();
    return Math.max(1, Math.ceil(withTraffic));
  }
  return null;
}, [driverLat, driverLng, deliveryLat, deliveryLng]);
```

**New UI Element:**
Show small indicator when traffic adjustment is applied:
```
Arriving in 15 min
[🚦 Rush hour — adjusted for traffic]
```

### 5) Integrate DispatchSearchBanner in EatsOrderDetail

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Import `DispatchSearchBanner` and `useEatsDispatchStatus`
2. Show `DispatchSearchBanner` when in searching phase
3. Update status message to reflect dispatch phase

**Placement (after high demand banner, before ETA):**
```typescript
{/* Dispatch Search Banner - show when looking for driver */}
{dispatchStatus.showSearching && isActiveOrder && (
  <DispatchSearchBanner
    nearbyCount={dispatchStatus.nearbyDriverCount}
    orderId={order.id}
  />
)}
```

**Updated Status Messages:**
```typescript
const getStatusMessage = () => {
  // Add dispatch-aware messages
  if (order.status === "ready" && !order.driver_id) {
    return "Finding the best driver near you...";
  }
  if (order.driver_id && order.status !== "out_for_delivery") {
    return "Driver assigned — heading to restaurant";
  }
  // ... existing messages
};
```

### 6) Update DriverInfoCard with Arrival Proximity

**File to Modify:** `src/components/eats/DriverInfoCard.tsx`

**Changes:**
Add new status when driver is very close (< 0.2 miles):

```typescript
// New prop
interface DriverInfoCardProps {
  driver: EatsDriver;
  isDelivering: boolean;
  orderId?: string;
  distanceToDelivery?: number; // miles
  className?: string;
}
```

**New Status Display:**
```text
When distanceToDelivery < 0.2:
┌────────────────────────────────┐
│ [🟢] DRIVER ARRIVING           │
│ Your driver is almost here!    │
└────────────────────────────────┘
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/components/eats/DispatchSearchBanner.tsx` | Animated "Finding driver..." UI |
| `src/hooks/useEatsDispatchStatus.ts` | Dispatch phase detection and messaging |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/components/eats/StatusTimeline.tsx` | Add driver sub-steps under "Ready for Pickup" |
| `src/components/eats/EtaCountdown.tsx` | Add traffic multiplier for time-of-day accuracy |
| `src/pages/EatsOrderDetail.tsx` | Integrate dispatch banner and improved messaging |
| `src/components/eats/DriverInfoCard.tsx` | Add "arriving" proximity indicator |

---

## UI Components

### DispatchSearchBanner (New)
```text
+----------------------------------------------------------+
| [🔍↻]  Finding the best driver near you...               |
|        We're matching you with a nearby driver           |
|                                                          |
| ══════════════════════░░░░░░░░░░░░░ (animated)          |
|                                                          |
| [🚗 8 drivers nearby]               [View map →]         |
+----------------------------------------------------------+
```
- Background: `bg-indigo-500/10 border-indigo-500/30`
- Animated progress bar (indeterminate shimmer)
- Nearby driver count fetched via existing hook

### Status Timeline with Driver Substeps
```text
[✓] Order Placed          2:30 PM
[✓] Confirmed             2:32 PM
[✓] Preparing             2:35 PM
[◉] Ready for Pickup      2:45 PM
    ├─ [✓] Driver assigned    2:47 PM
    └─ [↻] Driver en route    (now)
[ ] Delivered
```

### ETA with Traffic Indicator
```text
+------------------------------------------+
| [🕐]  Arriving in                        |
|       18 min                             |
|                                          |
| 🚦 Rush hour — adjusted for traffic      |
+------------------------------------------+
```

### Driver Arriving Alert (DriverInfoCard Enhancement)
```text
+------------------------------------------+
| [🟢 pulse]  DRIVER ARRIVING              |
+------------------------------------------+
| [Avatar]  John D.  ⭐ 4.9                 |
|           Gray Honda Civic • ABC123      |
|                                          |
| 🎯 Almost here! Get ready for delivery   |
+------------------------------------------+
```

---

## Data Flow

```text
Customer opens order tracking
        ↓
useLiveEatsOrder(orderId)
        ↓
useEatsDispatchStatus(order)
        ↓
Returns: { phase: "searching", showSearching: true, nearbyDriverCount: 8 }
        ↓
UI shows: DispatchSearchBanner + "Finding the best driver..."
        ↓
Driver gets assigned (realtime update)
        ↓
useEatsDispatchStatus returns: { phase: "assigned", showSearching: false }
        ↓
UI shows: DriverInfoCard with "Driver assigned — heading to restaurant"
        ↓
Driver picks up (status → out_for_delivery)
        ↓
useEatsDispatchStatus returns: { phase: "en_route" }
        ↓
UI shows: EtaCountdown with traffic-adjusted ETA + "Driver en route"
        ↓
Driver gets close (< 0.2 mi)
        ↓
UI shows: "DRIVER ARRIVING" alert
```

---

## Dispatch Phase Mapping

| Order Status | driver_id | Dispatch Phase | Customer Message |
|--------------|-----------|----------------|------------------|
| placed | null | pending | "Waiting for restaurant confirmation..." |
| confirmed | null | searching | "Finding the best driver near you..." |
| preparing | null | searching | "Finding the best driver near you..." |
| ready | null | searching | "Finding the best driver near you..." |
| ready | set | assigned | "Driver assigned — heading to restaurant" |
| out_for_delivery | set | en_route | "Driver is on the way!" |
| out_for_delivery | set (< 0.2 mi) | arrived | "Driver arriving now!" |
| delivered | set | delivered | "Order delivered. Enjoy!" |

---

## Technical Notes

### Traffic Multiplier Rationale
Based on typical urban traffic patterns:
- **Rush hours (7-9 AM, 4-7 PM)**: 40% slower (multiplier 1.4)
- **Late night (10 PM - 6 AM)**: 20% faster (multiplier 0.8)
- **Normal hours**: No adjustment (multiplier 1.0)

This provides more realistic ETAs without requiring external traffic API.

### Nearby Driver Count
Uses existing `useNearbyDriversCount` from `useLiveDriverTracking.ts`:
- Queries drivers table for online drivers within radius
- Updates in real-time via Supabase subscription
- Shows count like "12 drivers nearby" for reassurance

### Real-time Updates
All dispatch phase changes trigger via existing Supabase Realtime subscription on `food_orders`:
- `driver_id` changes → Phase moves from "searching" to "assigned"
- `status` changes → Phase moves through lifecycle
- No additional subscriptions needed

---

## Summary

This implementation provides transparent dispatch visibility:

1. **DispatchSearchBanner** — Animated "Finding the best driver near you..." with nearby count
2. **useEatsDispatchStatus** — Determines phase: pending → searching → assigned → en_route → arrived
3. **StatusTimeline driver substeps** — Shows "Driver assigned", "Driver en route" under Ready status
4. **Traffic-aware ETA** — Adjusts for rush hour and late night conditions
5. **Driver arriving alert** — Prominent indicator when driver is < 0.2 miles away

Customers will clearly see each stage of driver assignment and receive more accurate arrival estimates based on actual driver distance and time-of-day traffic conditions.
