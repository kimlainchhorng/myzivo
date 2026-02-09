
# ETA Accuracy Improvements — Implementation Plan

## Overview
Enhance ETA accuracy by incorporating driver supply data alongside existing demand signals. Add clear messaging when few drivers are available to set proper customer expectations.

---

## Current State Analysis

### Already Complete
| Feature | Status | Location |
|---------|--------|----------|
| Demand-based surge detection | Complete | `useEatsSurgePricing`, `lib/surge.ts` |
| High demand messaging | Complete | `HighDemandBanner` - "High demand in your area" |
| Traffic-aware ETA | Complete | `EtaCountdown` with rush hour/late night multipliers |
| Demand note in ETA | Complete | `showDemandNote` prop shows "Busy time — ETA includes buffer" |
| Driver availability hook | Complete | `useAvailableDrivers`, `useAvailableDriversCount` |
| Live driver location tracking | Complete | `useLiveDriverTracking`, `useDriverAvailability` |
| Batch position ETA | Complete | Uses batch stop ETA for grouped orders |

### Missing
| Feature | What's Needed |
|---------|---------------|
| Supply-aware ETA adjustment | Apply multiplier when few drivers are available |
| Low supply messaging | Show "High demand — delivery may take longer" when driver supply is low |
| Combined demand+supply factor | Merge demand level with driver availability for comprehensive ETA |
| Driver supply indicator | Show driver count context in EtaCountdown |

---

## Implementation Plan

### 1) Create useEatsDeliveryFactors Hook

**File to Create:** `src/hooks/useEatsDeliveryFactors.ts`

**Purpose:** Combine demand level and driver supply into a single comprehensive delivery factor for ETA adjustment.

```typescript
interface DeliveryFactors {
  // Core factors
  demandLevel: SurgeLevel;
  driverSupply: "low" | "moderate" | "high";
  nearbyDriverCount: number;
  
  // Computed
  etaMultiplier: number;  // Combined factor for ETA adjustment
  showLowSupplyWarning: boolean;
  warningMessage: string | null;
  warningType: "demand" | "supply" | "both" | null;
}
```

**Logic:**
- **Driver Supply Levels:**
  - `low`: 0-2 drivers nearby — 1.5x ETA multiplier
  - `moderate`: 3-5 drivers nearby — 1.2x ETA multiplier
  - `high`: 6+ drivers nearby — 1.0x (no adjustment)

- **Combined Multiplier:**
  - Base: Traffic multiplier (existing)
  - + Demand: surge multiplier from `useEatsSurgePricing`
  - + Supply: driver availability factor
  - Cap at 2.0x to avoid unrealistic ETAs

### 2) Create LowDriverSupplyBanner Component

**File to Create:** `src/components/eats/LowDriverSupplyBanner.tsx`

**Purpose:** Show when few drivers are available, complementing the existing `HighDemandBanner`.

**UI Design:**
```
+----------------------------------------------------------+
| [🚗⚠]  Limited drivers available                         |
|        Delivery may take longer than usual.              |
|        We're actively finding more drivers.          [X] |
+----------------------------------------------------------+
```

**Variants by severity:**
| Driver Count | Style | Message |
|--------------|-------|---------|
| 0 drivers | Red | "No drivers nearby — delivery times are extended" |
| 1-2 drivers | Orange | "High demand — delivery may take longer" |
| 3-5 drivers | Amber | "Busy area — delivery may take a bit longer" |

**Features:**
- Animated entry matching `HighDemandBanner` style
- Dismissible per-order (sessionStorage)
- Different from demand banner (this is supply-focused)
- Only shown when demand banner is NOT shown (avoid double messaging)

### 3) Enhance EtaCountdown with Supply Factor

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
- Add new props for supply-aware calculation:
  ```typescript
  interface EtaCountdownProps {
    // ... existing props
    /** Driver supply factor for ETA adjustment */
    supplyMultiplier?: number;
    /** Number of nearby drivers */
    nearbyDriverCount?: number;
    /** Whether to show low supply note */
    showLowSupplyNote?: boolean;
  }
  ```

- Update ETA calculation to include supply factor:
  ```typescript
  const withTrafficAndSupply = baseMinutes * traffic.multiplier * (supplyMultiplier || 1.0);
  ```

- Add low supply indicator (similar to existing traffic note):
  ```
  [🚗] Few drivers nearby — ETA extended
  ```

### 4) Integrate Supply Awareness in EatsOrderDetail

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Import `useEatsDeliveryFactors` hook
2. Import `LowDriverSupplyBanner` component
3. Pass supply factors to `EtaCountdown`
4. Show `LowDriverSupplyBanner` when appropriate (and demand banner NOT shown)

**Hook usage:**
```typescript
const deliveryFactors = useEatsDeliveryFactors({
  restaurantLat: order?.restaurants?.lat,
  restaurantLng: order?.restaurants?.lng,
});
```

**Banner logic (mutual exclusivity):**
```typescript
{/* Show either demand OR supply banner, not both */}
{demandActive && isActiveOrder && (
  <HighDemandBanner level={demandLevel} orderId={order.id} />
)}
{!demandActive && deliveryFactors.showLowSupplyWarning && isActiveOrder && (
  <LowDriverSupplyBanner
    driverCount={deliveryFactors.nearbyDriverCount}
    orderId={order.id}
  />
)}
```

**EtaCountdown update:**
```typescript
<EtaCountdown
  // ... existing props
  supplyMultiplier={deliveryFactors.etaMultiplier}
  nearbyDriverCount={deliveryFactors.nearbyDriverCount}
  showLowSupplyNote={deliveryFactors.driverSupply === "low"}
/>
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useEatsDeliveryFactors.ts` | Combine demand + supply for ETA adjustment |
| `src/components/eats/LowDriverSupplyBanner.tsx` | Banner for low driver availability |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/components/eats/EtaCountdown.tsx` | Add supply multiplier and low supply note |
| `src/pages/EatsOrderDetail.tsx` | Integrate delivery factors hook and banner |

---

## ETA Calculation Logic

### Current Flow
```
Base ETA (distance / speed)
    ↓
Traffic Multiplier (rush hour 1.4x, late night 0.8x)
    ↓
Display ETA
```

### Enhanced Flow
```
Base ETA (distance / speed)
    ↓
Traffic Multiplier (rush hour 1.4x, late night 0.8x)
    ↓
Supply Multiplier (0-2 drivers: 1.5x, 3-5: 1.2x, 6+: 1.0x)
    ↓
Demand Buffer (if surge active)
    ↓
Cap at 2.0x total adjustment
    ↓
Display ETA with appropriate messaging
```

### Multiplier Examples
| Scenario | Traffic | Supply | Demand | Total | 10 min base → |
|----------|---------|--------|--------|-------|---------------|
| Normal day, good supply | 1.0x | 1.0x | 1.0x | 1.0x | 10 min |
| Rush hour, good supply | 1.4x | 1.0x | 1.0x | 1.4x | 14 min |
| Normal, few drivers | 1.0x | 1.5x | 1.0x | 1.5x | 15 min |
| Rush hour, few drivers | 1.4x | 1.5x | 1.0x | 2.0x (capped) | 20 min |
| Rush hour, high demand | 1.4x | 1.0x | 1.25x | 1.75x | 18 min |

---

## UI Components

### LowDriverSupplyBanner (New)
```
+----------------------------------------------------------+
| [🚗]  High demand — delivery may take longer         [X] |
|       Only 2 drivers available nearby.                   |
|       We're actively finding more drivers.               |
+----------------------------------------------------------+
```
- Background: `bg-orange-500/10` (matches high demand theme)
- Icon: Car with warning indicator
- Dismissible

### EtaCountdown with Supply Note
```
+------------------------------------------+
| [🕐]  Arriving in                        |
|       22 min                             |
|                                          |
| 🚗 Few drivers nearby — ETA adjusted     |
+------------------------------------------+
```

### Combined Messaging Priority
1. **Driver Arriving** (< 0.2 mi) — No warnings shown
2. **Traffic Note** — Rush hour adjustment (existing)
3. **Supply Note** — Few drivers (new, only if no traffic note)
4. **Demand Note** — Busy time buffer (existing, only if no above)

---

## Technical Notes

### Driver Supply Calculation
- Uses existing `useDriverAvailability` hook
- Filters to verified online drivers within 5-mile radius of restaurant
- Thresholds based on typical delivery zones:
  - 0-2: Critical shortage
  - 3-5: Below normal
  - 6+: Normal capacity

### Message Selection Logic
To avoid overwhelming users with multiple warnings:
```typescript
// Priority order for notes in EtaCountdown
if (isArrivingSoon) → No notes
else if (showTrafficNote) → "Rush hour — adjusted for traffic"
else if (showLowSupplyNote) → "Few drivers nearby — ETA adjusted"
else if (hasDemandBuffer) → "Busy time — ETA includes buffer"
```

### Banner Selection Logic
```typescript
// Only show one banner at a time
if (demandActive) → HighDemandBanner
else if (lowDriverSupply) → LowDriverSupplyBanner
else if (batchStopsBefore > 0) → GroupedDeliveryBanner
```

---

## Data Flow

```
Restaurant Location
       ↓
useEatsDeliveryFactors(restaurantLat, restaurantLng)
       ↓
Fetches nearby drivers via useDriverAvailability
       ↓
Returns:
├── demandLevel: from useEatsSurgePricing
├── driverSupply: "low" | "moderate" | "high"
├── nearbyDriverCount: 2
├── etaMultiplier: 1.5
├── showLowSupplyWarning: true
└── warningMessage: "High demand — delivery may take longer"
       ↓
EatsOrderDetail renders:
├── LowDriverSupplyBanner (if supply low and no demand surge)
└── EtaCountdown (with supply-adjusted ETA and note)
```

---

## Summary

This implementation provides more accurate ETAs by considering:

1. **Driver Supply** — Low driver availability extends ETA with clear messaging
2. **Combined Factors** — Traffic + Supply + Demand for comprehensive adjustment
3. **Clear Messaging** — "High demand — delivery may take longer" when few drivers available
4. **Non-Overlapping UI** — Either demand OR supply banner shown, not both
5. **Capped Multipliers** — Maximum 2.0x total adjustment to avoid unrealistic times

The key customer message for low driver supply:
> **"High demand — delivery may take longer."**

This matches the user's exact requirement while providing the technical infrastructure for accurate, supply-aware ETAs.
