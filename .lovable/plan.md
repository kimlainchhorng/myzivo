
# Better Driver Availability — Implementation Plan

## Overview
Leverage driver schedule data to improve ETA accuracy and show positive messaging during peak driver periods. The system will look ahead at scheduled drivers to predict upcoming supply levels and adjust delivery ETAs accordingly.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Driver schedules table | Complete | `driver_schedules` (day_of_week, start_time, end_time, is_active) |
| Available drivers hook | Complete | `src/hooks/useAvailableDrivers.ts` |
| Driver incentives hook | Complete | `src/hooks/useDriverIncentives.ts` |
| Delivery factors hook | Complete | `src/hooks/useEatsDeliveryFactors.ts` |
| IncentiveBoostBanner | Complete | `src/components/eats/IncentiveBoostBanner.tsx` |
| Smart ETA calculation | Complete | `src/hooks/useSmartEta.ts` |
| Supply-based multipliers | Complete | In useEatsDeliveryFactors (low/moderate/high) |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Scheduled drivers forecast hook | Missing | Look ahead at upcoming scheduled drivers |
| Peak driver period detection | Missing | Identify when more drivers are scheduled |
| Peak driver banner | Missing | "More drivers scheduled for faster delivery" |
| Schedule-aware ETA adjustment | Missing | Reduce ETA when more drivers coming online |

---

## Implementation Plan

### 1) Create Scheduled Drivers Forecast Hook

**File to Create:** `src/hooks/useScheduledDriverForecast.ts`

**Purpose:** Look ahead at driver schedules to predict upcoming supply levels.

**Logic:**
- Query `driver_schedules` for current day
- Count drivers scheduled in upcoming time windows (15, 30, 60 min)
- Compare to current online count to detect "peak incoming"

**Returned Data:**
```text
interface ScheduledDriverForecast {
  // Current state
  currentOnlineCount: number;
  
  // Upcoming schedule
  driversScheduledNext15Min: number;
  driversScheduledNext30Min: number;
  driversScheduledNext60Min: number;
  
  // Peak detection
  isPeakPeriod: boolean;
  peakStartsIn: number | null; // minutes until peak
  peakMessage: string | null;
  
  // ETA adjustment
  scheduleForecastMultiplier: number; // 0.9-1.0 based on incoming drivers
  
  isLoading: boolean;
}
```

**Peak Detection Logic:**
```text
Peak Period = TRUE when:
  - Current time is within a window where 6+ drivers are scheduled
  - OR upcoming 30 min has 3+ more scheduled than currently online

Peak Multiplier:
  - 8+ drivers scheduled: 0.85 (15% faster ETA)
  - 6-7 drivers: 0.90 (10% faster)
  - 4-5 drivers: 0.95 (5% faster)
  - <4 drivers: 1.0 (no adjustment)
```

---

### 2) Create Peak Driver Banner Component

**File to Create:** `src/components/eats/PeakDriverBanner.tsx`

**Purpose:** Show positive messaging when more drivers are scheduled/coming online.

**Message Variants:**
| Scenario | Message |
|----------|---------|
| Peak now | "More drivers scheduled in your area for faster delivery." |
| Peak soon (15 min) | "More drivers coming online soon — expect faster delivery." |
| High supply | "High driver availability — shorter wait times." |

**UI Design:**
```text
┌─────────────────────────────────────────────────┐
│ 🚗✨                                        [×] │
│                                                 │
│ More drivers scheduled in your area            │
│ — faster delivery times expected.              │
└─────────────────────────────────────────────────┘
```

**Features:**
- Green/emerald color scheme (positive messaging)
- Dismissible per session
- Pulsing car icon with sparkles
- Only shows when supply is good (not during low supply warnings)

---

### 3) Update Delivery Factors Hook

**File to Modify:** `src/hooks/useEatsDeliveryFactors.ts`

**Changes:**
- Import and use `useScheduledDriverForecast`
- Add `isPeakPeriod` and `peakMessage` to return type
- Add `showPeakBanner` flag (similar to incentive banner logic)
- Factor schedule forecast into ETA multiplier

**New Return Values:**
```text
interface DeliveryFactors {
  // Existing fields...
  
  // New peak period fields
  isPeakPeriod: boolean;
  peakStartsIn: number | null;
  showPeakBanner: boolean;
  peakMessage: string | null;
  scheduleForecastMultiplier: number;
}
```

**Banner Priority (mutual exclusivity):**
1. Demand surge → show demand banner (warning)
2. Low supply → show supply banner (warning)
3. Incentive active → show incentive banner (positive)
4. Peak scheduled → show peak banner (positive)

---

### 4) Update ETA Calculation with Schedule Forecast

**File to Modify:** `src/hooks/useQueueAwareEta.ts`

**Changes:**
- Accept optional `scheduleForecastMultiplier` parameter
- Apply multiplier to driver time component
- Reduce ETA range when peak period detected

**Updated Calculation:**
```text
driverMinutes = baseDriverMinutes × scheduleForecastMultiplier

Example:
  Base driver time: 12 min
  Peak multiplier: 0.85
  Adjusted: 12 × 0.85 = 10.2 min (rounded to 10)
```

---

### 5) Integrate Peak Banner into Order Pages

**Files to Modify:**
- `src/pages/EatsRestaurantMenu.tsx`
- `src/pages/EatsCheckout.tsx`
- `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Import `useEatsDeliveryFactors` (if not already)
- Show `PeakDriverBanner` when `showPeakBanner` is true
- Pass forecast multiplier to ETA calculations

**Integration on Restaurant Menu:**
```text
{/* Peak Driver Banner - positive messaging */}
{deliveryFactors.showPeakBanner && (
  <PeakDriverBanner
    message={deliveryFactors.peakMessage}
    peakStartsIn={deliveryFactors.peakStartsIn}
    className="mt-4"
  />
)}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useScheduledDriverForecast.ts` | Forecast upcoming driver supply from schedules |
| `src/components/eats/PeakDriverBanner.tsx` | Positive messaging banner for peak periods |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/hooks/useEatsDeliveryFactors.ts` | Add peak period detection and banner logic |
| `src/hooks/useQueueAwareEta.ts` | Apply schedule forecast multiplier to ETA |
| `src/pages/EatsRestaurantMenu.tsx` | Show peak banner when applicable |
| `src/pages/EatsCheckout.tsx` | Show peak banner and use adjusted ETA |

---

## Peak Period Detection Algorithm

### Step 1: Query Today's Schedules
```text
SELECT driver_id, start_time, end_time
FROM driver_schedules
WHERE day_of_week = current_day
  AND is_active = true
```

### Step 2: Count Drivers by Time Window
```text
current_time = now()

scheduled_now = count where:
  start_time <= current_time <= end_time

scheduled_15min = count where:
  start_time <= current_time + 15 min
  AND end_time >= current_time

scheduled_30min = count where:
  start_time <= current_time + 30 min
  AND end_time >= current_time
```

### Step 3: Determine Peak Status
```text
online_now = current available drivers count

is_peak_period = 
  scheduled_now >= 6 OR
  (scheduled_30min - online_now) >= 3

peak_starts_in = 
  If !is_peak_period AND scheduled_30min >= 6:
    Calculate minutes until first 6+ driver window
  Else:
    null
```

### Step 4: Calculate Forecast Multiplier
```text
If scheduled_now >= 8:
  multiplier = 0.85
Else If scheduled_now >= 6:
  multiplier = 0.90
Else If scheduled_now >= 4:
  multiplier = 0.95
Else:
  multiplier = 1.0
```

---

## Banner Display Logic

### Priority Order (mutually exclusive)
```text
1. demandActive → Show HighDemandBanner (warning - amber/red)
2. showLowSupplyWarning → Show LowDriverSupplyBanner (warning - amber)
3. showIncentiveBanner → Show IncentiveBoostBanner (positive - emerald)
4. showPeakBanner → Show PeakDriverBanner (positive - emerald)
5. None → No banner
```

### Peak Banner Conditions
```text
showPeakBanner = 
  isPeakPeriod AND
  !demandActive AND
  driverSupply !== "low" AND
  !showIncentiveBanner
```

---

## ETA Adjustment Examples

### Example 1: Peak Period Active
```text
Base ETA:
  Queue: 5 min
  Prep: 20 min
  Driver: 12 min
  
Peak Multiplier: 0.85 (8+ drivers scheduled)

Adjusted:
  Queue: 5 min
  Prep: 20 min
  Driver: 12 × 0.85 = 10 min
  
Total: 35 min → Range: 30-40 min
(vs. 37 min → 31-43 min without adjustment)
```

### Example 2: Peak Coming Soon
```text
Current: 3 drivers online
In 20 min: 7 drivers scheduled

Message: "More drivers coming online soon — expect faster delivery."
Multiplier: 0.95 (slight optimism since peak approaching)
```

---

## UI Components

### Peak Banner (Current Peak)
```text
┌─────────────────────────────────────────────────┐
│ 🚗✨                                        [×] │
│                                                 │
│ More drivers scheduled in your area            │
│ — faster delivery times.                       │
└─────────────────────────────────────────────────┘
```

### Peak Banner (Upcoming Peak)
```text
┌─────────────────────────────────────────────────┐
│ 🚗✨                                        [×] │
│                                                 │
│ More drivers coming online soon                │
│ — expect faster delivery in ~15 min.           │
└─────────────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No schedules configured | Fall back to current online count only |
| All drivers have no schedules | Treat as always available when online |
| Schedule ends soon | Don't show peak if ending in <15 min |
| Overlap with incentive | Prefer incentive banner (more specific) |
| Weekend vs weekday | Use day_of_week filter |
| Driver goes offline during peak | Real-time count takes precedence |

---

## Summary

This implementation provides:

1. **Schedule-aware forecasting** — Look ahead at driver schedules to predict supply
2. **Peak period detection** — Identify when 6+ drivers are scheduled/coming online
3. **Positive customer messaging** — "More drivers scheduled for faster delivery"
4. **ETA optimization** — Reduce delivery time estimates during peak periods
5. **Smart banner priority** — Show most relevant message (warnings over positive)
6. **Real-time integration** — Combines scheduled data with live online counts

The feature improves ETA accuracy by leveraging schedule data and builds customer confidence by showing when more drivers are available.
