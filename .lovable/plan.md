
# Scheduled Orders + Batching + Route Optimization Implementation Plan

## Overview

Upgrade ZIVO to support logistics mode with scheduled orders, multi-stop batch deliveries, route optimization, and enhanced driver/customer experiences. This builds on existing `delivery_batches`, `batch_stops`, and `order_events` infrastructure.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `delivery_batches` table | Exists | Has id, driver_id, status, total_distance_km, total_earnings, region_id |
| `batch_stops` table | Exists | Has id, batch_id, food_order_id, trip_id, stop_order, stop_type, address, lat, lng, status, arrived_at, completed_at |
| `order_events` table | Exists | Has id, order_id, trip_id, actor_id, type, data, created_at |
| `food_orders` table | Exists | Comprehensive columns but missing scheduling fields |
| `AdminDeliveryManagement.tsx` | Exists | Basic batch listing but no batch builder UI |
| Driver batch workflow | Missing | No driver batch page |
| Route optimization | Missing | No optimization logic |
| Customer batch tracking | Missing | No multi-stop awareness |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    Customer Places Scheduled Order                       │
│            (pickup window / deliver-by time specified)                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      food_orders (enhanced)                              │
│                                                                          │
│  New fields: is_scheduled, pickup_window_start/end, deliver_by,         │
│  batch_id, stop_sequence, eta_pickup, eta_dropoff                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
┌──────────────────────────────┐      ┌───────────────────────────────────┐
│   Manual Batch Creation      │      │   Auto-Batch Builder              │
│   Dispatch selects orders    │      │   Groups by zone, time, merchant  │
│   /dispatch/batches/new      │      │   auto_build_batches RPC          │
└───────────────┬──────────────┘      └──────────────┬────────────────────┘
                │                                     │
                └──────────────────┬──────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     delivery_batches (enhanced)                          │
│                                                                          │
│  New fields: planned_start, planned_end, total_duration_minutes, notes  │
│  Status: draft → assigned → in_progress → completed                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         batch_stops (enhanced)                           │
│                                                                          │
│  New fields: kind (pickup/dropoff), eta, actual_time                     │
│  Each order creates 2 stops: pickup from restaurant + dropoff to customer│
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Route Optimization                                  │
│                                                                          │
│  v1: Nearest-neighbor heuristic (Haversine distance)                    │
│  v2: Mapbox Optimization API / Google Directions (if configured)        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Driver Batch View                                 │
│                      /driver/batch                                       │
│                                                                          │
│  Shows ordered stops, navigation, status updates                        │
│  Actions: Arrived, Picked Up, Delivered                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Add Scheduling Fields to `food_orders`

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pickup_window_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pickup_window_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deliver_by TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES delivery_batches(id),
  ADD COLUMN IF NOT EXISTS stop_sequence INT,
  ADD COLUMN IF NOT EXISTS eta_pickup TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eta_dropoff TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_food_orders_batch ON food_orders(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_orders_scheduled ON food_orders(is_scheduled, deliver_by) WHERE is_scheduled = true;
```

### 2. Enhance `delivery_batches` Table

```sql
ALTER TABLE delivery_batches
  ADD COLUMN IF NOT EXISTS planned_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS planned_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_duration_minutes NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS total_stops INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS optimization_source TEXT DEFAULT 'manual';
```

### 3. Enhance `batch_stops` Table

```sql
ALTER TABLE batch_stops
  ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'dropoff',
  ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add constraint for kind
ALTER TABLE batch_stops ADD CONSTRAINT valid_stop_kind 
  CHECK (kind IN ('pickup', 'dropoff'));

-- Unique constraint per order and kind in a batch
CREATE UNIQUE INDEX IF NOT EXISTS idx_batch_stops_unique 
  ON batch_stops(batch_id, food_order_id, kind) 
  WHERE food_order_id IS NOT NULL;
```

### 4. RLS Policies for Batch Tables

```sql
-- delivery_batches
ALTER TABLE delivery_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage batches" ON delivery_batches;
CREATE POLICY "Admin can manage batches" ON delivery_batches
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Drivers can read assigned batches" ON delivery_batches;
CREATE POLICY "Drivers can read assigned batches" ON delivery_batches
  FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can update assigned batches" ON delivery_batches;
CREATE POLICY "Drivers can update assigned batches" ON delivery_batches
  FOR UPDATE TO authenticated
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- batch_stops
ALTER TABLE batch_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage batch stops" ON batch_stops;
CREATE POLICY "Admin can manage batch stops" ON batch_stops
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Drivers can read assigned batch stops" ON batch_stops;
CREATE POLICY "Drivers can read assigned batch stops" ON batch_stops
  FOR SELECT TO authenticated
  USING (batch_id IN (
    SELECT id FROM delivery_batches 
    WHERE driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Drivers can update assigned batch stops" ON batch_stops;
CREATE POLICY "Drivers can update assigned batch stops" ON batch_stops
  FOR UPDATE TO authenticated
  USING (batch_id IN (
    SELECT id FROM delivery_batches 
    WHERE driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  ));
```

---

## Database Functions (RPCs)

### 1. `create_batch_from_orders`

Creates a batch and generates pickup + dropoff stops for each order.

```sql
CREATE OR REPLACE FUNCTION create_batch_from_orders(
  p_order_ids UUID[],
  p_region_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_batch_id UUID;
  v_order RECORD;
  v_sequence INT := 1;
BEGIN
  -- Create the batch
  INSERT INTO delivery_batches (region_id, status, notes)
  VALUES (p_region_id, 'draft', p_notes)
  RETURNING id INTO v_batch_id;

  -- Add stops for each order
  FOR v_order IN
    SELECT fo.*, r.name as restaurant_name, r.address as restaurant_address, 
           r.lat as restaurant_lat, r.lng as restaurant_lng
    FROM food_orders fo
    LEFT JOIN restaurants r ON r.id = fo.restaurant_id
    WHERE fo.id = ANY(p_order_ids)
    ORDER BY fo.deliver_by NULLS LAST, fo.created_at
  LOOP
    -- Pickup stop
    INSERT INTO batch_stops (batch_id, food_order_id, stop_order, stop_type, kind, 
                             address, lat, lng, status)
    VALUES (v_batch_id, v_order.id, v_sequence, 'pickup', 'pickup',
            v_order.restaurant_address, v_order.restaurant_lat, v_order.restaurant_lng, 'pending');
    v_sequence := v_sequence + 1;

    -- Dropoff stop
    INSERT INTO batch_stops (batch_id, food_order_id, stop_order, stop_type, kind,
                             address, lat, lng, status, customer_name, customer_phone)
    VALUES (v_batch_id, v_order.id, v_sequence, 'dropoff', 'dropoff',
            v_order.delivery_address, v_order.delivery_lat, v_order.delivery_lng, 'pending',
            v_order.customer_name, v_order.customer_phone);
    v_sequence := v_sequence + 1;

    -- Update order with batch reference
    UPDATE food_orders SET batch_id = v_batch_id, updated_at = now() WHERE id = v_order.id;
  END LOOP;

  -- Update batch stop count
  UPDATE delivery_batches SET total_stops = v_sequence - 1 WHERE id = v_batch_id;

  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 2. `optimize_batch_route`

Optimizes stop order using nearest-neighbor heuristic.

```sql
CREATE OR REPLACE FUNCTION optimize_batch_route(
  p_batch_id UUID,
  p_start_lat NUMERIC DEFAULT NULL,
  p_start_lng NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_stops RECORD[];
  v_current_lat NUMERIC;
  v_current_lng NUMERIC;
  v_optimized_sequence INT := 1;
  v_total_distance NUMERIC := 0;
  v_closest_idx INT;
  v_closest_dist NUMERIC;
  v_dist NUMERIC;
  v_stop RECORD;
  v_remaining RECORD[];
BEGIN
  -- Get driver location if not provided
  IF p_start_lat IS NULL THEN
    SELECT d.current_lat, d.current_lng INTO p_start_lat, p_start_lng
    FROM delivery_batches b
    JOIN drivers d ON d.id = b.driver_id
    WHERE b.id = p_batch_id;
  END IF;

  v_current_lat := COALESCE(p_start_lat, 29.7604); -- Default Houston
  v_current_lng := COALESCE(p_start_lng, -95.3698);

  -- Get all stops as array
  SELECT ARRAY_AGG(bs.*) INTO v_remaining
  FROM batch_stops bs
  WHERE bs.batch_id = p_batch_id AND bs.status = 'pending';

  -- Nearest neighbor algorithm
  WHILE array_length(v_remaining, 1) > 0 LOOP
    v_closest_idx := 1;
    v_closest_dist := 99999;

    FOR i IN 1..array_length(v_remaining, 1) LOOP
      v_dist := haversine_miles(v_current_lat, v_current_lng, 
                                v_remaining[i].lat, v_remaining[i].lng);
      IF v_dist < v_closest_dist THEN
        v_closest_dist := v_dist;
        v_closest_idx := i;
      END IF;
    END LOOP;

    v_stop := v_remaining[v_closest_idx];
    v_total_distance := v_total_distance + v_closest_dist;

    -- Update stop sequence
    UPDATE batch_stops SET stop_order = v_optimized_sequence WHERE id = v_stop.id;
    v_optimized_sequence := v_optimized_sequence + 1;

    -- Move to this location
    v_current_lat := v_stop.lat;
    v_current_lng := v_stop.lng;

    -- Remove from remaining
    v_remaining := array_remove(v_remaining, v_stop);
  END LOOP;

  -- Update batch totals (estimate 2 min per mile + 5 min per stop)
  UPDATE delivery_batches SET
    total_distance_km = v_total_distance * 1.60934,
    total_duration_minutes = (v_total_distance * 2) + (v_optimized_sequence * 5),
    optimization_source = 'haversine'
  WHERE id = p_batch_id;

  RETURN jsonb_build_object(
    'success', true,
    'total_distance_miles', v_total_distance,
    'estimated_duration_minutes', (v_total_distance * 2) + (v_optimized_sequence * 5)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 3. `assign_batch_to_driver`

Assigns a batch to a driver and notifies them.

```sql
CREATE OR REPLACE FUNCTION assign_batch_to_driver(
  p_batch_id UUID,
  p_driver_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_batch RECORD;
  v_order_ids UUID[];
BEGIN
  -- Validate batch is in draft status
  SELECT * INTO v_batch FROM delivery_batches WHERE id = p_batch_id;
  IF v_batch IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Batch not found');
  END IF;
  IF v_batch.status != 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Batch already assigned');
  END IF;

  -- Assign driver to batch
  UPDATE delivery_batches SET
    driver_id = p_driver_id,
    status = 'assigned',
    started_at = now()
  WHERE id = p_batch_id;

  -- Update all orders in batch
  UPDATE food_orders SET
    driver_id = p_driver_id,
    status = 'confirmed',
    assigned_at = now(),
    updated_at = now()
  WHERE batch_id = p_batch_id;

  -- Get order IDs for event logging
  SELECT ARRAY_AGG(food_order_id) INTO v_order_ids
  FROM batch_stops WHERE batch_id = p_batch_id AND food_order_id IS NOT NULL;

  -- Log events
  INSERT INTO order_events (order_id, type, data)
  SELECT id, 'status_change', jsonb_build_object('status', 'confirmed', 'reason', 'batch_assigned', 'batch_id', p_batch_id)
  FROM food_orders WHERE batch_id = p_batch_id;

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', p_batch_id,
    'driver_id', p_driver_id,
    'order_count', array_length(v_order_ids, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 4. `update_batch_stop_status`

Driver updates individual stop status.

```sql
CREATE OR REPLACE FUNCTION update_batch_stop_status(
  p_stop_id UUID,
  p_status TEXT,
  p_driver_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_stop RECORD;
  v_batch RECORD;
  v_order_status TEXT;
  v_all_complete BOOLEAN;
BEGIN
  -- Validate stop and driver assignment
  SELECT bs.*, db.driver_id as batch_driver_id, bs.food_order_id
  INTO v_stop
  FROM batch_stops bs
  JOIN delivery_batches db ON db.id = bs.batch_id
  WHERE bs.id = p_stop_id;

  IF v_stop IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stop not found');
  END IF;
  IF v_stop.batch_driver_id != p_driver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Update stop
  UPDATE batch_stops SET
    status = p_status,
    arrived_at = CASE WHEN p_status = 'arrived' THEN now() ELSE arrived_at END,
    completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE completed_at END,
    actual_time = CASE WHEN p_status = 'completed' THEN now() ELSE actual_time END
  WHERE id = p_stop_id;

  -- Update order status based on stop type
  IF v_stop.food_order_id IS NOT NULL THEN
    IF v_stop.kind = 'pickup' AND p_status = 'completed' THEN
      v_order_status := 'in_progress';
    ELSIF v_stop.kind = 'dropoff' AND p_status = 'completed' THEN
      v_order_status := 'completed';
    END IF;

    IF v_order_status IS NOT NULL THEN
      UPDATE food_orders SET
        status = v_order_status,
        picked_up_at = CASE WHEN v_order_status = 'in_progress' THEN now() ELSE picked_up_at END,
        delivered_at = CASE WHEN v_order_status = 'completed' THEN now() ELSE delivered_at END,
        updated_at = now()
      WHERE id = v_stop.food_order_id;

      INSERT INTO order_events (order_id, type, data)
      VALUES (v_stop.food_order_id, 'status_change', 
              jsonb_build_object('status', v_order_status, 'reason', 'batch_stop_' || p_status));
    END IF;
  END IF;

  -- Check if all stops complete -> complete batch
  SELECT NOT EXISTS (
    SELECT 1 FROM batch_stops WHERE batch_id = v_stop.batch_id AND status != 'completed'
  ) INTO v_all_complete;

  IF v_all_complete THEN
    UPDATE delivery_batches SET status = 'completed', completed_at = now()
    WHERE id = v_stop.batch_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'stop_id', p_stop_id,
    'status', p_status,
    'batch_completed', v_all_complete
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 5. `auto_build_batches`

Auto-groups eligible orders into batches.

```sql
CREATE OR REPLACE FUNCTION auto_build_batches(
  p_region_id UUID,
  p_window_minutes INT DEFAULT 60,
  p_max_stops INT DEFAULT 8,
  p_max_distance_miles NUMERIC DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
  v_batches_created INT := 0;
  v_orders_batched INT := 0;
  v_order RECORD;
  v_batch_id UUID;
  v_current_orders UUID[];
  v_current_center_lat NUMERIC;
  v_current_center_lng NUMERIC;
  v_dist NUMERIC;
BEGIN
  -- Find eligible scheduled orders
  FOR v_order IN
    SELECT fo.*, r.lat as restaurant_lat, r.lng as restaurant_lng
    FROM food_orders fo
    LEFT JOIN restaurants r ON r.id = fo.restaurant_id
    WHERE fo.region_id = p_region_id
      AND fo.batch_id IS NULL
      AND fo.driver_id IS NULL
      AND fo.status IN ('pending', 'confirmed')
      AND (fo.deliver_by IS NULL OR fo.deliver_by > now())
      AND (fo.deliver_by IS NULL OR fo.deliver_by < now() + (p_window_minutes || ' minutes')::INTERVAL)
    ORDER BY fo.deliver_by NULLS LAST, fo.created_at
  LOOP
    -- Start new batch if needed
    IF v_batch_id IS NULL OR array_length(v_current_orders, 1) >= p_max_stops / 2 THEN
      -- Finalize previous batch
      IF v_batch_id IS NOT NULL THEN
        PERFORM optimize_batch_route(v_batch_id);
        v_batches_created := v_batches_created + 1;
      END IF;

      -- Create new batch
      v_batch_id := NULL;
      v_current_orders := ARRAY[v_order.id];
      v_current_center_lat := v_order.restaurant_lat;
      v_current_center_lng := v_order.restaurant_lng;

      SELECT create_batch_from_orders(v_current_orders, p_region_id) INTO v_batch_id;
    ELSE
      -- Check distance from current center
      v_dist := haversine_miles(v_current_center_lat, v_current_center_lng,
                                v_order.restaurant_lat, v_order.restaurant_lng);

      IF v_dist <= p_max_distance_miles THEN
        -- Add to current batch
        v_current_orders := array_append(v_current_orders, v_order.id);

        INSERT INTO batch_stops (batch_id, food_order_id, stop_order, stop_type, kind,
                                 address, lat, lng, status)
        VALUES (v_batch_id, v_order.id, (SELECT MAX(stop_order) + 1 FROM batch_stops WHERE batch_id = v_batch_id),
                'pickup', 'pickup', v_order.restaurant_address, v_order.restaurant_lat, v_order.restaurant_lng, 'pending');

        INSERT INTO batch_stops (batch_id, food_order_id, stop_order, stop_type, kind,
                                 address, lat, lng, status, customer_name, customer_phone)
        VALUES (v_batch_id, v_order.id, (SELECT MAX(stop_order) + 1 FROM batch_stops WHERE batch_id = v_batch_id),
                'dropoff', 'dropoff', v_order.delivery_address, v_order.delivery_lat, v_order.delivery_lng, 'pending',
                v_order.customer_name, v_order.customer_phone);

        UPDATE food_orders SET batch_id = v_batch_id WHERE id = v_order.id;
      END IF;
    END IF;

    v_orders_batched := v_orders_batched + 1;
  END LOOP;

  -- Finalize last batch
  IF v_batch_id IS NOT NULL THEN
    PERFORM optimize_batch_route(v_batch_id);
    v_batches_created := v_batches_created + 1;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'batches_created', v_batches_created,
    'orders_batched', v_orders_batched
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useBatches.ts` | Create | Batch CRUD + optimization hooks |
| `src/hooks/useDriverBatch.ts` | Create | Driver batch management hooks |
| `src/pages/dispatch/DispatchBatches.tsx` | Create | Batches list with filters |
| `src/pages/dispatch/DispatchBatchNew.tsx` | Create | Batch builder UI |
| `src/pages/dispatch/DispatchBatchDetail.tsx` | Create | Batch detail + optimize + assign |
| `src/pages/driver/DriverBatchPage.tsx` | Create | Driver batch view with stops |
| `src/components/batch/BatchStopsList.tsx` | Create | Draggable stops list |
| `src/components/batch/BatchRouteMap.tsx` | Create | Map showing route |
| `src/components/batch/BatchOrderSelector.tsx` | Create | Order selection for batch |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Batches nav item |
| `src/hooks/useOrderTracking.ts` | Modify | Handle batched orders |
| `src/App.tsx` | Modify | Add batch routes |
| Database migration | Create | All columns, RPCs, RLS |

---

## Component Specifications

### DispatchBatches Page (List)

**Route:** `/dispatch/batches`

**Features:**
- Filter tabs: All | Draft | Assigned | In Progress | Completed
- Search by batch ID, driver name
- Sort by created_at (newest first)
- Status badges with colors
- Driver assignment indicator
- Stop count, distance, duration display

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│  Batches                               [+ Create Batch]      │
├──────────────────────────────────────────────────────────────┤
│  [All] [Draft 5] [Assigned 3] [In Progress 2] [Completed]   │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Batch #abc123             🟡 Draft                     │  │
│  │ 4 orders • 8 stops • ~12 miles • ~45 min              │  │
│  │ [Optimize] [Assign Driver]                    [→]      │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Batch #def456             🔵 Assigned                  │  │
│  │ 3 orders • 6 stops • ~8 miles • ~30 min               │  │
│  │ Driver: John T.                               [→]      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### DispatchBatchNew Page (Builder)

**Route:** `/dispatch/batches/new`

**Sections:**

1. **Zone Selection** - Choose region to filter orders
2. **Order Selector** - Table of unbatched orders with:
   - Checkbox selection
   - Filters: scheduled only, pickup time range, merchant
   - Sort by deliver_by time
3. **Selected Orders Summary** - Shows selected count, estimated distance
4. **Auto-Group Button** - Suggests groupings by merchant + time window
5. **Create Batch Button** - Creates batch from selection

### DispatchBatchDetail Page

**Route:** `/dispatch/batches/:id`

**Sections:**

1. **Header** - Batch ID, status badge, driver (if assigned)
2. **Stats Cards** - Total stops, distance, estimated duration, orders
3. **Route Map** - Map showing all stops in sequence with route line
4. **Stops List** - Draggable list with:
   - Sequence number
   - Stop type icon (pickup/dropoff)
   - Address
   - Order info
   - ETA
5. **Actions Panel:**
   - Optimize Route button
   - Assign Driver dropdown + button
   - Start Batch button (sets status to in_progress)
   - Cancel Batch button

### DriverBatchPage

**Route:** `/driver/batch`

**Features:**
- Shows current assigned batch
- Ordered stop list with:
  - Sequence number
  - Pickup/Dropoff icon
  - Address with "Open in Maps" link
  - Customer info (for dropoffs)
  - Status badge
- Action buttons per stop:
  - "Arrived" - marks arrived_at
  - "Picked Up" / "Delivered" - completes stop
- Progress bar showing completed stops
- Auto-complete batch when all stops done

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│  Active Batch                    4/8 stops completed         │
│  ████████░░░░░░░░                                            │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 5. 📍 Dropoff                              ● Next      │  │
│  │ 123 Main St, Houston TX                                │  │
│  │ Customer: Sarah J. • 555-1234                          │  │
│  │ [Navigate 🗺️]        [Arrived] [Delivered]             │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 6. 🏪 Pickup                               ○ Upcoming  │  │
│  │ Bella Pizza, 456 Oak Ave                               │  │
│  │ [Navigate 🗺️]                                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Customer Tracking Updates

Modify `useOrderTracking.ts` to handle batched orders:

```typescript
// In OrderDetails interface, add:
batch_id: string | null;
batch_stop_sequence: number | null;
batch_total_stops: number | null;

// In tracking UI:
// If order.batch_id exists, show:
// "Your driver has multiple deliveries. You are stop X of Y."
// Display eta_dropoff as the ETA
```

---

## Sidebar Updates

Add to `DispatchSidebar.tsx`:

```typescript
{
  label: "Batches",
  path: "/dispatch/batches",
  icon: Package,
},
```

Position after "Orders" in the navigation.

---

## Implementation Order

1. **Database migration** - Add columns to food_orders, delivery_batches, batch_stops + RPCs + RLS
2. **useBatches hook** - CRUD operations for batches
3. **BatchStopsList component** - Draggable stop list with reordering
4. **BatchOrderSelector component** - Order selection UI
5. **DispatchBatches page** - Batch list
6. **DispatchBatchNew page** - Batch builder
7. **DispatchBatchDetail page** - Batch management
8. **useDriverBatch hook** - Driver batch operations
9. **DriverBatchPage** - Driver batch view
10. **Update DispatchSidebar** - Add Batches nav
11. **Update App.tsx** - Add routes
12. **Update useOrderTracking** - Batch awareness
13. **BatchRouteMap component** - Map visualization (if mapbox available)

---

## Route Optimization Options

### v1 (Default - No External API)
- Uses nearest-neighbor heuristic with Haversine distance
- Implemented in `optimize_batch_route` RPC
- Estimates: 2 min/mile + 5 min/stop

### v2 (With Mapbox - Future)
- Call Mapbox Optimization API
- Pass coordinates of all stops
- Receive optimized sequence + durations
- Store results in batch_stops

```typescript
// Edge function: optimize-batch-route
const optimizeWithMapbox = async (stops: BatchStop[]) => {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const response = await fetch(
    `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?access_token=${MAPBOX_TOKEN}`
  );
  // Parse response and update stop sequence
};
```

---

## Testing Checklist

- [ ] Create batch from selected orders
- [ ] Stops are generated correctly (pickup + dropoff per order)
- [ ] Optimize route reorders stops
- [ ] Assign driver to batch
- [ ] Orders in batch update with driver_id
- [ ] Driver sees batch in /driver/batch
- [ ] Driver can mark stops as arrived/completed
- [ ] Order status updates when stop completed
- [ ] Batch auto-completes when all stops done
- [ ] Customer tracking shows batch info
- [ ] Auto-build batches groups correctly
- [ ] RLS blocks unauthorized access
- [ ] Real-time updates work for batch changes
