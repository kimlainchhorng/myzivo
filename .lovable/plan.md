

# Order Status Accuracy — Implementation Plan

## Overview
Improve live order tracking reliability with clearer real-time status updates and automatic ETA refresh when driver location changes.

---

## Current State Analysis

### Existing Components
| Component | Purpose | Current Behavior |
|-----------|---------|------------------|
| `useEatsDispatchStatus` | Dispatch phase messaging | Shows: pending, searching, assigned, en_route, arrived, delivered |
| `useLiveDriverLocation` | Real-time driver GPS | Updates via Supabase realtime, tracks to delivery only |
| `EtaCountdown` | ETA display | Recalculates every 30 seconds, uses driver-to-delivery distance |
| `DriverInfoCard` | Driver info + status | Shows "arriving" when driver < 0.2mi from dropoff |
| `StatusTimeline` | Order progress steps | Shows main steps + driver substeps (searching, assigned, en route) |

### Gaps Identified
1. **No "Driver near pickup" status** — Customer can't see when driver arrives at restaurant
2. **No "Restaurant preparing" clarity** — Current status doesn't distinguish preparing phases
3. **ETA updates every 30 seconds** — Not triggered by driver location changes
4. **Distance to pickup not tracked** — Only distance to delivery is calculated

---

## Implementation Plan

### 1) Enhance useEatsDispatchStatus Hook

**File to Modify:** `src/hooks/useEatsDispatchStatus.ts`

**New Phases:**
```typescript
export type DispatchPhase = 
  | "pending"           // Waiting for restaurant
  | "preparing"         // Restaurant preparing (NEW)
  | "searching"         // Looking for driver
  | "assigned"          // Driver heading to restaurant
  | "near_pickup"       // Driver near restaurant (NEW)
  | "at_pickup"         // Driver at restaurant waiting (NEW)
  | "en_route"          // Driver heading to customer
  | "arrived"           // Driver near customer
  | "delivered"         // Complete
  | "cancelled";        // Cancelled

interface UseEatsDispatchStatusOptions {
  status: string;
  driverId: string | null | undefined;
  driverLat?: number | null;
  driverLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  // NEW: Restaurant/pickup coordinates
  pickupLat?: number | null;
  pickupLng?: number | null;
}
```

**New Logic:**
```text
Order Status: confirmed/preparing
   ↓
Check if driver assigned
   ├── NO → phase: "searching"
   └── YES → Calculate distance to pickup (restaurant)
              ├── > 0.2mi → phase: "assigned" 
              │             message: "Driver heading to restaurant"
              ├── 0.05-0.2mi → phase: "near_pickup" (NEW)
              │                message: "Driver arriving at restaurant"
              └── < 0.05mi → phase: "at_pickup" (NEW)
                             message: "Driver waiting at restaurant"
                             
Order Status: ready_for_pickup
   ↓
Driver picks up → phase: "en_route"
                  message: "Driver picked up your order"
                  
Order Status: out_for_delivery
   ↓
Calculate distance to delivery
   ├── > 0.15mi → phase: "en_route"
   │              message: "Driver is on the way!"
   └── ≤ 0.15mi → phase: "arrived"
                  message: "Driver arriving now!"
```

**Customer-Facing Messages:**
| Phase | Message | Sub-message |
|-------|---------|-------------|
| pending | "Waiting for restaurant confirmation..." | "Restaurant will confirm shortly" |
| preparing | "Restaurant is preparing your order" | "Your food is being made fresh" |
| searching | "Finding the best driver near you..." | "We're matching you with a nearby driver" |
| assigned | "Driver heading to restaurant" | "Your driver will pick up your order soon" |
| near_pickup | "Driver arriving at restaurant" | "Almost ready to pick up your order" |
| at_pickup | "Driver at restaurant" | "Waiting for your order" |
| en_route | "Driver is on the way!" | "Your food is coming to you" |
| arrived | "Driver arriving now!" | "Get ready for your delivery" |

### 2) Update useLiveEatsOrder Interface

**File to Modify:** `src/hooks/useLiveEatsOrder.ts`

**Add pickup coordinates to interface:**
```typescript
export interface LiveEatsOrder {
  // ... existing fields
  
  // Pickup coordinates (from restaurant or order)
  pickup_lat?: number | null;
  pickup_lng?: number | null;
}
```

**Update query to include pickup coordinates:**
```typescript
const { data } = await supabase
  .from(EATS_TABLES.orders)
  .select(`
    *,
    restaurants:restaurant_id(name, logo_url, phone, address, lat, lng)
  `)
  .eq("id", orderId)
  .single();
```

### 3) Create useDriverProximity Hook

**File to Create:** `src/hooks/useDriverProximity.ts`

**Purpose:** Consolidated proximity tracking with automatic ETA updates.

```typescript
interface ProximityState {
  // Distance calculations
  distanceToPickup: number | null;
  distanceToDelivery: number | null;
  
  // Proximity flags
  isNearPickup: boolean;      // < 0.2 miles
  isAtPickup: boolean;        // < 0.05 miles
  isNearDelivery: boolean;    // < 0.15 miles
  isArrivingSoon: boolean;    // < 0.05 miles
  
  // Dynamic ETA (recalculated on location change)
  etaToPickup: number | null;   // minutes
  etaToDelivery: number | null; // minutes
  lastEtaUpdate: Date;
}

function useDriverProximity(options: {
  driverLat: number | null;
  driverLng: number | null;
  pickupLat: number | null;
  pickupLng: number | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  orderStatus: string;
}): ProximityState;
```

**Key Feature:** ETAs recalculate immediately when driver coordinates change (not on a fixed interval).

### 4) Update EtaCountdown Component

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
1. Accept `lastLocationUpdate` prop to force recalculation
2. Remove fixed 30-second interval when location-based
3. Add immediate recalc when driver location changes

**New Props:**
```typescript
interface EtaCountdownProps {
  // ... existing props
  
  /** Timestamp of last driver location update - triggers recalc */
  lastLocationUpdate?: number;
  /** Whether to show "Live" indicator more prominently */
  isLocationBased?: boolean;
}
```

**Updated Logic:**
```typescript
// Recalculate ETA whenever driver location changes
useEffect(() => {
  if (driverLat != null && driverLng != null) {
    // Immediate recalculation on location change
    recalculateEta();
  }
}, [driverLat, driverLng, lastLocationUpdate]);
```

### 5) Create EnhancedStatusBanner Component

**File to Create:** `src/components/eats/EnhancedStatusBanner.tsx`

**Purpose:** Replace the simple status banner with phase-aware messaging.

**UI Design by Phase:**
```text
┌──────────────────────────────────────────────────────────┐
│ ● [animated]  Driver arriving at restaurant              │
│               Almost ready to pick up your order         │
│                                        [3 min to pickup] │
└──────────────────────────────────────────────────────────┘

Colors by phase:
- pending/preparing: amber (waiting)
- searching: indigo (searching animation)
- assigned/near_pickup/at_pickup: blue (driver active)
- en_route: orange (delivery in progress)
- arrived: emerald (arriving)
- delivered: emerald (complete)
```

**Props:**
```typescript
interface EnhancedStatusBannerProps {
  phase: DispatchPhase;
  message: string;
  subMessage: string;
  etaMinutes?: number | null;
  etaLabel?: string; // "to pickup" | "to you"
  isLocationBased?: boolean;
}
```

### 6) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Calculate distance to pickup (restaurant)
2. Pass pickup coordinates to dispatch status hook
3. Use driver proximity hook for consolidated state
4. Pass location update timestamp to EtaCountdown
5. Replace status banner with EnhancedStatusBanner

**Updated Dispatch Hook Call:**
```typescript
const dispatchStatus = useEatsDispatchStatus({
  status: order?.status || "",
  driverId: order?.driver_id,
  driverLat,
  driverLng,
  deliveryLat: order?.delivery_lat,
  deliveryLng: order?.delivery_lng,
  // NEW: Pass restaurant coordinates
  pickupLat: order?.pickup_lat ?? (order.restaurants as any)?.lat,
  pickupLng: order?.pickup_lng ?? (order.restaurants as any)?.lng,
});

// NEW: Driver proximity tracking
const proximity = useDriverProximity({
  driverLat,
  driverLng,
  pickupLat: order?.pickup_lat ?? (order.restaurants as any)?.lat,
  pickupLng: order?.pickup_lng ?? (order.restaurants as any)?.lng,
  deliveryLat: order?.delivery_lat,
  deliveryLng: order?.delivery_lng,
  orderStatus: order?.status || "",
});
```

**ETA Display Logic:**
```typescript
// Show appropriate ETA based on order phase
const etaMinutes = order?.status === "out_for_delivery"
  ? proximity.etaToDelivery
  : proximity.etaToPickup;

const etaLabel = order?.status === "out_for_delivery"
  ? "to you"
  : "to pickup";
```

### 7) Update StatusTimeline Substeps

**File to Modify:** `src/components/eats/StatusTimeline.tsx`

**Add new substeps for driver phases:**
```typescript
// Enhanced substeps under "Preparing"
const driverSubsteps = [
  { phase: "searching", label: "Searching for driver...", icon: Search },
  { phase: "assigned", label: "Driver heading to restaurant", icon: Navigation },
  { phase: "near_pickup", label: "Driver arriving at restaurant", icon: MapPin },
  { phase: "at_pickup", label: "Driver waiting for order", icon: Clock },
];
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useDriverProximity.ts` | Consolidated proximity + dynamic ETA tracking |
| `src/components/eats/EnhancedStatusBanner.tsx` | Phase-aware status display |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useEatsDispatchStatus.ts` | Add near_pickup, at_pickup, preparing phases + pickup coordinates |
| `src/hooks/useLiveEatsOrder.ts` | Add pickup_lat, pickup_lng to interface + restaurant coords |
| `src/components/eats/EtaCountdown.tsx` | Trigger recalc on location change, not fixed interval |
| `src/components/eats/StatusTimeline.tsx` | Add driver substeps for near_pickup, at_pickup |
| `src/pages/EatsOrderDetail.tsx` | Integrate proximity hook, pass pickup coords, use EnhancedStatusBanner |

---

## Status Message Summary

| Order Phase | Status Message | ETA Shows |
|-------------|----------------|-----------|
| Restaurant confirming | "Waiting for restaurant confirmation..." | — |
| Restaurant preparing | "Restaurant is preparing your order" | — |
| Finding driver | "Finding the best driver near you..." | — |
| Driver assigned | "Driver heading to restaurant" | X min to pickup |
| Driver near restaurant | "Driver arriving at restaurant" | X min to pickup |
| Driver at restaurant | "Driver at restaurant" | Waiting... |
| Driver en route | "Driver is on the way!" | X min to you |
| Driver arriving | "Driver arriving now!" | Arriving soon! |
| Delivered | "Order delivered. Enjoy!" | — |

---

## ETA Refresh Behavior

| Trigger | Current Behavior | New Behavior |
|---------|------------------|--------------|
| Fixed interval | Every 30 seconds | Every 30 seconds (fallback only) |
| Driver location change | No refresh | **Immediate recalculation** |
| Order status change | No refresh | **Immediate recalculation** |
| Phase transition | No refresh | **Immediate recalculation** |

**Result:** ETA updates feel more responsive and accurate because they reflect the latest driver position immediately.

---

## Proximity Thresholds

| Threshold | Distance | Used For |
|-----------|----------|----------|
| Near pickup | 0.2 miles (~320m) | "Arriving at restaurant" |
| At pickup | 0.05 miles (~80m) | "At restaurant" |
| Near delivery | 0.15 miles (~240m) | "Arriving now!" |
| At delivery | 0.05 miles (~80m) | "Driver here!" |

---

## Summary

This implementation provides:

1. **Clearer real-time status updates:**
   - "Restaurant preparing" distinct from confirmation
   - "Driver heading to restaurant" → "Driver arriving at restaurant" → "Driver at restaurant"
   - "Driver en route" → "Driver arriving now!"

2. **Automatic ETA refresh:**
   - ETA recalculates immediately when driver location updates (not just every 30s)
   - Shows "to pickup" ETA before pickup, "to you" after

3. **Enhanced timeline:**
   - Driver substeps show granular progress during pickup phase
   - Visual indicators for each driver phase

4. **Proximity-aware messaging:**
   - Uses driver distance to both restaurant and delivery to determine status
   - More accurate arrival notifications

