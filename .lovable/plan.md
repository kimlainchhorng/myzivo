
# Queue-Aware ETA — Implementation Plan

## Overview
Improve delivery ETA accuracy by factoring in restaurant queue length (active orders) into all ETA calculations. This provides more realistic expectations for customers when restaurants are experiencing high order volume.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Smart ETA hook | Complete | `src/hooks/useSmartEta.ts` |
| SmartEtaDisplay component | Complete | `src/components/eats/SmartEtaDisplay.tsx` |
| Busy restaurant banner | Complete | `src/components/eats/BusyRestaurantBanner.tsx` |
| Restaurant availability hook | Complete | `src/hooks/useRestaurantAvailability.ts` |
| Learned prep time hook | Complete | `src/hooks/useLearnedPrepTime.ts` |
| Zone stats (pending orders) | Complete | `src/hooks/useZoneStats.ts` |
| Restaurant table fields | Complete | `busy_mode`, `max_active_orders`, `auto_busy_enabled` |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Restaurant queue length hook | Missing | Fetch active order count for a restaurant |
| Queue-aware prep time calculation | Missing | Adjust prep time based on queue length |
| High volume banner for restaurant page | Missing | "High order volume" message |
| Checkout ETA breakdown | Missing | Show prep + cooking + driver time |
| ETA breakdown component | Missing | Visual display of ETA components |

---

## Implementation Plan

### 1) Create Restaurant Queue Hook

**File to Create:** `src/hooks/useRestaurantQueueLength.ts`

**Purpose:** Fetch the count of active orders for a specific restaurant.

**Logic:**
- Query `food_orders` table for orders in active states (placed, confirmed, preparing, ready)
- Filter by restaurant_id
- Return count and estimated queue time

```text
Interface:
┌─────────────────────────────────────────────────┐
│ useRestaurantQueueLength(restaurantId)          │
├─────────────────────────────────────────────────┤
│ Returns:                                        │
│   - queueLength: number                         │
│   - queueWaitMinutes: number (calculated)       │
│   - isHighVolume: boolean (>3 orders)           │
│   - isLoading: boolean                          │
└─────────────────────────────────────────────────┘
```

**Queue Time Formula:**
```text
For each order in queue:
  If status = "placed" or "confirmed":
    Add full prep time (learned or default)
  If status = "preparing":
    Add 50% of prep time (partially done)
  If status = "ready":
    Add 0 (waiting for pickup only)

Queue Wait = Sum of queue order times
```

---

### 2) Create Queue-Aware ETA Hook

**File to Create:** `src/hooks/useQueueAwareEta.ts`

**Purpose:** Combine queue length, learned prep time, and delivery factors into a comprehensive ETA.

**ETA Components:**
1. **Queue Time** — Time waiting for orders ahead
2. **Prep Time** — Cooking time for this order
3. **Driver Time** — Travel time from restaurant to customer

```text
Total ETA = Queue Wait + Prep Time + Driver Time

Example:
  Queue: 2 orders ahead × 15 min avg = 30 min queue
  Prep: 20 min (from learned prep time)
  Driver: 12 min (from distance/traffic)
  
  Total: 30 + 20 + 12 = 62 min
  Range: 52–72 min (with variability buffer)
```

**Returned Data:**
```text
┌─────────────────────────────────────────────────┐
│ useQueueAwareEta(restaurantId, options)         │
├─────────────────────────────────────────────────┤
│ Returns:                                        │
│   - etaMinRange: number                         │
│   - etaMaxRange: number                         │
│   - breakdown: {                                │
│       queueMinutes: number                      │
│       prepMinutes: number                       │
│       driverMinutes: number                     │
│     }                                           │
│   - isHighVolume: boolean                       │
│   - queueMessage: string | null                 │
└─────────────────────────────────────────────────┘
```

---

### 3) Create High Volume Banner Component

**File to Create:** `src/components/eats/HighVolumeBanner.tsx`

**Purpose:** Display contextual banner on restaurant page when queue is high.

**Message:**
```text
"High order volume — preparation may take longer."
```

**Trigger Conditions:**
- Queue length ≥ 3 active orders, OR
- Restaurant `busy_mode` = true

**UI Design:**
```text
+------------------------------------------------+
| 📋 HIGH ORDER VOLUME                       [×] |
|                                                |
| Preparation may take longer.                   |
| Current wait: ~25 min before your order starts.|
+------------------------------------------------+
```

---

### 4) Create ETA Breakdown Component

**File to Create:** `src/components/eats/EtaBreakdownCard.tsx`

**Purpose:** Visual breakdown of ETA components at checkout.

**Design:**
```text
┌──────────────────────────────────────────────┐
│ 📦 Estimated Delivery                        │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │  Queue Wait         ~15 min   ▓▓▓░░░   │   │
│ │  Cooking Time       ~20 min   ▓▓▓▓░░   │   │
│ │  Driver Delivery    ~12 min   ▓▓░░░░   │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ Total: 42–52 min                             │
│                                              │
│ ℹ️ ETA includes orders ahead of yours.       │
└──────────────────────────────────────────────┘
```

**Features:**
- Progress bar segments for each phase
- Tooltip explaining each component
- Updates when queue changes

---

### 5) Update Restaurant Menu Page

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

**Changes:**
- Import and use `useRestaurantQueueLength` hook
- Show `HighVolumeBanner` when queue is high (in addition to existing BusyRestaurantBanner)
- Display current queue wait time in prep time indicator

**Integration Point (after availability banners, ~line 348):**
```text
{/* High Volume Banner */}
{queueLength.isHighVolume && (
  <HighVolumeBanner
    queueLength={queueLength.queueLength}
    estimatedWait={queueLength.queueWaitMinutes}
    className="mt-4"
  />
)}
```

---

### 6) Update Checkout Page with ETA Breakdown

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Import `useQueueAwareEta` hook
- Add `EtaBreakdownCard` component to order summary
- Show breakdown of: queue time + cooking time + driver time
- Update estimated delivery text with queue-aware timing

**Integration Point (in Order Summary card, after items list):**
```text
{/* ETA Breakdown */}
<EtaBreakdownCard
  queueMinutes={eta.breakdown.queueMinutes}
  prepMinutes={eta.breakdown.prepMinutes}
  driverMinutes={eta.breakdown.driverMinutes}
  totalMinRange={eta.etaMinRange}
  totalMaxRange={eta.etaMaxRange}
  isHighVolume={eta.isHighVolume}
/>
```

---

### 7) Update Restaurant Availability Hook

**File to Modify:** `src/hooks/useRestaurantAvailability.ts`

**Changes:**
- Add optional `queueLength` parameter
- Include queue info in availability response
- Add `queueWaitMinutes` to return type

---

## File Summary

### New Files (4)
| File | Purpose |
|------|---------|
| `src/hooks/useRestaurantQueueLength.ts` | Fetch active order count for restaurant |
| `src/hooks/useQueueAwareEta.ts` | Calculate comprehensive ETA with queue |
| `src/components/eats/HighVolumeBanner.tsx` | "High order volume" warning banner |
| `src/components/eats/EtaBreakdownCard.tsx` | Visual ETA breakdown for checkout |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/pages/EatsRestaurantMenu.tsx` | Add queue length hook and high volume banner |
| `src/pages/EatsCheckout.tsx` | Add ETA breakdown display |
| `src/hooks/useRestaurantAvailability.ts` | Add queue awareness to availability |

---

## Queue Length Thresholds

| Queue Length | Status | Message |
|--------------|--------|---------|
| 0-2 orders | Normal | No banner shown |
| 3-5 orders | High Volume | "High order volume — preparation may take longer." |
| 6+ orders | Very High | "Very high demand — expect extended wait times." |

---

## ETA Calculation Formula

### Queue Wait Time
```text
queue_wait = 0

For each active_order in restaurant queue:
  base_prep = learned_avg_prep_time OR 20 (default)
  
  If order.status = "placed":
    queue_wait += base_prep × 1.0  (full prep)
  If order.status = "confirmed":
    queue_wait += base_prep × 0.8  (80% remaining)
  If order.status = "preparing":
    queue_wait += base_prep × 0.5  (50% remaining)
  If order.status = "ready":
    queue_wait += 0  (no cooking wait)
```

### Total ETA Range
```text
base_eta = queue_wait + prep_time + driver_travel

eta_min = base_eta × 0.85  (optimistic)
eta_max = base_eta × 1.20  (pessimistic)

// Cap range spread
If (eta_max - eta_min) > 25:
  eta_max = eta_min + 25
```

---

## UI Components

### High Volume Banner
```text
┌─────────────────────────────────────────────────┐
│ 📋                                          [×] │
│ High order volume — preparation may take longer.│
│                                                 │
│ Estimated wait: ~25 min before your order       │
│ starts cooking.                                 │
└─────────────────────────────────────────────────┘
```

### Checkout ETA Breakdown
```text
┌─────────────────────────────────────────────────┐
│ 📦 Estimated Delivery: 42–52 min               │
│                                                 │
│   📋 Queue Wait      15 min   ████░░░░░░       │
│   🍳 Cooking Time    20 min   ██████░░░░       │
│   🚗 Driver Time     12 min   ████░░░░░░       │
│                                                 │
│ ℹ️ Includes 3 orders ahead of yours.           │
└─────────────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No active orders | Show prep + driver only (no queue) |
| Restaurant just opened | Use default prep time (20 min) |
| All orders are "ready" | Queue wait = 0 |
| Very high queue (10+) | Cap queue message at reasonable time |
| Queue changes during checkout | Refresh on page focus |

---

## Real-Time Updates

The queue hook will:
- Refresh every 30 seconds
- Subscribe to `food_orders` table changes for the restaurant
- Update ETA breakdown when queue changes
- Show loading state during initial fetch

---

## Summary

This implementation provides:

1. **Restaurant queue length tracking** — Count active orders per restaurant
2. **Queue-aware ETA calculation** — Factor queue wait into total ETA
3. **High volume banner** — Clear warning on restaurant pages
4. **ETA breakdown at checkout** — Show prep queue + cooking + driver time
5. **Transparent timing** — Customers understand why ETA is longer
6. **Real-time updates** — Queue changes reflected immediately

The feature improves customer expectations by clearly showing that their order enters a queue, with transparent timing for each phase of the delivery process.
