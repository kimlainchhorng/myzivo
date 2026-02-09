
# Smart ETA — Implementation Plan

## Overview
Enhance the ETA system to show a **delivery time range** (e.g., "25–32 min") with the message **"ETA updated based on traffic and demand"**, and automatically recalculate when key events occur (driver assigned, order picked up, driver location changes significantly).

---

## Current State Analysis

### Existing ETA Components
| Component | Location | Current Behavior |
|-----------|----------|------------------|
| `EtaCountdown` | `src/components/eats/EtaCountdown.tsx` | Shows single-point ETA with traffic multiplier |
| `useDriverProximity` | `src/hooks/useDriverProximity.ts` | Calculates distance-based ETA (single value) |
| `EnhancedStatusBanner` | `src/components/eats/EnhancedStatusBanner.tsx` | Shows phase + single ETA value |
| `maps-route` edge function | `supabase/functions/maps-route/` | Returns Google Directions duration (not traffic-aware yet) |
| `useEatsDeliveryFactors` | `src/hooks/useEatsDeliveryFactors.ts` | Provides supply/demand multipliers |
| Traffic multiplier | Inside `EtaCountdown.tsx` | Simple time-of-day check (rush hour 1.4x, late night 0.8x) |

### Current ETA Display
```
+---------------------------+
| Arriving in               |
| 25 min            ● Live  |
| Rush hour — adjusted...   |
+---------------------------+
```

### Target ETA Display
```
+---------------------------+
| Arriving in               |
| 25–32 min       📍 Live ETA |
| ETA updated based on traffic and demand. |
+---------------------------+
```

---

## Implementation Plan

### 1) Create useSmartEta Hook

**File to Create:** `src/hooks/useSmartEta.ts`

**Purpose:** Centralized hook that calculates ETA range with all factors and tracks recalculation triggers.

```typescript
interface SmartEtaResult {
  // Range-based ETA
  etaMinRange: number | null;   // e.g., 25
  etaMaxRange: number | null;   // e.g., 32
  etaDisplayText: string;       // e.g., "25–32 min"
  
  // Single-point for edge cases
  etaSingleMinutes: number | null;
  
  // Recalculation tracking
  lastRecalcAt: Date;
  lastRecalcReason: 'initial' | 'driver_assigned' | 'pickup_complete' | 'location_change' | 'interval';
  isLive: boolean;              // Using live driver location
  
  // Factors applied
  trafficFactor: number;        // 0.8 - 1.4
  demandFactor: number;         // 1.0 - 1.5
  isRushHour: boolean;
  trafficLevel: 'light' | 'moderate' | 'heavy';
}

interface UseSmartEtaOptions {
  orderStatus: string;
  driverAssigned: boolean;
  driverLat?: number | null;
  driverLng?: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  baseEtaMinutes?: number | null;  // From order.eta_dropoff
  demandLevel?: SurgeLevel;
  supplyMultiplier?: number;
}
```

**ETA Range Calculation Logic:**
```text
Base ETA (from driver location or database)
    ↓
Apply traffic factor (0.8 - 1.4 based on time of day)
    ↓
Apply demand factor (1.0 - 1.5 based on driver supply)
    ↓
Calculate range:
  - Min = baseEta × 0.85 (optimistic)
  - Max = baseEta × combinedFactor × 1.15 (pessimistic)
    ↓
Round and format: "25–32 min"
```

**Recalculation Triggers:**
| Trigger | Detection Method | Action |
|---------|------------------|--------|
| Driver assigned | `driverAssigned` changes false → true | Full recalc with log |
| Order picked up | `orderStatus` changes to "out_for_delivery" | Full recalc, switch to delivery ETA |
| Location change (>0.1mi) | Compare with previous lat/lng | Recalc ETA, update range |
| Fallback interval | Every 60 seconds | Refresh factors only |

### 2) Create SmartEtaDisplay Component

**File to Create:** `src/components/eats/SmartEtaDisplay.tsx`

**Purpose:** New display component showing ETA range with "Live ETA" badge and explanation message.

**UI Design:**
```text
+--------------------------------------------------+
| [🕐]  Arriving in                                |
|       25–32 min                  📍 Live ETA     |
|                                                  |
|       ETA updated based on traffic and demand.   |
+--------------------------------------------------+
```

**Props:**
```typescript
interface SmartEtaDisplayProps {
  etaMinRange: number;
  etaMaxRange: number;
  isLive: boolean;
  isArrivingSoon: boolean;  // < 3 min shows "Arriving soon!"
  trafficLevel: 'light' | 'moderate' | 'heavy';
  showExplanation?: boolean;
  className?: string;
}
```

**Visual States:**
| ETA Range | Background | Text | Special |
|-----------|------------|------|---------|
| > 15 min | Orange gradient | White | Normal |
| 5–15 min | Amber gradient | White | Pulse icon |
| < 5 min | Emerald gradient | "Arriving soon!" | Fast pulse |

### 3) Update maps-route Edge Function for Traffic-Aware Duration

**File to Modify:** `supabase/functions/maps-route/index.ts`

**Changes:**
- Add `departure_time=now` to get real-time traffic data
- Return `duration_in_traffic` alongside standard duration
- Add `traffic_level` based on ratio of traffic vs base duration

```typescript
// Updated URL with traffic awareness
const url = `https://maps.googleapis.com/maps/api/directions/json` +
  `?origin=${origin_lat},${origin_lng}` +
  `&destination=${dest_lat},${dest_lng}` +
  `&mode=driving` +
  `&departure_time=now` +  // NEW: enables traffic-aware routing
  `&key=${encodeURIComponent(key)}`;

// Response includes:
{
  ok: true,
  distance_miles: 2.5,
  duration_minutes: 8,
  duration_in_traffic_minutes: 12,  // NEW
  traffic_ratio: 1.5,               // NEW (12/8)
  traffic_level: "heavy",           // NEW: light/moderate/heavy
  polyline: "...",
}
```

### 4) Update useDriverProximity Hook

**File to Modify:** `src/hooks/useDriverProximity.ts`

**Changes:**
- Add ETA range calculation (min/max)
- Track previous location for "significant change" detection (>0.1mi)
- Add `recalcReason` field

**New Fields:**
```typescript
interface ProximityState {
  // ... existing fields
  
  // NEW: Range-based ETA
  etaToDeliveryMin: number | null;
  etaToDeliveryMax: number | null;
  etaToPickupMin: number | null;
  etaToPickupMax: number | null;
  
  // NEW: Change detection
  locationChangedSignificantly: boolean;
  previousLat: number | null;
  previousLng: number | null;
}
```

### 5) Update EnhancedStatusBanner Component

**File to Modify:** `src/components/eats/EnhancedStatusBanner.tsx`

**Changes:**
- Accept `etaMinRange` and `etaMaxRange` props instead of single `etaMinutes`
- Display range format: "25–32 min"
- Add "Live ETA" label with location pin icon
- Show explanation text when appropriate

**Updated Props:**
```typescript
interface EnhancedStatusBannerProps {
  phase: DispatchPhase;
  message: string;
  subMessage: string;
  // UPDATED: Range-based ETA
  etaMinRange?: number | null;
  etaMaxRange?: number | null;
  etaLabel?: "to pickup" | "to you";
  isLocationBased?: boolean;
  showEtaExplanation?: boolean;  // NEW
  className?: string;
}
```

**Updated ETA Display:**
```typescript
{/* ETA Range Display */}
{etaMinRange != null && etaMaxRange != null && (
  <div className="text-right shrink-0">
    <div className="flex items-center gap-1.5">
      {isLocationBased && (
        <MapPin className="w-3 h-3 text-emerald-400" />
      )}
      <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">
        Live ETA
      </span>
    </div>
    <p className="text-lg font-bold text-white">
      {etaMinRange}–{etaMaxRange} <span className="text-sm font-normal text-zinc-400">min</span>
    </p>
    {etaLabel && (
      <p className="text-xs text-zinc-500">{etaLabel}</p>
    )}
  </div>
)}

{/* Explanation message */}
{showEtaExplanation && (
  <p className="text-xs text-zinc-500 mt-2">
    ETA updated based on traffic and demand.
  </p>
)}
```

### 6) Update EtaCountdown Component

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
- Calculate and display ETA range instead of single value
- Add "Live ETA" badge
- Add explanation message: "ETA updated based on traffic and demand."
- Track recalculation events

**Key Changes:**
```typescript
// Calculate ETA range
const etaRange = useMemo(() => {
  if (dynamicEtaMinutes == null) return null;
  
  const combinedFactor = traffic.multiplier * supplyMultiplier;
  const minEta = Math.max(1, Math.floor(dynamicEtaMinutes * 0.85));
  const maxEta = Math.max(minEta + 2, Math.ceil(dynamicEtaMinutes * combinedFactor * 1.15));
  
  return { min: minEta, max: maxEta };
}, [dynamicEtaMinutes, traffic.multiplier, supplyMultiplier]);

// Display: "25–32 min"
<p className="text-2xl font-bold text-white">
  {etaRange.min}–{etaRange.max} <span className="text-lg font-normal">min</span>
</p>
```

### 7) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Use new smart ETA hook
- Pass range values to components
- Track recalculation events for logging

**Updated ETA Integration:**
```typescript
// Use smart ETA with range calculation
const smartEta = useSmartEta({
  orderStatus: order?.status || "",
  driverAssigned: !!order?.driver_id,
  driverLat,
  driverLng,
  pickupLat,
  pickupLng,
  deliveryLat: order?.delivery_lat,
  deliveryLng: order?.delivery_lng,
  demandLevel: deliveryFactors.demandLevel,
  supplyMultiplier: deliveryFactors.supplyMultiplier,
});

// Pass to EnhancedStatusBanner
<EnhancedStatusBanner
  phase={dispatchStatus.phase}
  message={dispatchStatus.message}
  subMessage={dispatchStatus.subMessage}
  etaMinRange={order.driver_id ? smartEta.etaMinRange : null}
  etaMaxRange={order.driver_id ? smartEta.etaMaxRange : null}
  etaLabel={etaLabel}
  isLocationBased={driverLat != null && driverLng != null}
  showEtaExplanation={smartEta.isLive}
/>
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useSmartEta.ts` | Centralized ETA range calculation with recalc tracking |
| `src/components/eats/SmartEtaDisplay.tsx` | Optional standalone smart ETA display component |

### Modified Files (5)
| File | Changes |
|------|---------|
| `supabase/functions/maps-route/index.ts` | Add traffic-aware routing with `departure_time=now` |
| `src/hooks/useDriverProximity.ts` | Add ETA range fields and significant location change detection |
| `src/components/eats/EnhancedStatusBanner.tsx` | Display ETA range, add "Live ETA" badge and explanation |
| `src/components/eats/EtaCountdown.tsx` | Calculate range, add explanation message |
| `src/pages/EatsOrderDetail.tsx` | Integrate smart ETA hook, pass range values |

---

## ETA Range Calculation Formula

```text
Base ETA (distance ÷ 0.5 mph = minutes)
    ↓
Traffic Factor:
  - Rush hour (7-9 AM, 4-7 PM): 1.4x
  - Normal: 1.0x
  - Late night (10 PM - 6 AM): 0.8x
    ↓
Demand Factor:
  - Low supply (0-2 drivers): 1.5x
  - Moderate (3-5 drivers): 1.2x
  - High (6+ drivers): 1.0x
    ↓
Range Calculation:
  Min = floor(baseEta × 0.85)
  Max = ceil(baseEta × combinedFactor × 1.15)
    ↓
Example:
  Base: 20 min, Rush hour, Low supply
  Combined = 1.4 × 1.5 = 2.1 (capped at 2.0)
  Min = floor(20 × 0.85) = 17 min
  Max = ceil(20 × 2.0 × 1.15) = 46 min → show "17–46 min"
```

---

## Recalculation Event Summary

| Event | Detection | Recalc Type |
|-------|-----------|-------------|
| Driver assigned | `order.driver_id` changes from null | Full recalc + log "driver_assigned" |
| Order picked up | `status` → "out_for_delivery" | Full recalc + switch to delivery ETA |
| Significant location change | Driver moved >0.1 miles | Immediate recalc + log "location_change" |
| Phase transition | `dispatchStatus.phase` changes | Refresh display |
| Fallback interval | Every 60 seconds | Refresh factors only |

---

## Customer-Facing Messages

| Context | Display |
|---------|---------|
| Main ETA | **25–32 min** |
| Badge | 📍 **Live ETA** |
| Explanation | "ETA updated based on traffic and demand." |
| Traffic note (rush hour) | "Rush hour — adjusted for traffic" |
| Low supply note | "Few drivers nearby — ETA adjusted" |
| Arriving soon | "Arriving soon!" (no range shown) |

---

## Summary

This implementation provides:

1. **ETA Range Display**: Shows "25–32 min" instead of single value
2. **"Live ETA" Badge**: Small label with location pin icon
3. **Explanation Message**: "ETA updated based on traffic and demand."
4. **Smart Recalculation**: Updates on driver assigned, pickup, and significant location changes
5. **Traffic-Aware Routing**: Edge function enhanced with `departure_time=now` for real traffic data
6. **Unified Hook**: `useSmartEta` consolidates all ETA logic with recalc tracking

The range provides more realistic expectations while the explanation builds trust by showing the system is actively adjusting based on real conditions.
