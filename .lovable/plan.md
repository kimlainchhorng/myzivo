
# SLA & Performance Monitoring + Automation Implementation Plan

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `food_orders.assigned_at` | Exists | Already tracks assignment timestamp |
| `food_orders.picked_up_at` | Exists | Already tracks pickup timestamp |
| `food_orders.delivered_at` | Exists | Already tracks delivery timestamp |
| `food_orders.deliver_by` | Exists | SLA delivery target field |
| `food_orders.pickup_by` | Exists | SLA pickup target field |
| `food_orders.prepared_at` | Exists | Merchant ready timestamp |
| `food_orders.ready_at` | Exists | Alternative merchant ready timestamp |
| `food_orders.estimated_prep_time` | Exists | Prep time estimate |
| `food_orders.duration_minutes` | Exists | Estimated delivery duration |
| `order_events` table | Exists | Event log with type, actor_id, data |
| `driver_wallets` table | Exists | Balance tracking for drivers |
| `wallet_transactions` table | Exists | Transaction ledger for wallet operations |
| `eats_zones` table | Exists | Zone configuration with pricing |
| `auto_assign_order_v2` RPC | Exists | Auto-assignment function |
| `tenants` table | Exists | Multi-tenant support |
| `useDispatchAnalytics` hook | Exists | Analytics foundation to extend |
| SLA status tracking | Missing | Need sla_status, at_risk_reason fields |
| SLA metrics table | Missing | Historical SLA data for analytics |
| Performance adjustments | Missing | Bonus/penalty tracking |
| SLA evaluator | Missing | Scheduled SLA monitoring |
| SLA dashboard | Missing | No `/dispatch/sla` route |

---

## Architecture Overview

```text
SLA Monitoring System:

Order Created
    │
    ├── set_order_sla_targets() RPC
    │   └── Calculate prep_by, pickup_by, deliver_by based on:
    │       - estimated_prep_time
    │       - duration_minutes
    │       - zone-specific config
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Scheduled SLA Evaluator (runs every 2-5 min)       │
│  - Checks active orders against SLA targets         │
│  - Marks sla_status: on_time → at_risk → breached   │
│  - Records reasons (no_driver, merchant_delay, etc) │
│  - Triggers notifications + automation actions       │
└─────────────────────────────────────────────────────┘
    │
    ├── At-Risk Actions:
    │   ├── Notify dispatch (in-app)
    │   ├── Highlight order in UI (yellow/red)
    │   └── Log to tenant_audit_log
    │
    ├── Breached Actions:
    │   ├── Boost priority + re-trigger auto_assign_v2
    │   ├── Notify driver/merchant
    │   ├── Suggest reassignment to dispatcher
    │   └── Record sla_metrics for analytics
    │
    ▼
Order Delivered
    │
    └── Record to sla_metrics table
        - Calculate actual times (assign, prep, pickup, delivery)
        - Determine on_time or late
        - Optional: Queue bonus/penalty if applicable
```

---

## Database Changes

### 1. Add SLA Status Fields to `food_orders`

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'on_time' 
    CHECK (sla_status IN ('on_time', 'at_risk', 'breached')),
  ADD COLUMN IF NOT EXISTS sla_at_risk_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_breached_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS at_risk_reason TEXT,
  ADD COLUMN IF NOT EXISTS breached_reason TEXT,
  ADD COLUMN IF NOT EXISTS sla_prep_by TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_pickup_by TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_deliver_by TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_food_orders_sla_status ON food_orders(sla_status) 
  WHERE status NOT IN ('completed', 'cancelled');
```

### 2. Create `sla_metrics` Table (Historical Analytics)

```sql
CREATE TABLE IF NOT EXISTS public.sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  zone_code TEXT,
  order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  -- Time metrics (in seconds)
  assign_seconds INT, -- time from created_at to assigned_at
  prep_seconds INT,   -- time from created_at to prepared_at/ready_at
  pickup_seconds INT, -- time from assigned_at to picked_up_at
  delivery_seconds INT, -- time from picked_up_at to delivered_at
  total_seconds INT,  -- time from created_at to delivered_at
  -- SLA result
  sla_result TEXT NOT NULL CHECK (sla_result IN ('on_time', 'late')),
  late_by_seconds INT DEFAULT 0,
  late_stage TEXT, -- prep, pickup, delivery
  -- Context
  distance_miles NUMERIC,
  notes TEXT,
  CONSTRAINT unique_sla_metric_order UNIQUE (order_id)
);

CREATE INDEX idx_sla_metrics_tenant_date ON sla_metrics(tenant_id, created_at DESC);
CREATE INDEX idx_sla_metrics_merchant ON sla_metrics(merchant_id, created_at DESC);
CREATE INDEX idx_sla_metrics_driver ON sla_metrics(driver_id, created_at DESC);
CREATE INDEX idx_sla_metrics_zone ON sla_metrics(zone_code, created_at DESC);
CREATE INDEX idx_sla_metrics_result ON sla_metrics(tenant_id, sla_result);
```

### 3. Create `performance_adjustments` Table (Bonus/Penalty)

```sql
CREATE TABLE IF NOT EXISTS public.performance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES food_orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bonus', 'penalty')),
  amount_cents INT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  wallet_transaction_id UUID REFERENCES wallet_transactions(id)
);

CREATE INDEX idx_perf_adj_tenant ON performance_adjustments(tenant_id, created_at DESC);
CREATE INDEX idx_perf_adj_driver ON performance_adjustments(driver_id, status);
CREATE INDEX idx_perf_adj_pending ON performance_adjustments(tenant_id) WHERE status = 'pending';
```

### 4. Add SLA Configuration to `eats_zones` or Tenant Settings

```sql
-- Add SLA config to zones (optional, can also be tenant-level)
ALTER TABLE eats_zones
  ADD COLUMN IF NOT EXISTS sla_prep_minutes INT DEFAULT 15,
  ADD COLUMN IF NOT EXISTS sla_pickup_buffer_minutes INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sla_delivery_buffer_minutes INT DEFAULT 15,
  ADD COLUMN IF NOT EXISTS at_risk_threshold_minutes INT DEFAULT 5;
```

---

## RPC Functions

### 1. `set_order_sla_targets(p_order_id UUID)`

Sets SLA target timestamps when order is created or route changes:

```sql
CREATE OR REPLACE FUNCTION public.set_order_sla_targets(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_zone RECORD;
  v_prep_minutes INT;
  v_pickup_buffer INT;
  v_delivery_buffer INT;
BEGIN
  SELECT * INTO v_order FROM food_orders WHERE id = p_order_id;
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Get zone config (or use defaults)
  SELECT sla_prep_minutes, sla_pickup_buffer_minutes, sla_delivery_buffer_minutes
  INTO v_prep_minutes, v_pickup_buffer, v_delivery_buffer
  FROM eats_zones WHERE zone_code = v_order.zone_code;

  v_prep_minutes := COALESCE(v_prep_minutes, COALESCE(v_order.estimated_prep_time, 15));
  v_pickup_buffer := COALESCE(v_pickup_buffer, 10);
  v_delivery_buffer := COALESCE(v_delivery_buffer, 15);

  UPDATE food_orders SET
    sla_prep_by = v_order.created_at + (v_prep_minutes || ' minutes')::INTERVAL,
    sla_pickup_by = v_order.created_at + ((v_prep_minutes + v_pickup_buffer) || ' minutes')::INTERVAL,
    sla_deliver_by = v_order.created_at + 
      ((v_prep_minutes + v_pickup_buffer + COALESCE(v_order.duration_minutes, 20) + v_delivery_buffer) || ' minutes')::INTERVAL
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'sla_deliver_by', 
    v_order.created_at + ((v_prep_minutes + v_pickup_buffer + COALESCE(v_order.duration_minutes, 20) + v_delivery_buffer) || ' minutes')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. `evaluate_sla_status()` - Scheduled Evaluator

```sql
CREATE OR REPLACE FUNCTION public.evaluate_sla_status()
RETURNS TABLE(order_id UUID, new_status TEXT, reason TEXT) AS $$
DECLARE
  v_order RECORD;
  v_at_risk_threshold INTERVAL := '5 minutes';
  v_new_status TEXT;
  v_reason TEXT;
BEGIN
  -- Find active orders with SLA targets
  FOR v_order IN 
    SELECT fo.*, ez.at_risk_threshold_minutes
    FROM food_orders fo
    LEFT JOIN eats_zones ez ON ez.zone_code = fo.zone_code
    WHERE fo.status IN ('pending', 'confirmed', 'ready_for_pickup', 'in_progress')
      AND fo.sla_deliver_by IS NOT NULL
  LOOP
    v_at_risk_threshold := (COALESCE(v_order.at_risk_threshold_minutes, 5) || ' minutes')::INTERVAL;
    v_new_status := v_order.sla_status;
    v_reason := NULL;

    -- Determine SLA status
    IF v_order.sla_status != 'breached' THEN
      -- Check for breach
      IF v_order.status = 'pending' AND v_order.driver_id IS NULL AND now() > v_order.sla_pickup_by THEN
        v_new_status := 'breached';
        v_reason := 'no_driver_assigned';
      ELSIF v_order.status IN ('pending', 'confirmed') AND v_order.prepared_at IS NULL 
            AND now() > v_order.sla_prep_by THEN
        v_new_status := 'breached';
        v_reason := 'merchant_prep_delay';
      ELSIF v_order.status IN ('confirmed', 'ready_for_pickup') AND now() > v_order.sla_pickup_by THEN
        v_new_status := 'breached';
        v_reason := 'pickup_delay';
      ELSIF v_order.status = 'in_progress' AND now() > v_order.sla_deliver_by THEN
        v_new_status := 'breached';
        v_reason := 'delivery_delay';
      -- Check for at-risk
      ELSIF v_order.sla_status = 'on_time' THEN
        IF v_order.status = 'pending' AND v_order.driver_id IS NULL 
           AND now() > (v_order.sla_pickup_by - v_at_risk_threshold) THEN
          v_new_status := 'at_risk';
          v_reason := 'no_driver_approaching_deadline';
        ELSIF v_order.status IN ('confirmed', 'ready_for_pickup') 
              AND now() > (v_order.sla_pickup_by - v_at_risk_threshold) THEN
          v_new_status := 'at_risk';
          v_reason := 'pickup_approaching_deadline';
        ELSIF v_order.status = 'in_progress' 
              AND now() > (v_order.sla_deliver_by - v_at_risk_threshold) THEN
          v_new_status := 'at_risk';
          v_reason := 'delivery_approaching_deadline';
        END IF;
      END IF;
    END IF;

    -- Update if status changed
    IF v_new_status != v_order.sla_status THEN
      UPDATE food_orders SET 
        sla_status = v_new_status,
        at_risk_reason = CASE WHEN v_new_status = 'at_risk' THEN v_reason ELSE at_risk_reason END,
        breached_reason = CASE WHEN v_new_status = 'breached' THEN v_reason ELSE breached_reason END,
        sla_at_risk_at = CASE WHEN v_new_status = 'at_risk' AND sla_at_risk_at IS NULL THEN now() ELSE sla_at_risk_at END,
        sla_breached_at = CASE WHEN v_new_status = 'breached' THEN now() ELSE sla_breached_at END
      WHERE id = v_order.id;

      order_id := v_order.id;
      new_status := v_new_status;
      reason := v_reason;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. `record_sla_metrics(p_order_id UUID)` - On Delivery Complete

```sql
CREATE OR REPLACE FUNCTION public.record_sla_metrics(p_order_id UUID)
RETURNS UUID AS $$
DECLARE
  v_order RECORD;
  v_metric_id UUID;
  v_sla_result TEXT;
  v_late_seconds INT := 0;
  v_late_stage TEXT;
BEGIN
  SELECT * INTO v_order FROM food_orders WHERE id = p_order_id AND status = 'completed';
  IF v_order IS NULL THEN RETURN NULL; END IF;

  -- Determine SLA result
  IF v_order.delivered_at <= v_order.sla_deliver_by THEN
    v_sla_result := 'on_time';
  ELSE
    v_sla_result := 'late';
    v_late_seconds := EXTRACT(EPOCH FROM (v_order.delivered_at - v_order.sla_deliver_by))::INT;
    -- Determine which stage caused lateness
    IF v_order.prepared_at IS NOT NULL AND v_order.prepared_at > v_order.sla_prep_by THEN
      v_late_stage := 'prep';
    ELSIF v_order.picked_up_at IS NOT NULL AND v_order.picked_up_at > v_order.sla_pickup_by THEN
      v_late_stage := 'pickup';
    ELSE
      v_late_stage := 'delivery';
    END IF;
  END IF;

  INSERT INTO sla_metrics (
    tenant_id, zone_code, order_id, merchant_id, driver_id,
    assign_seconds, prep_seconds, pickup_seconds, delivery_seconds, total_seconds,
    sla_result, late_by_seconds, late_stage, distance_miles
  ) VALUES (
    v_order.tenant_id,
    v_order.zone_code,
    v_order.id,
    v_order.restaurant_id,
    v_order.driver_id,
    EXTRACT(EPOCH FROM (v_order.assigned_at - v_order.created_at))::INT,
    EXTRACT(EPOCH FROM (COALESCE(v_order.prepared_at, v_order.ready_at) - v_order.created_at))::INT,
    EXTRACT(EPOCH FROM (v_order.picked_up_at - v_order.assigned_at))::INT,
    EXTRACT(EPOCH FROM (v_order.delivered_at - v_order.picked_up_at))::INT,
    EXTRACT(EPOCH FROM (v_order.delivered_at - v_order.created_at))::INT,
    v_sla_result,
    v_late_seconds,
    v_late_stage,
    v_order.distance_miles
  )
  ON CONFLICT (order_id) DO UPDATE SET
    sla_result = EXCLUDED.sla_result,
    late_by_seconds = EXCLUDED.late_by_seconds,
    total_seconds = EXCLUDED.total_seconds
  RETURNING id INTO v_metric_id;

  RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Edge Function: `sla-evaluator`

Scheduled edge function to run every 2-5 minutes:

```typescript
// supabase/functions/sla-evaluator/index.ts
// Calls evaluate_sla_status() RPC
// For breached orders: calls auto_assign_order_v2 for unassigned
// Sends notifications via send-notification edge function
// Logs to tenant_audit_log for critical SLA breaches
```

---

## Frontend Implementation

### Files to Create

| File | Description |
|------|-------------|
| `src/hooks/useSLAMetrics.ts` | Fetch SLA KPIs, at-risk orders, performance data |
| `src/hooks/usePerformanceAdjustments.ts` | Bonus/penalty CRUD |
| `src/pages/dispatch/DispatchSLA.tsx` | Main SLA dashboard page |
| `src/components/sla/SLAKPICards.tsx` | On-time rate, avg times widgets |
| `src/components/sla/AtRiskOrdersList.tsx` | Live at-risk/breached orders |
| `src/components/sla/SLAByZoneTable.tsx` | Zone performance breakdown |
| `src/components/sla/SLAByMerchantTable.tsx` | Worst merchants by prep time |
| `src/components/sla/SLAByDriverTable.tsx` | Driver late rate ranking |
| `src/components/sla/PerformanceAdjustmentsPanel.tsx` | Pending bonus/penalty approvals |
| `src/components/sla/SLAExport.tsx` | CSV export functionality |

### Hook: `useSLAMetrics.ts`

```typescript
export interface SLAKPIs {
  onTimeRate: number;
  avgAssignSeconds: number;
  avgPrepSeconds: number;
  avgPickupSeconds: number;
  avgDeliverySeconds: number;
  atRiskCount: number;
  breachedCount: number;
  totalDelivered: number;
}

export function useSLAKPIs(tenantId: string, dateRange: DateRange);
export function useAtRiskOrders(tenantId: string);
export function useSLAByZone(tenantId: string, dateRange: DateRange);
export function useSLAByMerchant(tenantId: string, dateRange: DateRange, limit?: number);
export function useSLAByDriver(tenantId: string, dateRange: DateRange, limit?: number);
```

### Page: `DispatchSLA.tsx`

Layout:
```text
+------------------------------------------------------------------+
|  SLA & Performance                     [Date Range] [Export CSV] |
+------------------------------------------------------------------+
|  KPI Cards Row:                                                   |
|  [On-Time Rate] [Avg Assign] [Avg Prep] [Avg Pickup] [Avg Delivery]|
+------------------------------------------------------------------+
|  AT RISK / BREACHED ORDERS (Live)                                |
|  +-------------------------------------------------------------+ |
|  | #1234 | Pizza Palace | No driver | At Risk | [Assign] [View]| |
|  | #1235 | Burger Hub   | Pickup delay | Breached | [Reassign] | |
|  +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  PERFORMANCE BY ZONE            |  WORST MERCHANTS (Prep Time)   |
|  +----------------------------+ | +----------------------------+ |
|  | Zone | On-Time | Avg Time  | | | Restaurant | Avg Prep | Late%| |
|  | DFW  | 94.2%   | 32 min    | | | Slow Diner | 22 min   | 18% | |
|  +----------------------------+ | +----------------------------+ |
+------------------------------------------------------------------+
|  PENDING ADJUSTMENTS                                              |
|  [Driver A] Bonus $5 - Fast delivery | [Approve] [Reject]        |
+------------------------------------------------------------------+
```

### Update Dispatch Orders UI

Add SLA status indicator to order cards/rows:

```typescript
// In KanbanColumn or order list:
{order.sla_status === 'breached' && (
  <Badge variant="destructive">SLA Breached</Badge>
)}
{order.sla_status === 'at_risk' && (
  <Badge className="bg-amber-500">At Risk</Badge>
)}
```

---

## RLS Policies

### sla_metrics

```sql
ALTER TABLE sla_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read SLA metrics" ON sla_metrics
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.has_tenant_permission(tenant_id, 'analytics.view')
  );

CREATE POLICY "System can insert SLA metrics" ON sla_metrics
  FOR INSERT TO authenticated
  WITH CHECK (true);
```

### performance_adjustments

```sql
ALTER TABLE performance_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage adjustments" ON performance_adjustments
  FOR ALL TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.has_tenant_permission(tenant_id, 'payouts.manage')
  );

CREATE POLICY "Drivers can view own adjustments" ON performance_adjustments
  FOR SELECT TO authenticated
  USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );
```

---

## Sidebar & Routes Update

### Update `DispatchSidebar.tsx`

Add SLA nav item:

```typescript
{
  label: "SLA",
  path: "/dispatch/sla",
  icon: Timer,
  permission: "analytics.view",
},
```

### Update `App.tsx`

Add route:

```typescript
<Route path="sla" element={<DispatchSLA />} />
```

---

## Scheduled Job Setup

Using pg_cron to run SLA evaluator:

```sql
SELECT cron.schedule(
  'evaluate-sla-status',
  '*/3 * * * *', -- every 3 minutes
  $$
  SELECT net.http_post(
    url:='https://slirphzzwcogdbkeicff.supabase.co/functions/v1/sla-evaluator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

---

## Implementation Order

1. **Database migration** - Add columns to food_orders, create sla_metrics, performance_adjustments tables
2. **RPC functions** - set_order_sla_targets, evaluate_sla_status, record_sla_metrics
3. **Trigger on order creation** - Call set_order_sla_targets when order created
4. **Trigger on delivery complete** - Call record_sla_metrics when status = completed
5. **sla-evaluator edge function** - Scheduled SLA monitoring
6. **useSLAMetrics hook** - Analytics data fetching
7. **SLA dashboard components** - KPIs, at-risk list, zone/merchant/driver tables
8. **DispatchSLA page** - Main SLA dashboard
9. **Update order cards** - Add SLA status badges
10. **Performance adjustments panel** - Bonus/penalty management
11. **CSV export** - Export SLA metrics
12. **Update sidebar and routes**
13. **Schedule cron job** - pg_cron setup

---

## Testing Checklist

- [ ] SLA targets set correctly on order creation
- [ ] SLA recalculates when duration_minutes changes
- [ ] Evaluator marks at_risk correctly (within threshold of deadline)
- [ ] Evaluator marks breached correctly (past deadline)
- [ ] Correct reason recorded for each status
- [ ] Notifications sent for at-risk orders
- [ ] auto_assign_v2 re-triggered for breached unassigned orders
- [ ] sla_metrics recorded on delivery completion
- [ ] On-time rate calculates correctly
- [ ] Zone breakdown shows correct data
- [ ] Merchant prep time rankings accurate
- [ ] Driver late rate rankings accurate
- [ ] Pending adjustments show in panel
- [ ] Approve adjustment creates wallet transaction
- [ ] CSV export includes all metrics
- [ ] RLS prevents cross-tenant data access
