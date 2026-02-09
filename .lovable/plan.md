
# Bundled Orders Visibility — Implementation Plan

## Overview
Enable customers to understand when their order is part of a grouped (batched) delivery route, with transparent messaging about why the driver may be making another stop first and dynamic ETA updates based on their position in the route.

---

## Current State Analysis

### Already Complete
| Feature | Status | Location |
|---------|--------|----------|
| `delivery_batches` table | Complete | Stores batch metadata with driver, route optimization |
| `batch_stops` table | Complete | Stop-by-stop sequence with ETAs per stop |
| `food_orders.batch_id` | Complete | Links order to its batch |
| `useBatches` / `useBatchDetails` | Complete | Admin/dispatch batch management |
| `useDriverBatch` | Complete | Driver-side batch execution with stop status updates |
| Driver batch view | Complete | `/driver/batch` for multi-stop navigation |
| Dispatch batch management | Complete | `/dispatch/batches` for route optimization |
| EtaCountdown component | Complete | Dynamic ETA with demand awareness |
| HighDemandBanner component | Complete | Contextual messaging pattern to follow |
| Order tracking page | Complete | `EatsOrderDetail.tsx` with live map and status |

### Missing
| Feature | What's Needed |
|---------|---------------|
| Customer batch awareness hook | Fetch batch info + position in route for customer's order |
| Grouped delivery banner | Show message: "Driver is completing another nearby delivery first" |
| Grouped delivery badge | Show "Grouped delivery" badge on order detail |
| Dynamic ETA from batch | Use stop-level ETA instead of order-level when batched |
| Route position indicator | Show "Your order is stop X of Y" |

---

## Implementation Plan

### 1) Create Customer Batch Info Hook

**File to Create:** `src/hooks/useOrderBatchInfo.ts`

**Purpose:** Fetch batch details for a customer order, including position in route and stops before their delivery.

```typescript
interface OrderBatchInfo {
  isBatched: boolean;
  batchId: string | null;
  totalStops: number;
  customerStopOrder: number;  // Their dropoff position in sequence
  stopsBeforeCustomer: number;  // How many stops before theirs
  isDriverOnEarlierStop: boolean;  // Driver completing another stop first
  customerStopEta: string | null;  // Their specific stop ETA
  currentStopOrder: number | null;  // Driver's current stop
}
```

**Logic:**
1. Check if order has `batch_id`
2. If batched, query `batch_stops` for the batch
3. Find customer's dropoff stop by `food_order_id`
4. Count stops before customer's dropoff
5. Determine if driver is still on an earlier stop

### 2) Create Grouped Delivery Banner Component

**File to Create:** `src/components/eats/GroupedDeliveryBanner.tsx`

**Purpose:** Contextual message when driver is completing other deliveries first.

**UI Design (matches HighDemandBanner style):**
```text
+----------------------------------------------------------+
| [📦]  Grouped delivery                                   |
|       Your driver has 1 other stop before yours.         |
|       ETA updates as they complete each delivery.        |
|                                                      [X] |
+----------------------------------------------------------+
```

**Variants:**
| Scenario | Icon | Message |
|----------|------|---------|
| Driver on earlier stop | Package | "Your driver is completing another nearby delivery first." |
| Multiple stops before | Package | "Your driver has X stops before yours." |
| Driver on their stop | Truck | "Driver is heading to you next!" |

**Features:**
- Animated entry with Framer Motion
- Dismissible (stores in sessionStorage)
- Show only when `stopsBeforeCustomer > 0` and driver is active
- Color: Blue-500/10 with blue border (neutral/info tone)

### 3) Create Grouped Delivery Badge Component

**File to Create:** `src/components/eats/GroupedDeliveryBadge.tsx`

**Purpose:** Small badge indicator for order header/status area.

**UI:**
```text
┌──────────────────┐
│ 📦 Grouped route │
└──────────────────┘
```

**Styling:**
- `bg-blue-500/10 border-blue-500/30 text-blue-400`
- Icon: `Layers` or `Package`
- Compact badge format

### 4) Integrate Batch Info in Order Detail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Import and use `useOrderBatchInfo` hook
2. Add `GroupedDeliveryBadge` in order header (near order ID)
3. Add `GroupedDeliveryBanner` after demand banner (before ETA)
4. Pass batch ETA to `EtaCountdown` when available

**New imports:**
```typescript
import { useOrderBatchInfo } from "@/hooks/useOrderBatchInfo";
import { GroupedDeliveryBanner } from "@/components/eats/GroupedDeliveryBanner";
import { GroupedDeliveryBadge } from "@/components/eats/GroupedDeliveryBadge";
```

**Hook usage:**
```typescript
const batchInfo = useOrderBatchInfo(order?.id, order?.batch_id);
```

**Badge placement (in header):**
```typescript
<div className="text-center">
  <h1 className="font-bold text-lg">Order Details</h1>
  <div className="flex items-center justify-center gap-2">
    <p className="text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</p>
    {batchInfo?.isBatched && <GroupedDeliveryBadge />}
  </div>
</div>
```

**Banner placement (after demand banner):**
```typescript
{batchInfo?.isBatched && batchInfo?.stopsBeforeCustomer > 0 && isActiveOrder && (
  <GroupedDeliveryBanner
    stopsBeforeCustomer={batchInfo.stopsBeforeCustomer}
    isDriverOnEarlierStop={batchInfo.isDriverOnEarlierStop}
    orderId={order.id}
  />
)}
```

### 5) Enhance EtaCountdown with Batch Stop ETA

**File to Modify:** `src/components/eats/EtaCountdown.tsx`

**Changes:**
- Add optional `batchStopEta` prop
- Prefer batch stop ETA when available (more accurate for position in route)
- Show "Stop X of Y" indicator when batched

**New Props:**
```typescript
interface EtaCountdownProps {
  // ... existing props
  batchStopEta?: string | null;  // ETA for this specific stop in batch
  batchPosition?: { current: number; total: number } | null;  // Stop X of Y
}
```

**UI Enhancement:**
```text
+------------------------------------------+
| [🕐]  Arriving in                        |
|       12 min                             |
|                                          |
| [📦 Stop 2 of 3]                   Live  |
+------------------------------------------+
```

### 6) Create Database RPC for Customer Batch Info (Optional but Recommended)

**File to Create:** `supabase/migrations/xxx_add_get_order_batch_info_rpc.sql`

**Purpose:** Secure RPC to fetch batch info without exposing full batch_stops table to customers.

```sql
CREATE OR REPLACE FUNCTION get_order_batch_info(p_order_id UUID)
RETURNS JSON AS $$
DECLARE
  v_batch_id UUID;
  v_customer_stop_order INT;
  v_total_stops INT;
  v_current_stop INT;
  v_customer_stop_eta TIMESTAMPTZ;
BEGIN
  -- Get batch_id from order
  SELECT batch_id INTO v_batch_id
  FROM food_orders
  WHERE id = p_order_id;
  
  IF v_batch_id IS NULL THEN
    RETURN json_build_object('is_batched', false);
  END IF;
  
  -- Get customer's dropoff stop order
  SELECT stop_order, eta INTO v_customer_stop_order, v_customer_stop_eta
  FROM batch_stops
  WHERE batch_id = v_batch_id
    AND food_order_id = p_order_id
    AND stop_type = 'dropoff';
  
  -- Get total stops
  SELECT COUNT(*) INTO v_total_stops
  FROM batch_stops
  WHERE batch_id = v_batch_id;
  
  -- Get current stop (first non-completed stop)
  SELECT MIN(stop_order) INTO v_current_stop
  FROM batch_stops
  WHERE batch_id = v_batch_id
    AND status != 'completed';
  
  RETURN json_build_object(
    'is_batched', true,
    'batch_id', v_batch_id,
    'total_stops', v_total_stops,
    'customer_stop_order', v_customer_stop_order,
    'stops_before_customer', v_customer_stop_order - 1,
    'current_stop_order', COALESCE(v_current_stop, v_customer_stop_order),
    'is_driver_on_earlier_stop', COALESCE(v_current_stop, v_customer_stop_order) < v_customer_stop_order,
    'customer_stop_eta', v_customer_stop_eta
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## File Summary

### New Files (4)
| File | Purpose |
|------|---------|
| `src/hooks/useOrderBatchInfo.ts` | Fetch batch position and ETA for customer order |
| `src/components/eats/GroupedDeliveryBanner.tsx` | Contextual message about other stops |
| `src/components/eats/GroupedDeliveryBadge.tsx` | Small badge for order header |
| `supabase/migrations/xxx_get_order_batch_info.sql` | Secure RPC for batch info |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Add batch info hook, banner, and badge |
| `src/components/eats/EtaCountdown.tsx` | Add batch stop ETA and position indicator |

---

## UI Components

### GroupedDeliveryBadge
```text
┌────────────────────┐
│ 📦 Grouped route   │
└────────────────────┘
```
- Small inline badge
- Blue theme (informational)
- Shows in order header

### GroupedDeliveryBanner (Driver on earlier stop)
```text
+----------------------------------------------------------+
| [📦]  Grouped delivery                               [X] |
|       Your driver is completing another nearby           |
|       delivery first. Your order is next!                |
+----------------------------------------------------------+
```
- Background: `bg-blue-500/10`
- Border: `border-blue-500/30`
- Dismissible

### GroupedDeliveryBanner (Multiple stops before)
```text
+----------------------------------------------------------+
| [📦]  Grouped delivery                               [X] |
|       Your driver has 2 stops before yours.              |
|       ETA updates as each delivery completes.            |
+----------------------------------------------------------+
```

### EtaCountdown with batch position
```text
+------------------------------------------+
| [🕐]  Arriving in                        |
|       15 min                             |
|                                          |
| ─────────────────────────────────────────|
| 📦 Stop 3 of 4                     Live  |
+------------------------------------------+
```

---

## Data Flow

```text
Order with batch_id
       ↓
useOrderBatchInfo(orderId, batchId)
       ↓
RPC: get_order_batch_info(orderId)
       ↓
Returns:
├── is_batched: true
├── total_stops: 4
├── customer_stop_order: 3
├── stops_before_customer: 2
├── current_stop_order: 1
├── is_driver_on_earlier_stop: true
└── customer_stop_eta: "2026-02-09T15:30:00Z"
       ↓
UI Rendering:
├── Header badge: "Grouped route"
├── Banner: "Driver has 2 stops before yours"
├── EtaCountdown: Uses customer_stop_eta
└── Position: "Stop 3 of 4"
```

---

## Real-Time Updates

The `useOrderBatchInfo` hook will:
1. Subscribe to `batch_stops` changes for the batch
2. Recalculate position when stops are completed
3. Update ETA as driver progresses through route

**Realtime subscription:**
```typescript
supabase.channel(`batch-customer-${batchId}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "batch_stops",
    filter: `batch_id=eq.${batchId}`,
  }, refetch)
  .subscribe();
```

---

## User Experience Flow

```text
Customer places order
       ↓
Order gets batched with nearby orders
(batch_id set on food_orders)
       ↓
Customer opens order tracking
       ↓
Sees: "Grouped route" badge in header
       ↓
Sees banner: "Driver is completing another nearby delivery first"
       ↓
ETA shows: 15 min (based on their stop position)
Position shows: "Stop 3 of 4"
       ↓
Driver completes stop 1
       ↓
Banner updates: "Driver has 1 stop before yours"
       ↓
Driver completes stop 2
       ↓
Banner changes: "Driver is heading to you next!"
(or banner dismissed, ETA prominent)
       ↓
Driver arrives at customer's stop
       ↓
Normal delivery flow continues
```

---

## Technical Notes

### Why an RPC?
Using an RPC instead of direct table access:
1. Security: Customers shouldn't see other customers' stops/addresses
2. Efficiency: Single query instead of multiple client-side joins
3. Logic encapsulation: Stop counting and position calculation in one place

### ETA Accuracy
When batched:
- Use stop-level `eta` from `batch_stops` table (calculated during route optimization)
- This is more accurate than order-level `eta_dropoff` as it accounts for preceding stops

### Banner Dismissal
- Stores in `sessionStorage` per order
- Reappears if stop count changes (new batch member)
- Auto-hides when customer is next in line

---

## Summary

This implementation provides customers with full transparency about grouped deliveries:

1. **GroupedDeliveryBadge** — Small "Grouped route" badge in order header
2. **GroupedDeliveryBanner** — Contextual message explaining multi-stop route
3. **useOrderBatchInfo hook** — Fetches batch position and ETA from secure RPC
4. **Enhanced EtaCountdown** — Shows stop position "Stop X of Y" with accurate ETA
5. **Real-time updates** — Banner and ETA update as driver completes stops

The messaging is friendly and transparent: "Your driver is completing another nearby delivery first" rather than making customers wonder why the driver isn't coming directly to them.
