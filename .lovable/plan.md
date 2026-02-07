
# AI Dispatch Optimization + Demand Prediction Implementation Plan

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `eats_zones` table | Exists | Has zone_code, SLA config fields |
| `drivers` table | Exists | Has acceptance_count, decline_count, cancel_count, current_lat/lng, is_online |
| `auto_assign_order_v2` RPC | Exists | Basic scoring: distance, rating, fairness, freshness |
| `sla-evaluator` edge function | Exists | Runs via pg_cron, can serve as template |
| `useSLAMetrics` hooks | Exist | Analytics pattern to follow |
| `useSurgePricing` hook | Exists | Real-time surge monitoring |
| `useDriverQueue` hook | Exists | Driver scoring logic already implemented |
| `sla_metrics` table | Exists | Historical performance data |
| Demand snapshots | Missing | Need new table for historical demand data |
| Demand forecasts | Missing | Need prediction infrastructure |
| Driver positioning | Missing | Need reposition recommendations |

---

## Architecture Overview

```text
Demand Prediction & Optimization Flow:

┌─────────────────────────────────────────────────────────────────────┐
│  Scheduled Job: aggregate_demand_snapshots (every 15 min)           │
│  - For each zone: count orders, drivers, avg times                  │
│  - Insert into demand_snapshots                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Scheduled Job: generate_zone_forecasts (every hour)                │
│  - For each zone + hour: look at last 4 weeks same day/hour         │
│  - Calculate predicted_orders, predicted_drivers_needed             │
│  - Store in demand_forecasts                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Surge Pre-Warning│ │ Driver Reposition│ │ Auto-Assign v3   │
│ - Forecast surge │ │ - Find shortages │ │ - Add acceptance │
│ - Show indicator │ │ - Suggest moves  │ │ - Add completion │
│ - Gradual ramp   │ │ - Driver app msg │ │ - Add avg delay  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Dispatch Demand Dashboard (/dispatch/demand)                       │
│  - Heatmap: Orders by zone/hour                                     │
│  - Forecast panel: Next hour predictions                            │
│  - At-risk zones table                                              │
│  - Driver reposition recommendations                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Create `demand_snapshots` Table

Historical demand data collected every 15 minutes:

```sql
CREATE TABLE public.demand_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  zone_code TEXT NOT NULL,
  hour_of_day INT NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  snapshot_time TIMESTAMPTZ NOT NULL,
  orders_count INT DEFAULT 0,
  drivers_online INT DEFAULT 0,
  avg_delivery_minutes NUMERIC,
  avg_assign_seconds NUMERIC,
  avg_wait_minutes NUMERIC,
  surge_multiplier NUMERIC DEFAULT 1.0
);

CREATE INDEX idx_demand_snapshots_lookup ON demand_snapshots(
  tenant_id, zone_code, hour_of_day, day_of_week
);
CREATE INDEX idx_demand_snapshots_time ON demand_snapshots(tenant_id, snapshot_time DESC);
CREATE INDEX idx_demand_snapshots_zone ON demand_snapshots(zone_code, created_at DESC);
```

### 2. Create `demand_forecasts` Table

Predicted demand for upcoming hours:

```sql
CREATE TABLE public.demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  zone_code TEXT NOT NULL,
  forecast_for TIMESTAMPTZ NOT NULL,
  predicted_orders INT NOT NULL,
  predicted_drivers_needed INT NOT NULL,
  current_drivers_online INT DEFAULT 0,
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  forecast_type TEXT DEFAULT 'heuristic',
  surge_predicted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  CONSTRAINT unique_forecast UNIQUE (tenant_id, zone_code, forecast_for)
);

CREATE INDEX idx_demand_forecasts_lookup ON demand_forecasts(tenant_id, zone_code, forecast_for);
CREATE INDEX idx_demand_forecasts_upcoming ON demand_forecasts(forecast_for) 
  WHERE forecast_for > now();
```

### 3. Create `driver_reposition_recommendations` Table

Suggestions for driver positioning:

```sql
CREATE TABLE public.driver_reposition_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  current_zone_code TEXT,
  suggested_zone_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority INT DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  accepted BOOLEAN,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reposition_driver ON driver_reposition_recommendations(driver_id, expires_at DESC);
CREATE INDEX idx_reposition_active ON driver_reposition_recommendations(tenant_id, expires_at) 
  WHERE expires_at > now() AND acknowledged_at IS NULL;
```

### 4. Add Driver Performance Fields

Enhance drivers table for improved scoring:

```sql
ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS completion_rate NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS avg_delay_minutes NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS performance_score NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_performance_calc TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_drivers_performance ON drivers(performance_score DESC) 
  WHERE is_online = true AND status = 'verified';
```

### 5. Add Permission

```sql
INSERT INTO permissions (key, description, category) VALUES
  ('demand.view', 'View demand forecasts and driver positioning', 'analytics')
ON CONFLICT (key) DO NOTHING;
```

---

## RPC Functions

### 1. `aggregate_demand_snapshot` - Collect Current Demand Data

```sql
CREATE OR REPLACE FUNCTION public.aggregate_demand_snapshot()
RETURNS INT AS $$
DECLARE
  v_zone RECORD;
  v_snapshot_count INT := 0;
  v_now TIMESTAMPTZ := now();
  v_hour INT := EXTRACT(HOUR FROM v_now);
  v_dow INT := EXTRACT(DOW FROM v_now);
  v_window_start TIMESTAMPTZ := v_now - INTERVAL '15 minutes';
BEGIN
  -- For each active zone
  FOR v_zone IN 
    SELECT DISTINCT zone_code, tenant_id FROM eats_zones WHERE is_active = true
  LOOP
    INSERT INTO demand_snapshots (
      tenant_id, zone_code, hour_of_day, day_of_week, snapshot_time,
      orders_count, drivers_online, avg_delivery_minutes, avg_assign_seconds
    )
    SELECT
      v_zone.tenant_id,
      v_zone.zone_code,
      v_hour,
      v_dow,
      v_now,
      COUNT(DISTINCT fo.id),
      (SELECT COUNT(*) FROM drivers d 
       WHERE d.is_online = true AND d.status = 'verified' 
       AND d.updated_at > v_now - INTERVAL '5 minutes'),
      AVG(EXTRACT(EPOCH FROM (fo.delivered_at - fo.created_at)) / 60),
      AVG(EXTRACT(EPOCH FROM (fo.assigned_at - fo.created_at)))
    FROM food_orders fo
    WHERE fo.zone_code = v_zone.zone_code
      AND fo.created_at BETWEEN v_window_start AND v_now;

    v_snapshot_count := v_snapshot_count + 1;
  END LOOP;

  RETURN v_snapshot_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. `generate_zone_forecast` - Predict Demand for a Zone

```sql
CREATE OR REPLACE FUNCTION public.generate_zone_forecast(
  p_zone_code TEXT,
  p_tenant_id UUID DEFAULT NULL,
  p_hours_ahead INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_target_time TIMESTAMPTZ;
  v_target_hour INT;
  v_target_dow INT;
  v_predicted_orders INT;
  v_predicted_drivers INT;
  v_sample_count INT;
  v_confidence NUMERIC;
  v_driver_per_order NUMERIC := 0.5; -- Configurable ratio
  v_current_drivers INT;
BEGIN
  v_target_time := now() + (p_hours_ahead || ' hours')::INTERVAL;
  v_target_hour := EXTRACT(HOUR FROM v_target_time);
  v_target_dow := EXTRACT(DOW FROM v_target_time);

  -- Get average from last 4 weeks for same day/hour
  SELECT 
    AVG(orders_count)::INT,
    COUNT(*)
  INTO v_predicted_orders, v_sample_count
  FROM demand_snapshots
  WHERE zone_code = p_zone_code
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
    AND hour_of_day = v_target_hour
    AND day_of_week = v_target_dow
    AND created_at > now() - INTERVAL '4 weeks';

  v_predicted_orders := COALESCE(v_predicted_orders, 5); -- Default minimum
  v_predicted_drivers := GREATEST(1, CEIL(v_predicted_orders * v_driver_per_order));
  
  -- Confidence based on sample size
  v_confidence := LEAST(1.0, v_sample_count::NUMERIC / 8); -- 8 samples = 4 weeks

  -- Get current drivers online
  SELECT COUNT(*) INTO v_current_drivers
  FROM drivers 
  WHERE is_online = true AND status = 'verified' 
  AND updated_at > now() - INTERVAL '5 minutes';

  -- Upsert forecast
  INSERT INTO demand_forecasts (
    tenant_id, zone_code, forecast_for, predicted_orders, 
    predicted_drivers_needed, current_drivers_online, confidence,
    surge_predicted
  ) VALUES (
    p_tenant_id, p_zone_code, date_trunc('hour', v_target_time),
    v_predicted_orders, v_predicted_drivers, v_current_drivers, v_confidence,
    v_predicted_drivers > v_current_drivers * 1.3
  )
  ON CONFLICT (tenant_id, zone_code, forecast_for) DO UPDATE SET
    predicted_orders = EXCLUDED.predicted_orders,
    predicted_drivers_needed = EXCLUDED.predicted_drivers_needed,
    current_drivers_online = EXCLUDED.current_drivers_online,
    confidence = EXCLUDED.confidence,
    surge_predicted = EXCLUDED.surge_predicted,
    created_at = now();

  RETURN jsonb_build_object(
    'zone_code', p_zone_code,
    'forecast_for', v_target_time,
    'predicted_orders', v_predicted_orders,
    'predicted_drivers_needed', v_predicted_drivers,
    'current_drivers', v_current_drivers,
    'confidence', v_confidence,
    'surge_predicted', v_predicted_drivers > v_current_drivers * 1.3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. `generate_all_forecasts` - Generate Forecasts for All Zones

```sql
CREATE OR REPLACE FUNCTION public.generate_all_forecasts()
RETURNS INT AS $$
DECLARE
  v_zone RECORD;
  v_count INT := 0;
BEGIN
  FOR v_zone IN 
    SELECT DISTINCT zone_code, tenant_id FROM eats_zones WHERE is_active = true
  LOOP
    -- Generate forecasts for next 3 hours
    PERFORM generate_zone_forecast(v_zone.zone_code, v_zone.tenant_id, 1);
    PERFORM generate_zone_forecast(v_zone.zone_code, v_zone.tenant_id, 2);
    PERFORM generate_zone_forecast(v_zone.zone_code, v_zone.tenant_id, 3);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. `recommend_driver_positions` - Generate Reposition Recommendations

```sql
CREATE OR REPLACE FUNCTION public.recommend_driver_positions(p_tenant_id UUID DEFAULT NULL)
RETURNS INT AS $$
DECLARE
  v_shortage RECORD;
  v_driver RECORD;
  v_count INT := 0;
BEGIN
  -- Find zones with predicted shortage (need more drivers than available)
  FOR v_shortage IN
    SELECT 
      zone_code,
      predicted_orders,
      predicted_drivers_needed,
      current_drivers_online,
      (predicted_drivers_needed - current_drivers_online) as shortage
    FROM demand_forecasts
    WHERE forecast_for BETWEEN now() AND now() + INTERVAL '1 hour'
      AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
      AND predicted_drivers_needed > current_drivers_online * 1.2
    ORDER BY (predicted_drivers_needed - current_drivers_online) DESC
    LIMIT 5
  LOOP
    -- Find available drivers in low-demand zones
    FOR v_driver IN
      SELECT 
        d.id as driver_id,
        d.home_city as current_zone
      FROM drivers d
      WHERE d.is_online = true 
        AND d.status = 'verified'
        AND d.updated_at > now() - INTERVAL '5 minutes'
        -- Not already recommended
        AND NOT EXISTS (
          SELECT 1 FROM driver_reposition_recommendations r
          WHERE r.driver_id = d.id 
            AND r.expires_at > now() 
            AND r.acknowledged_at IS NULL
        )
      LIMIT v_shortage.shortage
    LOOP
      INSERT INTO driver_reposition_recommendations (
        tenant_id, driver_id, current_zone_code, suggested_zone_code,
        reason, priority, expires_at
      ) VALUES (
        p_tenant_id,
        v_driver.driver_id,
        v_driver.current_zone,
        v_shortage.zone_code,
        format('High demand expected: %s orders predicted in next hour', v_shortage.predicted_orders),
        CASE WHEN v_shortage.shortage > 5 THEN 1 ELSE 2 END,
        now() + INTERVAL '30 minutes'
      );
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. `update_driver_performance_stats` - Calculate Driver Performance

```sql
CREATE OR REPLACE FUNCTION public.update_driver_performance_stats(p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats RECORD;
  v_acceptance_rate NUMERIC;
  v_completion_rate NUMERIC;
  v_avg_delay NUMERIC;
  v_performance_score NUMERIC;
BEGIN
  -- Calculate rates from last 30 days
  SELECT 
    CASE WHEN (d.acceptance_count + d.decline_count) > 0 
      THEN d.acceptance_count::NUMERIC / (d.acceptance_count + d.decline_count)
      ELSE 1.0 END,
    CASE WHEN d.acceptance_count > 0
      THEN (d.acceptance_count - COALESCE(d.cancel_count, 0))::NUMERIC / d.acceptance_count
      ELSE 1.0 END
  INTO v_acceptance_rate, v_completion_rate
  FROM drivers d
  WHERE d.id = p_driver_id;

  -- Calculate average delay from SLA metrics
  SELECT COALESCE(AVG(
    CASE WHEN late_by_seconds > 0 THEN late_by_seconds / 60.0 ELSE 0 END
  ), 0)
  INTO v_avg_delay
  FROM sla_metrics
  WHERE driver_id = p_driver_id
    AND created_at > now() - INTERVAL '30 days';

  -- Composite performance score (0-100)
  v_performance_score := (
    (v_acceptance_rate * 40) +
    (v_completion_rate * 40) +
    (GREATEST(0, 20 - v_avg_delay)) -- Deduct for delays
  );

  -- Update driver
  UPDATE drivers SET
    acceptance_rate = v_acceptance_rate,
    completion_rate = v_completion_rate,
    avg_delay_minutes = v_avg_delay,
    performance_score = v_performance_score,
    last_performance_calc = now()
  WHERE id = p_driver_id;

  RETURN jsonb_build_object(
    'driver_id', p_driver_id,
    'acceptance_rate', v_acceptance_rate,
    'completion_rate', v_completion_rate,
    'avg_delay_minutes', v_avg_delay,
    'performance_score', v_performance_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Edge Function: `demand-optimizer`

Scheduled edge function for demand aggregation and forecasting:

```typescript
// supabase/functions/demand-optimizer/index.ts
// Runs every 15 minutes via pg_cron
// 1. Calls aggregate_demand_snapshot()
// 2. Every hour: Calls generate_all_forecasts()
// 3. Calls recommend_driver_positions()
// 4. Checks for surge predictions and logs alerts
```

---

## Frontend Implementation

### Files to Create

| File | Description |
|------|-------------|
| `src/hooks/useDemandForecast.ts` | Fetch forecasts, snapshots, recommendations |
| `src/pages/dispatch/DispatchDemand.tsx` | Main demand dashboard |
| `src/components/demand/DemandHeatmap.tsx` | Orders by zone/hour heatmap |
| `src/components/demand/ForecastPanel.tsx` | Next-hour predictions per zone |
| `src/components/demand/AtRiskZonesTable.tsx` | Zones with predicted shortage |
| `src/components/demand/RepositionRecommendations.tsx` | Driver move suggestions |
| `src/components/demand/DemandKPICards.tsx` | Summary stats widgets |

### Hook: `useDemandForecast.ts`

```typescript
export interface ZoneForecast {
  zone_code: string;
  forecast_for: string;
  predicted_orders: number;
  predicted_drivers_needed: number;
  current_drivers_online: number;
  confidence: number;
  surge_predicted: boolean;
}

export interface DemandSnapshot {
  zone_code: string;
  hour_of_day: number;
  day_of_week: number;
  orders_count: number;
  drivers_online: number;
  avg_delivery_minutes: number;
}

export interface RepositionRecommendation {
  id: string;
  driver_id: string;
  driver_name?: string;
  current_zone_code: string;
  suggested_zone_code: string;
  reason: string;
  priority: number;
  expires_at: string;
}

export function useDemandForecasts(tenantId: string | null);
export function useDemandSnapshots(tenantId: string | null, hoursBack: number);
export function useRepositionRecommendations(tenantId: string | null);
export function useAtRiskZones(tenantId: string | null);
```

### Page: `DispatchDemand.tsx`

Layout:

```text
+------------------------------------------------------------------+
|  Demand & Forecasting                  [Refresh] [Time Range]    |
+------------------------------------------------------------------+
|  KPI Cards:                                                       |
|  [Zones At Risk] [Surge Predicted] [Reposition Pending] [Score]  |
+------------------------------------------------------------------+
|  DEMAND HEATMAP (Orders by Zone x Hour)                          |
|  +-------------------------------------------------------------+ |
|  |     | 6AM | 7AM | 8AM | 9AM | ... | 8PM | 9PM |             | |
|  | DFW |  2  |  5  |  12 |  18 | ... |  15 |  8  |             | |
|  | HOU |  1  |  3  |  8  |  14 | ... |  12 |  6  |             | |
|  +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  NEXT HOUR FORECAST            |  AT-RISK ZONES                  |
|  +---------------------------+ | +------------------------------+|
|  | Zone | Pred | Need | Now | | | Zone | Shortage | Surge      ||
|  | DFW  | 25   | 13   | 8   | | | DFW  | -5 drivers | Yes       ||
|  +---------------------------+ | +------------------------------+|
+------------------------------------------------------------------+
|  DRIVER REPOSITION RECOMMENDATIONS                                |
|  +-------------------------------------------------------------+ |
|  | Driver | Current | Suggested | Reason | [Notify] [Dismiss]  | |
|  +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Enhanced Auto-Assign Scoring

Update the existing auto-assign scoring to include performance factors:

```sql
-- In auto_assign_order_v2, add to driver scoring:
score := score + (driver.acceptance_rate * 15);  -- Up to 15 points
score := score + (driver.completion_rate * 15);  -- Up to 15 points
score := score - (driver.avg_delay_minutes * 2); -- Deduct for delays
```

---

## Surge Pre-Warning Integration

Enhance existing surge logic to use forecasts:

```typescript
// In useSurgePricing.ts, add forecast check:
const forecastedSurge = forecasts?.some(
  f => f.zone_code === currentZone && f.surge_predicted
);

// Show pre-warning indicator in UI
```

---

## RLS Policies

### demand_snapshots

```sql
ALTER TABLE demand_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read demand snapshots" ON demand_snapshots
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'demand.view'))
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'analytics.view'))
  );

CREATE POLICY "System can insert snapshots" ON demand_snapshots
  FOR INSERT TO authenticated WITH CHECK (true);
```

### demand_forecasts

```sql
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read forecasts" ON demand_forecasts
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'demand.view'))
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'analytics.view'))
  );
```

### driver_reposition_recommendations

```sql
ALTER TABLE driver_reposition_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own recommendations" ON driver_reposition_recommendations
  FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage recommendations" ON driver_reposition_recommendations
  FOR ALL TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'demand.view'))
  );
```

---

## Sidebar & Routes

### Update `DispatchSidebar.tsx`

Add Demand nav item (after Analytics):

```typescript
{
  label: "Demand",
  path: "/dispatch/demand",
  icon: TrendingUp, // or BarChart2
  permission: "demand.view",
},
```

### Update `App.tsx`

Add route:

```typescript
<Route path="demand" element={<DispatchDemand />} />
```

---

## Scheduled Jobs Setup

Using pg_cron for scheduled execution:

```sql
-- Aggregate demand every 15 minutes
SELECT cron.schedule(
  'aggregate-demand-snapshots',
  '*/15 * * * *',
  $$SELECT aggregate_demand_snapshot();$$
);

-- Generate forecasts every hour
SELECT cron.schedule(
  'generate-demand-forecasts',
  '0 * * * *',
  $$SELECT generate_all_forecasts();$$
);

-- Recommend driver positions every 30 minutes
SELECT cron.schedule(
  'recommend-driver-positions',
  '*/30 * * * *',
  $$SELECT recommend_driver_positions(NULL);$$
);
```

---

## Implementation Order

1. **Database migration** - Create tables, add driver performance columns
2. **RPC functions** - aggregate_demand_snapshot, generate_zone_forecast, etc.
3. **RLS policies** - Tenant-scoped access control
4. **demand-optimizer edge function** - Scheduled data collection
5. **useDemandForecast hook** - Data fetching
6. **Demand dashboard components** - Heatmap, forecast panel, recommendations
7. **DispatchDemand page** - Main dashboard
8. **Update auto-assign scoring** - Add performance factors
9. **Integrate surge pre-warning** - Show forecast indicators
10. **Update sidebar and routes**
11. **Schedule cron jobs** - pg_cron setup

---

## Testing Checklist

- [ ] Demand snapshots collected every 15 minutes
- [ ] Forecasts generated correctly based on historical data
- [ ] Confidence scores reflect sample size
- [ ] Surge predictions trigger when drivers < needed
- [ ] Reposition recommendations target correct zones
- [ ] Driver performance stats calculate correctly
- [ ] Auto-assign uses new performance factors
- [ ] Heatmap displays orders by zone/hour
- [ ] Forecast panel shows next-hour predictions
- [ ] At-risk zones highlighted correctly
- [ ] RLS prevents cross-tenant access
- [ ] Cron jobs run on schedule
