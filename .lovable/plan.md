
# Demand Awareness (ETA Accuracy) for Eats

## Overview
Improve ETA transparency during high demand by showing customers a contextual message when delivery times may be longer, and adjusting ETA calculations based on the current demand level from zone data.

---

## Current State Analysis

### Already Complete
| Feature | Status | Location |
|---------|--------|----------|
| `useEatsSurgePricing` hook | Complete | Fetches global surge multiplier, returns level (Low/Medium/High) |
| `surge_multipliers` table | Complete | Stores zone='GLOBAL' multiplier for demand-based pricing |
| `EatsSurgeBadge` component | Complete | Shows badge on restaurant list when surge active |
| `EtaCountdown` component | Complete | Shows ETA with countdown on order detail page |
| `eats-auto-dispatch` edge function | Complete | Calculates ETA based on distance only |
| `EatsOrderDetail.tsx` | Complete | Order tracking page with status, driver info, map |

### Missing
| Feature | Status |
|---------|--------|
| High demand message on order detail page | Need to add |
| ETA adjustment based on demand level | Need to add to edge function |
| Demand-aware ETA display on order screen | Need to add to EtaCountdown |
| Transparent messaging about delay reasons | Need to create component |

---

## Implementation Plan

### 1) Create High Demand Banner Component

**File to Create:** `src/components/eats/HighDemandBanner.tsx`

**Purpose:** Display a contextual message when demand is high during order tracking.

**UI:**
```text
+----------------------------------------------------------+
| [🔥] High demand in your area                            |
|     Delivery may take a little longer than usual.        |
|     We appreciate your patience!                         |
+----------------------------------------------------------+
```

**Variants:**
| Level | Icon | Message | Color |
|-------|------|---------|-------|
| Medium | Clock | "Busy area — delivery may take a bit longer" | Amber |
| High | Flame | "High demand in your area — delivery time may be slightly longer" | Orange/Red |

**Features:**
- Animated entry with Framer Motion
- Dismissible (stores in sessionStorage)
- Links to surge explainer if tapped

### 2) Add Demand Banner to Order Detail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Import `useEatsSurgePricing` hook
- Import new `HighDemandBanner` component
- Display banner below status banner when demand is Medium or High
- Only show for active orders (not delivered/cancelled)

**Placement:** Between live status banner and scheduled delivery banner

```typescript
// Import
import { useEatsSurgePricing } from "@/hooks/useEatsSurgePricing";
import { HighDemandBanner } from "@/components/eats/HighDemandBanner";

// In component
const { level: demandLevel, isActive: demandActive } = useEatsSurgePricing();

// In render, after status banner:
{demandActive && order.status !== "delivered" && order.status !== "cancelled" && (
  <HighDemandBanner level={demandLevel} orderId={order.id} />
)}
```

### 3) Enhance EtaCountdown with Demand Awareness

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
- Add optional `demandLevel` prop
- Show subtle indicator when ETA includes demand buffer
- Display "Includes busy time buffer" note when relevant

**New Props:**
```typescript
interface EtaCountdownProps {
  // ... existing props
  demandLevel?: SurgeLevel;  // New prop
  showDemandNote?: boolean;  // Show "includes busy time buffer" note
}
```

**UI Enhancement:**
```text
+------------------------------------------+
| [🕐]  Arriving in                        |
|       35 min                             |
|                                          |
| [🔥 Includes busy time buffer]     Live  |
+------------------------------------------+
```

### 4) Update ETA Calculation in Edge Function

**File to Modify:** `supabase/functions/eats-auto-dispatch/index.ts`

**Changes:**
- Fetch current surge multiplier from `surge_multipliers` table
- Add demand-based buffer to ETA calculation
- Store demand level with order for historical tracking

**Demand Buffers:**
| Surge Level | Multiplier | ETA Buffer |
|-------------|------------|------------|
| Low | 1.0 | +0 min |
| Medium | 1.01-1.5 | +5 min |
| High | >1.5 | +10 min |

**Updated calculateETA function:**
```typescript
function calculateETA(
  driverLat: number, 
  driverLng: number,
  restaurantLat: number, 
  restaurantLng: number,
  customerLat: number | null, 
  customerLng: number | null,
  surgeMultiplier: number = 1.0  // New parameter
) {
  const distanceToRestaurant = calculateDistance(driverLat, driverLng, restaurantLat, restaurantLng);
  const etaPickupMinutes = Math.ceil(distanceToRestaurant / AVG_SPEED_KM_PER_MIN);
  
  let etaDeliveryMinutes = 15;
  if (customerLat && customerLng) {
    const distanceToCustomer = calculateDistance(restaurantLat, restaurantLng, customerLat, customerLng);
    etaDeliveryMinutes = Math.ceil(distanceToCustomer / AVG_SPEED_KM_PER_MIN);
  }
  
  // Add demand buffer based on surge level
  let demandBuffer = 0;
  if (surgeMultiplier > 1.5) {
    demandBuffer = 10; // High demand
  } else if (surgeMultiplier > 1.0) {
    demandBuffer = 5;  // Medium demand
  }
  
  const totalMinutes = etaPickupMinutes + etaDeliveryMinutes + demandBuffer;
  const now = new Date();
  
  return {
    eta_pickup: new Date(now.getTime() + etaPickupMinutes * 60 * 1000).toISOString(),
    eta_dropoff: new Date(now.getTime() + totalMinutes * 60 * 1000).toISOString(),
    eta_minutes: totalMinutes,
    demand_buffer: demandBuffer,
  };
}
```

### 5) Pass Demand Level to EtaCountdown

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Pass demand level to EtaCountdown component
- Show demand note when buffer was applied

```typescript
<EtaCountdown
  etaDropoff={order.eta_dropoff}
  driverLat={driverLat}
  driverLng={driverLng}
  deliveryLat={order.delivery_lat ?? undefined}
  deliveryLng={order.delivery_lng ?? undefined}
  demandLevel={demandLevel}  // New prop
  showDemandNote={demandActive}  // New prop
/>
```

---

## File Summary

### New Files (1)
| File | Purpose |
|------|---------|
| `src/components/eats/HighDemandBanner.tsx` | Contextual demand message for order tracking |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Add surge hook, display HighDemandBanner, pass demand to EtaCountdown |
| `src/components/eats/EtaCountdown.tsx` | Add demandLevel prop, show "busy time buffer" note |
| `supabase/functions/eats-auto-dispatch/index.ts` | Fetch surge, add demand buffer to ETA calculation |

---

## UI Components

### HighDemandBanner (Medium Level)
```text
+----------------------------------------------------------+
| [⏱️]  Busy area right now                                |
|       Delivery may take a bit longer than usual.         |
+----------------------------------------------------------+
```
- Background: `bg-amber-500/10`
- Border: `border-amber-500/30`
- Icon: Clock (amber)

### HighDemandBanner (High Level)
```text
+----------------------------------------------------------+
| [🔥]  High demand in your area                           |
|       Delivery time may be slightly longer.              |
|       We appreciate your patience!                       |
+----------------------------------------------------------+
```
- Background: `bg-orange-500/10`
- Border: `border-orange-500/30`
- Icon: Flame (orange, animated pulse)

### EtaCountdown with Demand Note
```text
+------------------------------------------+
| [🕐]  Arriving in                        |
|       38 min                             |
|                                          |
| ─────────────────────────────────────────|
| 🔥 Busy time — ETA includes buffer  Live |
+------------------------------------------+
```

---

## Data Flow

```text
Order placed
      ↓
eats-auto-dispatch triggered when order ready
      ↓
Fetch current surge_multiplier from database
├── multiplier = 1.0 → buffer = 0 min
├── multiplier 1.01-1.5 → buffer = +5 min
└── multiplier > 1.5 → buffer = +10 min
      ↓
Calculate ETA = pickup_time + delivery_time + demand_buffer
      ↓
Store eta_dropoff, eta_minutes on order
      ↓
Customer opens EatsOrderDetail
      ↓
useEatsSurgePricing fetches current demand level
      ↓
If demand is Medium or High:
├── Show HighDemandBanner below status
└── Show "Busy time buffer" note on EtaCountdown
      ↓
Customer sees transparent messaging:
"High demand in your area — delivery time may be slightly longer"
```

---

## Demand Level Thresholds

Using existing logic from `getSurgeLevelFromMultiplier()`:

| Multiplier | Level | Banner Color | ETA Buffer | Message |
|------------|-------|--------------|------------|---------|
| 1.0 | Low | Hidden | +0 min | None |
| 1.01-1.5 | Medium | Amber | +5 min | "Busy area — delivery may take a bit longer" |
| > 1.5 | High | Orange | +10 min | "High demand in your area — delivery time may be slightly longer" |

---

## Technical Notes

### Why Global Surge?
The `surge_multipliers` table currently uses zone='GLOBAL' for simplicity. Future enhancement could support zone-specific surge based on `pricing_zones` or `regions`.

### Banner Dismissal
HighDemandBanner can be dismissed by the user. Dismissal is stored in `sessionStorage` per order to avoid repeated display in the same session, but will reappear on fresh page load.

### ETA Buffer Accuracy
The buffer is conservative (5-10 min) to set realistic expectations. Better to under-promise and over-deliver than frustrate customers with inaccurate ETAs.

### Real-time Updates
EtaCountdown already recalculates dynamically based on driver location. The demand buffer is applied at dispatch time and baked into `eta_dropoff`, so real-time adjustments use the demand-aware initial estimate.

---

## Summary

This implementation improves ETA transparency during high demand by:

1. **HighDemandBanner** - Contextual message on order detail page during Medium/High demand
2. **ETA Buffer** - Adds 5-10 minutes to ETA calculation based on surge level
3. **EtaCountdown Enhancement** - Shows "Includes busy time buffer" note when applicable
4. **Edge Function Update** - Fetches surge multiplier and factors demand into ETA calculation

Leverages existing surge infrastructure (`useEatsSurgePricing`, `surge_multipliers` table) with minimal new code, providing customers with honest expectations during busy periods.
