
# Faster Pickup Timing — Implementation Plan

## Overview
Enhance the order screen with smoother status transitions and dynamic ETA adjustments based on real-time restaurant prep speed. The system will show granular preparation states (Preparing → Almost ready → Driver arriving for pickup) and automatically adjust the ETA when the restaurant is running faster or slower than its learned average.

---

## Current State Analysis

### What We Have
| Component | Current Behavior |
|-----------|------------------|
| `useEatsDispatchStatus` | Returns phase: preparing, searching, assigned, near_pickup, at_pickup, en_route, arrived, delivered |
| `StatusTimeline` | Shows driver substeps (searching → assigned → near pickup → at pickup) |
| `useSmartEta` | Calculates ETA using learned prep time + travel time with traffic/demand factors |
| `useLearnedPrepTime` | Fetches historical average prep time for restaurant |
| `food_orders.accepted_at` | When restaurant confirmed the order |
| `food_orders.ready_at` | When order was marked ready |

### Current Status Flow
```
Preparing → Ready → Out for Delivery → Delivered
```

### Target Status Flow (Smoother Transitions)
```
Preparing → Almost ready → Driver arriving for pickup → Picked up → On the way
```

---

## Implementation Plan

### 1) Create usePrepProgress Hook

**File to Create:** `src/hooks/usePrepProgress.ts`

**Purpose:** Calculate preparation progress and detect if restaurant is running faster or slower than average.

```typescript
export type PrepStatus = "starting" | "preparing" | "almost_ready" | "ready";

export interface PrepProgressResult {
  // Progress tracking
  status: PrepStatus;
  progressPercent: number;     // 0-100
  elapsedMinutes: number;      // Time since order confirmed
  remainingMinutes: number;    // Estimated remaining prep time
  
  // Speed deviation
  prepSpeedFactor: number;     // 1.0 = on track, <1 = faster, >1 = slower
  isRunningFast: boolean;      // More than 20% faster than average
  isRunningSlow: boolean;      // More than 20% slower than average
  speedMessage: string | null; // "Kitchen is ahead of schedule" or "Taking a bit longer"
  
  // For ETA adjustment
  adjustedPrepMinutes: number; // Real-time adjusted prep estimate
}
```

**Key Logic:**
```typescript
// Calculate elapsed time since order confirmed
const elapsedMinutes = (Date.now() - acceptedAt.getTime()) / 60000;

// Estimate progress based on elapsed vs expected
const progressPercent = Math.min(100, (elapsedMinutes / learnedPrepMinutes) * 100);

// Determine prep status
if (progressPercent < 30) return "starting";
if (progressPercent < 75) return "preparing";
if (progressPercent < 100) return "almost_ready";
return "ready";

// Detect speed deviation (compare actual vs expected pace)
// If 75% through expected time but order marked ready → running fast
// If 120% through expected time and not ready → running slow
```

### 2) Update useEatsDispatchStatus Hook

**File to Modify:** `src/hooks/useEatsDispatchStatus.ts`

**New Phase:** Add `almost_ready` phase for smoother transitions.

```typescript
export type DispatchPhase = 
  | "pending"
  | "preparing"
  | "almost_ready"      // NEW: 75%+ through prep time
  | "searching"
  | "assigned"
  | "near_pickup"
  | "at_pickup"
  | "en_route"
  | "arrived"
  | "delivered"
  | "cancelled";
```

**New Props:**
```typescript
interface UseEatsDispatchStatusOptions {
  // ... existing
  prepProgressPercent?: number;  // From usePrepProgress
  isAlmostReady?: boolean;       // 75%+ through prep
}
```

**New Messaging:**
| Phase | Message | Sub-message |
|-------|---------|-------------|
| preparing | "Restaurant is preparing your order" | "Your food is being made fresh" |
| almost_ready | "Almost ready!" | "Final touches on your order" |
| near_pickup | "Driver arriving for pickup" | "Order will be picked up shortly" |

### 3) Update useSmartEta Hook for Real-time Adjustment

**File to Modify:** `src/hooks/useSmartEta.ts`

**New Props:**
```typescript
interface UseSmartEtaOptions {
  // ... existing
  
  // Real-time prep adjustment
  actualPrepElapsed?: number;     // Minutes since confirmed
  prepSpeedFactor?: number;       // From usePrepProgress
}
```

**New Recalc Reason:**
```typescript
export type RecalcReason = 
  | "initial" 
  | "driver_assigned" 
  | "pickup_complete" 
  | "location_change" 
  | "interval"
  | "prep_speed_change";  // NEW: Restaurant pace changed
```

**Adjusted Prep Calculation:**
```typescript
// If restaurant is running 20% faster, reduce prep estimate by 20%
const adjustedPrep = learnedPrepMinutes * prepSpeedFactor;

// Example: learned = 20 min, speedFactor = 0.8 (running fast)
// adjustedPrep = 20 * 0.8 = 16 min
```

### 4) Create PrepProgressBanner Component

**File to Create:** `src/components/eats/PrepProgressBanner.tsx`

**Purpose:** Visual indicator showing preparation progress with speed context.

**UI Design:**
```
+-----------------------------------------------------+
| 🍳 Preparing your order                             |
|                                                     |
| [=============>--------] 65%                        |
|                                                     |
| ⚡ Kitchen is ahead of schedule                     |
+-----------------------------------------------------+
```

**Props:**
```typescript
interface PrepProgressBannerProps {
  status: PrepStatus;
  progressPercent: number;
  isRunningFast?: boolean;
  isRunningSlow?: boolean;
  speedMessage?: string | null;
  className?: string;
}
```

**Visual States:**
| Status | Icon | Color | Message |
|--------|------|-------|---------|
| starting | ChefHat | Orange | "Starting your order" |
| preparing | Flame | Orange | "Preparing your order" |
| almost_ready | Sparkles | Amber | "Almost ready!" |
| ready | Check | Emerald | "Ready for pickup!" |

### 5) Update EnhancedStatusBanner Component

**File to Modify:** `src/components/eats/EnhancedStatusBanner.tsx`

**Add `almost_ready` phase styling:**
```typescript
const PHASE_STYLES: Record<DispatchPhase, {...}> = {
  // ... existing phases
  almost_ready: {
    icon: Sparkles,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    animate: true,
  },
};
```

### 6) Update StatusTimeline Component

**File to Modify:** `src/components/eats/StatusTimeline.tsx`

**Add prep progress substep:**
```typescript
// Under "Preparing" step, show prep progress substeps
{showPrepSubsteps && (
  <div className="ml-5 pl-4 border-l-2 border-dashed border-zinc-700 space-y-2 py-2">
    {/* Starting prep */}
    <SubStep 
      icon={ChefHat}
      label="Starting preparation"
      completed={prepProgress >= 30}
      active={prepProgress < 30}
    />
    
    {/* Cooking */}
    <SubStep 
      icon={Flame}
      label="Cooking your order"
      completed={prepProgress >= 75}
      active={prepProgress >= 30 && prepProgress < 75}
    />
    
    {/* Almost ready */}
    <SubStep 
      icon={Sparkles}
      label="Almost ready!"
      completed={prepProgress >= 100}
      active={prepProgress >= 75 && prepProgress < 100}
    />
  </div>
)}
```

### 7) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Integration:**
```typescript
// Calculate prep progress
const prepProgress = usePrepProgress({
  acceptedAt: order?.accepted_at,
  learnedPrepMinutes: learnedPrep.avgPrepMinutes,
  isOrderReady: order?.status === "ready_for_pickup" || order?.status === "ready",
});

// Enhanced dispatch status with prep progress
const dispatchStatus = useEatsDispatchStatus({
  status: order?.status || "",
  driverId: order?.driver_id,
  driverLat,
  driverLng,
  deliveryLat: order?.delivery_lat,
  deliveryLng: order?.delivery_lng,
  pickupLat,
  pickupLng,
  // NEW: Prep progress integration
  prepProgressPercent: prepProgress.progressPercent,
  isAlmostReady: prepProgress.status === "almost_ready",
});

// Smart ETA with real-time prep adjustment
const smartEta = useSmartEta({
  // ... existing
  actualPrepElapsed: prepProgress.elapsedMinutes,
  prepSpeedFactor: prepProgress.prepSpeedFactor,
});
```

**Show prep progress banner during preparing phase:**
```typescript
{order.status === "preparing" && (
  <PrepProgressBanner
    status={prepProgress.status}
    progressPercent={prepProgress.progressPercent}
    isRunningFast={prepProgress.isRunningFast}
    isRunningSlow={prepProgress.isRunningSlow}
    speedMessage={prepProgress.speedMessage}
  />
)}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/usePrepProgress.ts` | Calculate prep progress & speed deviation |
| `src/components/eats/PrepProgressBanner.tsx` | Visual prep progress with speed context |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useEatsDispatchStatus.ts` | Add `almost_ready` phase, accept prep progress props |
| `src/hooks/useSmartEta.ts` | Add real-time prep speed adjustment, new recalc reason |
| `src/components/eats/EnhancedStatusBanner.tsx` | Add `almost_ready` phase styling |
| `src/components/eats/StatusTimeline.tsx` | Add prep progress substeps |
| `src/pages/EatsOrderDetail.tsx` | Integrate prep progress, show banner |

---

## Prep Speed Adjustment Logic

```
Learned Average Prep Time: 20 minutes
Order Accepted At: 10:00 AM
Current Time: 10:12 AM (12 min elapsed)

Expected Progress: 12/20 = 60%

Scenario A: Order already marked "almost ready" at 60%
  → Running FAST (speedFactor = 0.75)
  → Adjusted prep = 20 × 0.75 = 15 min total
  → Remaining = 15 - 12 = 3 min
  → Message: "Kitchen is ahead of schedule"

Scenario B: Still at "preparing" at 100%+ elapsed
  → Running SLOW (speedFactor = 1.25)
  → Adjusted prep = 20 × 1.25 = 25 min total
  → Remaining = 25 - 20 = 5 min
  → Message: "Taking a bit longer than usual"
```

---

## Status Message Summary

| Phase | Main Message | Sub-message |
|-------|--------------|-------------|
| preparing | "Restaurant is preparing your order" | "Your food is being made fresh" |
| almost_ready | "Almost ready!" | "Final touches on your order" |
| searching | "Finding the best driver near you..." | "We're matching you with a nearby driver" |
| assigned | "Driver heading to restaurant" | "Your driver will pick up your order soon" |
| near_pickup | "Driver arriving for pickup" | "Order will be picked up shortly" |
| at_pickup | "Driver picking up your order" | "Almost on the way!" |
| en_route | "Driver is on the way!" | "Your food is coming to you" |
| arrived | "Driver arriving now!" | "Get ready for your delivery" |

---

## Speed Messages

| Condition | Message | Icon |
|-----------|---------|------|
| Running 20%+ faster | "Kitchen is ahead of schedule" | ⚡ Zap |
| Running 20%+ slower | "Taking a bit longer than usual" | ⏳ Hourglass |
| On track | (no message) | — |

---

## Summary

This implementation provides:

1. **Smoother status transitions**: Preparing → Almost ready → Driver arriving for pickup
2. **Real-time prep progress tracking**: Visual progress bar showing kitchen progress
3. **Dynamic ETA adjustment**: ETA updates when restaurant runs faster or slower than average
4. **Speed context messaging**: "Kitchen is ahead of schedule" or "Taking a bit longer"
5. **Timeline substeps**: Granular prep steps (Starting → Cooking → Almost ready)

The system creates a more transparent and accurate experience by reflecting actual kitchen pace rather than relying solely on historical averages.
