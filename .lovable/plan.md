
# Delay Detection — Implementation Plan

## Overview
Implement automatic delay detection that identifies when orders are running late compared to their estimated delivery time, displays clear messaging to customers, recalculates ETAs dynamically, and sends push notifications when delays occur.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| ETA Countdown component | Complete | `src/components/eats/EtaCountdown.tsx` |
| Smart ETA calculation | Complete | `src/hooks/useSmartEta.ts` |
| Live order tracking hook | Complete | `src/hooks/useLiveEatsOrder.ts` |
| Order detail page | Complete | `src/pages/EatsOrderDetail.tsx` |
| Order tracking page | Complete | `src/pages/track/OrderTrackingPage.tsx` |
| Push notification system | Complete | `supabase/functions/send-notification/index.ts` |
| Order events table | Complete | `order_events` table |
| `eta_dropoff` field on orders | Complete | `food_orders.eta_dropoff` |
| Traffic-aware ETA adjustments | Complete | In `EtaCountdown` component |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Delay detection hook | Missing | Compare current time to ETA, detect if late |
| Delay detection banner | Missing | "Your order is taking longer than expected" |
| Automatic ETA recalculation on delay | Missing | Adjust ETA when delay detected |
| Delay push notification | Missing | "Your delivery is delayed" notification |
| Order delay event logging | Missing | Log delay events for analytics |

---

## Implementation Plan

### 1) Create Order Delay Detection Hook

**File to Create:** `src/hooks/useOrderDelayDetection.ts`

**Purpose:** Monitor order timing and detect when delivery is running late.

**Detection Logic:**
```text
Current Time > ETA Dropoff + Buffer → Order is delayed

Buffer thresholds:
- Warning: 5 minutes past ETA (soft delay)
- Delayed: 10 minutes past ETA (confirmed delay)
- Significantly Delayed: 20+ minutes past ETA (critical)
```

**Returned Data:**
```text
interface OrderDelayResult {
  isDelayed: boolean;
  delayLevel: "none" | "warning" | "delayed" | "critical";
  delayMinutes: number;
  originalEtaTime: Date | null;
  newEstimatedEta: number | null;
  delayMessage: string | null;
  shouldNotify: boolean; // true if notification needed
}
```

**ETA Recalculation:**
- When delay detected, recalculate from current driver position
- Add buffer based on delay severity (10-20% extra)
- Update display with new range

---

### 2) Create Delay Detection Banner Component

**File to Create:** `src/components/eats/OrderDelayBanner.tsx`

**Purpose:** Display customer-facing delay message on order tracking.

**Message Variants:**
| Delay Level | Message |
|-------------|---------|
| warning | "Your order is running slightly behind schedule." |
| delayed | "Your order is taking longer than expected." |
| critical | "We apologize — your order is significantly delayed." |

**UI Design:**
```text
+--------------------------------------------------+
| ⏰ ORDER DELAYED                                  |
|                                                  |
| Your order is taking longer than expected.       |
| Updated ETA: 25–30 min                           |
|                                                  |
| We're working to get your order to you ASAP.    |
+--------------------------------------------------+
```

**Features:**
- Dismissible (but reappears if delay worsens)
- Shows updated ETA range
- Amber background for warning, red for delayed/critical
- Links to support if critical

---

### 3) Create Delay Notification Trigger Hook

**File to Create:** `src/hooks/useDelayNotification.ts`

**Purpose:** Trigger push notification when delay is first detected.

**Logic:**
- Call notification API when `isDelayed` transitions to `true`
- Use `order_delayed` event type
- Only notify once per delay level (prevent spam)
- Store notification state in localStorage to prevent duplicates

**Notification Template:**
```text
Title: "Delivery Delayed ⏰"
Body: "Your order from {restaurant} is delayed. Updated ETA: {eta_min}–{eta_max} min."
Action URL: "/eats/orders/{order_id}"
```

---

### 4) Update Order Detail Page with Delay Detection

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
- Import and use `useOrderDelayDetection` hook
- Show `OrderDelayBanner` when delay detected
- Pass updated ETA to existing ETA components
- Log delay event to `order_events` table

**Integration Point (after stale location warning, ~line 480):**
```tsx
{/* Order Delay Banner */}
{delay.isDelayed && isActiveOrder && (
  <OrderDelayBanner
    delayLevel={delay.delayLevel}
    delayMinutes={delay.delayMinutes}
    newEtaMin={delay.newEstimatedEtaMin}
    newEtaMax={delay.newEstimatedEtaMax}
    onContactSupport={() => setHelpModalOpen(true)}
  />
)}
```

---

### 5) Update EtaCountdown Component for Delay Awareness

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
- Add `isDelayed` and `delayMinutes` props
- Show delay indicator badge when late
- Change color scheme to amber/red when delayed
- Display "Delayed" label instead of "Arriving in"

---

### 6) Create Delay Event Logging

**Integration in hook:** `useOrderDelayDetection.ts`

**Purpose:** Log delay events for analytics and support visibility.

**Event Types:**
- `order_delayed_warning` — 5+ min late
- `order_delayed` — 10+ min late
- `order_delayed_critical` — 20+ min late

**Logged to:** `order_events` table with metadata:
```json
{
  "delay_minutes": 15,
  "original_eta": "2026-02-09T14:30:00Z",
  "detected_at": "2026-02-09T14:40:00Z"
}
```

---

### 7) Update Order Tracking Page (Public)

**File to Modify:** `src/pages/track/OrderTrackingPage.tsx`

**Changes:**
- Add delay detection for public tracking
- Show delay banner when applicable
- Update ETA display with recalculated time

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/hooks/useOrderDelayDetection.ts` | Detect order delays and recalculate ETA |
| `src/components/eats/OrderDelayBanner.tsx` | Customer-facing delay notification banner |
| `src/hooks/useDelayNotification.ts` | Trigger push notification on delay |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Add delay detection and banner |
| `src/components/eats/EtaCountdown.tsx` | Add delay-aware styling |
| `src/pages/track/OrderTrackingPage.tsx` | Add delay detection for public tracking |

---

## Delay Detection Algorithm

### Phase 1: Compare Current Time to ETA
```text
current_time = now()
original_eta = order.eta_dropoff

If original_eta is null:
  Use calculated ETA from created_at + duration_minutes

time_past_eta = current_time - original_eta
```

### Phase 2: Determine Delay Level
```text
If time_past_eta < 5 min:
  delay_level = "none"
  
If 5 min <= time_past_eta < 10 min:
  delay_level = "warning"
  
If 10 min <= time_past_eta < 20 min:
  delay_level = "delayed"
  
If time_past_eta >= 20 min:
  delay_level = "critical"
```

### Phase 3: Recalculate ETA
```text
If driver location available:
  distance = haversine(driver_lat, driver_lng, delivery_lat, delivery_lng)
  travel_time = distance / 0.5 mph
  
  // Add delay buffer based on severity
  If delay_level = "warning":
    buffer = 1.1 (10% extra)
  If delay_level = "delayed":
    buffer = 1.15 (15% extra)
  If delay_level = "critical":
    buffer = 1.2 (20% extra)
  
  new_eta = travel_time × traffic_factor × buffer
  
Else:
  // Estimate based on average progression
  new_eta = delay_minutes + original_remaining_estimate
```

---

## Notification Flow

```text
1. Order placed with eta_dropoff
   └─> Hook monitors time vs ETA

2. Current time passes eta_dropoff + 10 min
   └─> delay.isDelayed = true
   └─> delay.shouldNotify = true

3. Check localStorage for notification flag
   └─> If not notified for this delay level:
       └─> Call send-notification edge function
       └─> Set localStorage flag
       └─> Log order_delayed event

4. User receives push notification
   └─> "Your delivery is delayed. Updated ETA: 25–30 min."
   └─> Tap opens order detail page
```

---

## UI Components

### Delay Banner (Warning Level)
```text
┌─────────────────────────────────────────────────┐
│ ⏰                                              │
│ Your order is running slightly behind schedule. │
│                                                 │
│ Updated ETA: 22–28 min                         │
└─────────────────────────────────────────────────┘
```

### Delay Banner (Delayed Level)
```text
┌─────────────────────────────────────────────────┐
│ ⏰ ORDER DELAYED                               │
│                                                 │
│ Your order is taking longer than expected.     │
│                                                 │
│ Updated ETA: 25–32 min                         │
│                                                 │
│ ℹ️ We're working to get your order to you ASAP │
└─────────────────────────────────────────────────┘
```

### Delay Banner (Critical Level)
```text
┌─────────────────────────────────────────────────┐
│ ⚠️ SIGNIFICANT DELAY                           │
│                                                 │
│ We apologize — your order is significantly     │
│ delayed.                                        │
│                                                 │
│ Updated ETA: 35–45 min                         │
│                                                 │
│ [Contact Support]                              │
└─────────────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No eta_dropoff set | Calculate from created_at + duration_minutes |
| Order already delivered | No delay detection (skip) |
| Order cancelled | No delay detection (skip) |
| Driver not assigned yet | Use prep time + estimated pickup time |
| Network offline | Continue showing last known delay state |
| Delay resolves (driver speeds up) | Clear delay banner if new ETA is met |

---

## Push Notification Templates

### Delay Notification
```text
Title: "Delivery Delayed ⏰"
Body: "Your order from {restaurant_name} is delayed. Updated ETA: {eta_min}–{eta_max} min."
Action: Opens /eats/orders/{order_id}
Priority: normal
Event Type: order_delayed
```

### Critical Delay Notification
```text
Title: "Order Significantly Delayed"
Body: "We're sorry — your {restaurant_name} order is taking longer than expected. Tap for details."
Action: Opens /eats/orders/{order_id}
Priority: critical
Event Type: order_delayed_critical
```

---

## Summary

This implementation provides:

1. **Automatic delay detection** — Compare current time to original ETA
2. **Multi-level delay classification** — warning/delayed/critical thresholds
3. **Clear customer messaging** — "Your order is taking longer than expected"
4. **Dynamic ETA recalculation** — Adjust based on current driver location
5. **Push notifications** — Alert customers when delays occur
6. **Event logging** — Track delays for analytics and support
7. **Public tracking support** — Delay detection on guest tracking page

The feature keeps customers informed proactively, reducing support inquiries and improving trust by providing transparent, updated timing information.
