
# Incentive Awareness — Implementation Plan

## Overview
Add incentive-period awareness to improve ETA accuracy and optionally display a positive messaging banner when driver incentives are active ("More drivers online in your area — faster delivery times.").

---

## Current State Analysis

### Database Schema Available
The `driver_incentives` table already exists:
```typescript
driver_incentives: {
  id: string;
  name: string | null;
  bonus_amount: number | null;
  start_time: string | null;      // Time window start (e.g., "11:00")
  end_time: string | null;        // Time window end (e.g., "14:00")
  conditions_json: Json | null;   // Additional conditions
  created_at: string | null;
}
```

### Current ETA System
The `useEatsDeliveryFactors` hook already combines:
- **Demand level** (surge pricing)
- **Driver supply** (nearby driver count)
- ETA multipliers: low supply = 1.5x, moderate = 1.2x, high = 1.0x

### Current Banners
- `HighDemandBanner` — Shows when demand is high (negative signal)
- `LowDriverSupplyBanner` — Shows when few drivers nearby (negative signal)
- No positive signal banner currently exists

---

## Implementation Plan

### 1) Create useDriverIncentives Hook

**File to Create:** `src/hooks/useDriverIncentives.ts`

**Purpose:** Fetch active driver incentives and determine if we're in an incentive period.

```typescript
interface ActiveIncentive {
  id: string;
  name: string;
  bonusAmount: number;
}

interface DriverIncentivesInfo {
  isIncentivePeriod: boolean;
  activeIncentives: ActiveIncentive[];
  isLoading: boolean;
}
```

**Logic:**
```text
Current Time Check:
  ↓
Query driver_incentives where:
  - start_time <= current_time
  - end_time >= current_time
  ↓
If any active incentives found:
  → isIncentivePeriod = true
  → activeIncentives = matching records
Else:
  → isIncentivePeriod = false
```

**Query Strategy:**
```typescript
const { data } = await supabase
  .from("driver_incentives")
  .select("id, name, bonus_amount, start_time, end_time")
  .not("start_time", "is", null)
  .not("end_time", "is", null);

// Filter client-side for current time window
const currentTime = format(new Date(), "HH:mm");
const active = data?.filter(incentive => 
  currentTime >= incentive.start_time && 
  currentTime <= incentive.end_time
);
```

### 2) Update useEatsDeliveryFactors Hook

**File to Modify:** `src/hooks/useEatsDeliveryFactors.ts`

**Changes:**
1. Import and use `useDriverIncentives`
2. Add incentive period to delivery factors
3. Apply ETA reduction when incentive is active

**New Interface Fields:**
```typescript
export interface DeliveryFactors {
  // Existing fields...
  demandLevel: SurgeLevel;
  driverSupply: DriverSupplyLevel;
  supplyMultiplier: number;
  
  // NEW: Incentive awareness
  isIncentivePeriod: boolean;
  incentiveMultiplier: number;      // 0.85 when active (15% faster)
  showIncentiveBanner: boolean;     // Show positive banner
  incentiveMessage: string | null;  // "More drivers online..."
}
```

**ETA Adjustment Logic:**
```text
If incentive period is active:
  → incentiveMultiplier = 0.85 (15% faster ETAs)
  → showIncentiveBanner = true (if supply is also good)
Else:
  → incentiveMultiplier = 1.0 (no adjustment)
  → showIncentiveBanner = false
```

**Combined Multiplier:**
```typescript
// Final ETA multiplier considers all factors
const finalMultiplier = supplyMultiplier * incentiveMultiplier;
// e.g., low supply (1.5) + incentive (0.85) = 1.275x
// e.g., high supply (1.0) + incentive (0.85) = 0.85x (faster!)
```

### 3) Create IncentiveBoostBanner Component

**File to Create:** `src/components/eats/IncentiveBoostBanner.tsx`

**Purpose:** Positive messaging banner when incentives attract more drivers.

**UI Design:**
```text
+----------------------------------------------------------+
| [🚗✨]  More drivers online in your area            [X]  |
|         — faster delivery times.                         |
+----------------------------------------------------------+
Background: bg-emerald-500/10 border-emerald-500/30
```

**Props:**
```typescript
interface IncentiveBoostBannerProps {
  orderId?: string;        // For session-based dismissal
  className?: string;
  variant?: "compact" | "full";
}
```

**Behavior:**
- Dismissible per-session (sessionStorage)
- Emerald/green theme (positive signal)
- Animated car + sparkle icon
- Only shows when both:
  1. `isIncentivePeriod === true`
  2. Supply is NOT low (don't mix positive/negative signals)

### 4) Update EtaCountdown Component

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
Add incentive multiplier to ETA calculation:

**Current Calculation:**
```typescript
const combinedMultiplier = Math.min(traffic.multiplier * supplyMultiplier, 2.0);
```

**Updated Calculation:**
```typescript
// New prop
incentiveMultiplier?: number;

// Updated calculation
const combinedMultiplier = Math.min(
  traffic.multiplier * supplyMultiplier * (incentiveMultiplier ?? 1.0), 
  2.0
);

// Add incentive note when active
{showIncentiveNote && (
  <div className="mt-3 flex items-center gap-2 text-xs">
    <Sparkles className="w-3 h-3 text-emerald-500" />
    <span className="text-emerald-400/80">
      Peak driver hours — faster delivery
    </span>
  </div>
)}
```

### 5) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Import `IncentiveBoostBanner`
2. Show banner when incentive is active and supply is good
3. Pass incentive multiplier to EtaCountdown

**Banner Priority Logic:**
```text
Banner Display Priority (mutually exclusive):
1. HighDemandBanner — if demand surge active
2. LowDriverSupplyBanner — if supply is low
3. IncentiveBoostBanner — if incentive active AND supply is good
4. None — normal conditions
```

**Implementation:**
```typescript
{/* Positive: Incentive boost banner */}
{deliveryFactors.showIncentiveBanner && isActiveOrder && (
  <IncentiveBoostBanner orderId={order.id} />
)}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useDriverIncentives.ts` | Hook to check active driver incentive periods |
| `src/components/eats/IncentiveBoostBanner.tsx` | Positive messaging banner for incentive periods |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/hooks/useEatsDeliveryFactors.ts` | Add incentive awareness, adjust ETA multiplier |
| `src/components/eats/EtaCountdown.tsx` | Accept incentive multiplier, show incentive note |
| `src/pages/EatsOrderDetail.tsx` | Display IncentiveBoostBanner when appropriate |

---

## ETA Adjustment Summary

| Condition | Multiplier | Effect |
|-----------|------------|--------|
| Normal supply | 1.0x | Base ETA |
| Low supply | 1.5x | +50% ETA |
| Moderate supply | 1.2x | +20% ETA |
| Incentive active | 0.85x | -15% ETA |
| Rush hour traffic | 1.4x | +40% ETA |
| Late night | 0.8x | -20% ETA |

**Combined Example:**
- Moderate supply (1.2) + Incentive active (0.85) = 1.02x (nearly normal)
- High supply (1.0) + Incentive active (0.85) = 0.85x (faster!)
- Low supply (1.5) + Incentive active (0.85) = 1.275x (still slower, but improved)

---

## Banner Display Logic

```text
                    Supply Level
                    ↓
    ┌───────────────┴───────────────┐
    Low/Moderate                   High
    ↓                               ↓
Check Demand                   Check Incentive
    ↓                               ↓
┌───┴───┐                      ┌───┴───┐
High   Low                     Yes    No
↓       ↓                       ↓      ↓
Demand  Supply                Incentive (nothing)
Banner  Banner                Banner
```

**Key Rule:** Never show IncentiveBoostBanner together with negative banners.

---

## Customer-Facing Message

The exact message as requested:
> **"More drivers online in your area — faster delivery times."**

This is a positive, reassuring message that:
1. Explains WHY delivery might be faster
2. Doesn't create false expectations (only shows when conditions are good)
3. Complements the ETA improvement with context

---

## Data Flow

```text
driver_incentives (DB)
        ↓
useDriverIncentives (Hook)
        ↓
    ┌───┴───┐
    isIncentivePeriod
    activeIncentives
        ↓
useEatsDeliveryFactors (Hook)
        ↓
    ┌───┴────────┬────────────┐
    incentive    showIncentive  Combined
    Multiplier   Banner         ETA Factors
        ↓            ↓              ↓
EtaCountdown   IncentiveBoost   Delivery
(faster ETA)   Banner           Estimate
```

---

## Summary

This implementation:

1. **ETA Accuracy**: Uses incentive-active periods to reduce ETA by ~15% when more drivers are expected to be online due to bonus incentives.

2. **Optional Banner**: Shows the positive message "More drivers online in your area — faster delivery times." only when:
   - An incentive period is active
   - Driver supply is good (not low)
   - No negative banners (demand/supply) are showing

3. **Non-Conflicting**: Maintains mutual exclusivity with existing warning banners to avoid confusing mixed signals.

4. **Leverages Existing Tables**: Uses the existing `driver_incentives` table that already has `start_time` and `end_time` fields for time-based incentive windows.
