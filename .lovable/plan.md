
# Smarter Delivery Times — Implementation Plan

## Overview
Enhance ETA accuracy by incorporating **real (learned) restaurant preparation times** into the calculation. The ETA will combine:
1. Learned average prep time (from historical data or restaurant default)
2. Driver travel time (existing smart ETA)
3. Traffic/demand adjustments (existing factors)

The order screen will display the message: **"ETA based on real preparation times."**

---

## Current State Analysis

### What We Have
| Component | Current Behavior |
|-----------|------------------|
| `useSmartEta` | Calculates ETA range using driver location + traffic/demand factors |
| `restaurants.avg_prep_time` | Static prep time set by restaurant (default ~25-30 min) |
| `sla_metrics.prep_seconds` | Historical prep times per completed order |
| `food_orders.accepted_at/ready_at` | Timestamps for calculating actual prep time |
| `EnhancedStatusBanner` | Displays ETA range with "Live ETA" badge |
| `SmartEtaDisplay` | Shows ETA with traffic/demand explanation |

### What's Missing
1. **No learned prep time aggregation** — Uses static `avg_prep_time` instead of actual historical average
2. **Prep time not added to travel ETA** — Current ETA only considers driver travel, not restaurant prep
3. **No "based on real preparation times" message**
4. **No phase-aware ETA breakdown** — Customer doesn't know how much is prep vs travel

---

## Data Sources for Learned Prep Times

### Primary: `sla_metrics` table
```sql
-- Already captures prep_seconds per order
SELECT AVG(prep_seconds) / 60 as avg_prep_minutes
FROM sla_metrics
WHERE merchant_id = ? AND prep_seconds > 0
```

### Fallback: Calculate from order timestamps
```sql
-- When sla_metrics is empty, use order timestamps
SELECT AVG(EXTRACT(EPOCH FROM (ready_at - accepted_at)) / 60) as avg_prep_minutes
FROM food_orders  
WHERE restaurant_id = ? AND ready_at IS NOT NULL AND accepted_at IS NOT NULL
  AND status = 'delivered'
```

### Ultimate fallback: Restaurant default
```sql
SELECT avg_prep_time FROM restaurants WHERE id = ?
```

---

## Implementation Plan

### 1) Create useLearnedPrepTime Hook

**File to Create:** `src/hooks/useLearnedPrepTime.ts`

**Purpose:** Fetch restaurant's learned average prep time from historical data.

```typescript
interface LearnedPrepTimeResult {
  avgPrepMinutes: number | null;
  isLearned: boolean;           // true = from actual data, false = from default
  sampleSize: number;           // number of orders used to calculate
  confidence: 'high' | 'medium' | 'low';  // based on sample size
}

export function useLearnedPrepTime(restaurantId: string | undefined): LearnedPrepTimeResult;
```

**Data Fetching Priority:**
1. Check `sla_metrics` for avg prep_seconds by merchant_id
2. If < 5 samples, also check `food_orders` timestamps as backup
3. If no historical data, fall back to `restaurants.avg_prep_time`

**Confidence Levels:**
| Sample Size | Confidence | Description |
|-------------|------------|-------------|
| 20+ orders | high | "Based on 20+ orders" |
| 5-19 orders | medium | "Based on recent orders" |
| < 5 orders | low | Uses restaurant default |

### 2) Update useSmartEta Hook

**File to Modify:** `src/hooks/useSmartEta.ts`

**New Input Props:**
```typescript
interface UseSmartEtaOptions {
  // ... existing props
  
  // NEW: Learned prep time data
  learnedPrepMinutes?: number | null;
  isPrepLearned?: boolean;
  orderPhase?: 'preparing' | 'ready' | 'out_for_delivery';
}
```

**Updated ETA Calculation:**
```typescript
// Calculate total ETA based on phase
function calculateTotalEta(options: {
  orderPhase: string;
  learnedPrepMinutes: number | null;
  travelEtaMinutes: number | null;
  trafficFactor: number;
  demandFactor: number;
}) {
  const { orderPhase, learnedPrepMinutes, travelEtaMinutes, trafficFactor, demandFactor } = options;
  
  // Phase: Preparing → show prep + travel
  if (orderPhase === 'preparing') {
    const adjustedPrep = (learnedPrepMinutes || 20) * demandFactor; // demand affects prep
    const adjustedTravel = (travelEtaMinutes || 10) * trafficFactor; // traffic affects travel
    return adjustedPrep + adjustedTravel;
  }
  
  // Phase: Ready/Out for delivery → travel only
  if (orderPhase === 'ready' || orderPhase === 'out_for_delivery') {
    return (travelEtaMinutes || 10) * trafficFactor;
  }
  
  return learnedPrepMinutes || 25; // Default for pending
}
```

**Output Changes:**
```typescript
interface SmartEtaResult {
  // ... existing fields
  
  // NEW: Breakdown for transparency
  prepComponent: number | null;    // Prep time portion
  travelComponent: number | null;  // Travel time portion
  isPrepLearned: boolean;          // Using real prep data
}
```

### 3) Update SmartEtaDisplay Component

**File to Modify:** `src/components/eats/SmartEtaDisplay.tsx`

**New Props:**
```typescript
interface SmartEtaDisplayProps {
  // ... existing props
  
  // NEW: Prep time context
  isPrepLearned?: boolean;
  showPrepMessage?: boolean;
}
```

**New Message Display:**
```typescript
{/* "Based on real preparation times" message */}
{showPrepMessage && isPrepLearned && (
  <p className="text-xs text-zinc-500 mt-3">
    ETA based on real preparation times.
  </p>
)}

{/* Fallback when not learned */}
{showPrepMessage && !isPrepLearned && (
  <p className="text-xs text-zinc-500 mt-3">
    ETA updated based on traffic and demand.
  </p>
)}
```

### 4) Update EnhancedStatusBanner Component

**File to Modify:** `src/components/eats/EnhancedStatusBanner.tsx`

**New Props:**
```typescript
interface EnhancedStatusBannerProps {
  // ... existing props
  
  // NEW
  isPrepLearned?: boolean;
}
```

**Updated Explanation Message:**
```typescript
{/* Updated explanation based on prep source */}
{showEtaExplanation && (
  <p className="text-xs text-zinc-500 mt-2">
    {isPrepLearned 
      ? "ETA based on real preparation times."
      : "ETA updated based on traffic and demand."}
  </p>
)}
```

### 5) Update useLiveEatsOrder Hook

**File to Modify:** `src/hooks/useLiveEatsOrder.ts`

**Changes:**
Add restaurant `avg_prep_time` to the query join so it's available as fallback:

```typescript
const { data } = await supabase
  .from(EATS_TABLES.orders)
  .select(`
    *,
    restaurants:restaurant_id(name, logo_url, phone, address, lat, lng, avg_prep_time)
  `)
  .eq("id", orderId)
  .single();
```

**Interface Update:**
```typescript
restaurants?: {
  name: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
  avg_prep_time?: number | null;  // NEW
};
```

### 6) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Integration:**
```typescript
// Fetch learned prep time for this restaurant
const learnedPrep = useLearnedPrepTime(order?.restaurant_id);

// Determine order phase for ETA calculation
const orderPhase = useMemo(() => {
  if (order?.status === 'out_for_delivery') return 'out_for_delivery';
  if (order?.status === 'ready_for_pickup') return 'ready';
  if (['confirmed', 'preparing'].includes(order?.status || '')) return 'preparing';
  return 'preparing';
}, [order?.status]);

// Enhanced Smart ETA with prep time
const smartEta = useSmartEta({
  orderStatus: order?.status || "",
  driverAssigned: !!order?.driver_id,
  driverLat,
  driverLng,
  pickupLat,
  pickupLng,
  deliveryLat: order?.delivery_lat,
  deliveryLng: order?.delivery_lng,
  supplyMultiplier: deliveryFactors.supplyMultiplier,
  // NEW: Prep time integration
  learnedPrepMinutes: learnedPrep.avgPrepMinutes,
  isPrepLearned: learnedPrep.isLearned,
  orderPhase,
});
```

**Update Banner Calls:**
```typescript
<EnhancedStatusBanner
  phase={dispatchStatus.phase}
  message={dispatchStatus.message}
  subMessage={dispatchStatus.subMessage}
  etaMinRange={smartEta.etaMinRange}
  etaMaxRange={smartEta.etaMaxRange}
  etaLabel={etaLabel}
  isLocationBased={smartEta.isLive}
  showEtaExplanation={true}
  isPrepLearned={learnedPrep.isLearned}  // NEW
/>
```

### 7) Create Database Function for Learned Prep Time

**SQL Function:** (for efficient aggregation)

```sql
CREATE OR REPLACE FUNCTION get_restaurant_avg_prep_time(p_restaurant_id UUID)
RETURNS TABLE (
  avg_prep_minutes NUMERIC,
  sample_size INT,
  source TEXT
) AS $$
BEGIN
  -- Try sla_metrics first
  RETURN QUERY
  SELECT 
    ROUND(AVG(prep_seconds) / 60.0, 1) as avg_prep_minutes,
    COUNT(*)::INT as sample_size,
    'sla_metrics'::TEXT as source
  FROM sla_metrics
  WHERE merchant_id = p_restaurant_id 
    AND prep_seconds IS NOT NULL 
    AND prep_seconds > 0
  HAVING COUNT(*) >= 3;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Fallback to order timestamps
  RETURN QUERY
  SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (ready_at - accepted_at)) / 60.0), 1),
    COUNT(*)::INT,
    'order_timestamps'::TEXT
  FROM food_orders
  WHERE restaurant_id = p_restaurant_id
    AND ready_at IS NOT NULL 
    AND accepted_at IS NOT NULL
    AND status = 'delivered'
  HAVING COUNT(*) >= 3;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Ultimate fallback: restaurant default
  RETURN QUERY
  SELECT 
    COALESCE(r.avg_prep_time, 25)::NUMERIC,
    0,
    'restaurant_default'::TEXT
  FROM restaurants r
  WHERE r.id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql;
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useLearnedPrepTime.ts` | Fetch and cache learned prep time for restaurant |
| SQL migration | `get_restaurant_avg_prep_time` function |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useSmartEta.ts` | Add prep time to ETA calculation, phase-aware logic |
| `src/hooks/useLiveEatsOrder.ts` | Include `avg_prep_time` in restaurant join |
| `src/components/eats/SmartEtaDisplay.tsx` | Add `isPrepLearned` prop, "real preparation times" message |
| `src/components/eats/EnhancedStatusBanner.tsx` | Add `isPrepLearned` prop, update explanation message |
| `src/pages/EatsOrderDetail.tsx` | Integrate `useLearnedPrepTime`, pass to Smart ETA |

---

## ETA Calculation Formula

```text
Order Phase: PREPARING
├── Prep Component = learnedPrepMinutes × demandFactor
├── Travel Component = driverTravelMinutes × trafficFactor
└── Total ETA = Prep + Travel

Order Phase: READY / OUT_FOR_DELIVERY  
├── Prep Component = 0 (order already prepared)
├── Travel Component = driverTravelMinutes × trafficFactor
└── Total ETA = Travel only

Range Calculation (unchanged):
  Min = floor(totalEta × 0.85)
  Max = ceil(totalEta × combinedFactor × 1.15)
```

**Example Calculation:**
```text
Learned prep time: 18 min (from 25 orders)
Driver travel time: 8 min
Rush hour traffic: 1.4x
Normal demand: 1.0x

Phase: Preparing
  Prep = 18 × 1.0 = 18 min
  Travel = 8 × 1.4 = 11.2 min
  Total = 29.2 min
  
Range: 25–34 min
Message: "ETA based on real preparation times."
```

---

## Message Display Logic

| Condition | Message |
|-----------|---------|
| `isPrepLearned = true` | "ETA based on real preparation times." |
| `isPrepLearned = false` | "ETA updated based on traffic and demand." |
| Arriving soon (< 3 min) | No message (show "Arriving soon!") |

---

## Confidence Indicator (Optional Enhancement)

When sample size is high, show additional context:
```text
"Based on 25+ recent orders from this restaurant"
```

---

## Summary

This implementation enhances ETA accuracy by:

1. **Learning from historical data**: Calculates average prep time from completed orders
2. **Phase-aware calculation**: Adds prep time during preparation, travel time only after pickup
3. **Transparent messaging**: Shows "ETA based on real preparation times" when using learned data
4. **Graceful fallbacks**: Uses restaurant default when insufficient historical data
5. **Maintains existing factors**: Traffic and demand adjustments still apply
