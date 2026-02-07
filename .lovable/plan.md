
# Multi-Zone Dispatch + Surge + Driver Priority Queue Implementation Plan

## Overview

Scale dispatch operations with geographic zones, dynamic surge pricing based on supply/demand, and a fairness-based driver priority queue for auto-assignment. This builds on top of the existing `regions` infrastructure while adding zone-specific surge rules and intelligent driver scoring.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `regions` table | Exists | Has city, state, timezone, is_active, etc. |
| `region_settings` table | Exists | Has `surge_enabled`, `max_surge_multiplier`, `dispatch_mode` |
| `drivers.region_id` | Exists | Already links drivers to regions |
| `food_orders.region_id` | Exists | Already links orders to regions |
| `trips.region_id` | Exists | Already links trips to regions |
| `restaurants.region_id` | Missing | Needs to be added |
| `ride_zones` / `eats_zones` | Exists | Zone-based pricing but separate from dispatch regions |
| `useSurgePricing` hook | Exists | Basic surge based on global driver count |
| `useRegions` hook | Exists | Full CRUD for regions |
| `auto-dispatch` edge function | Exists | Finds nearest driver globally, no zone filtering |
| Dispatch sidebar | Missing zones | No zone/surge/queue management pages |

---

## Architecture

```text
                    ┌───────────────────────────────────────────┐
                    │           Order Created                   │
                    │    (pickup location provided)             │
                    └──────────────────┬────────────────────────┘
                                       │
                                       ▼
                    ┌───────────────────────────────────────────┐
                    │     Determine zone_id from:              │
                    │     1. Restaurant's region_id            │
                    │     2. Nearest region by coordinates     │
                    └──────────────────┬────────────────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              ▼                                                 ▼
┌──────────────────────────────┐              ┌─────────────────────────────────┐
│   Surge Calculation          │              │   Auto-Dispatch v2              │
│   get_zone_surge_multiplier  │              │   score_and_assign_driver       │
│                              │              │                                 │
│ • Count recent orders        │              │ Score factors:                  │
│ • Count online drivers       │              │ • Distance to pickup            │
│ • Apply surge rule thresholds│              │ • Driver rating                 │
│ • Return multiplier          │              │ • Last assigned (fairness)      │
└──────────────────┬───────────┘              │ • Online freshness              │
                   │                          └───────────────┬─────────────────┘
                   ▼                                          │
┌──────────────────────────────┐                              ▼
│   Pricing Calculation        │              ┌─────────────────────────────────┐
│   Apply surge to subtotal    │              │   Update Driver Queue           │
│   Store surge_multiplier     │              │   Track last_assigned_at        │
│   on order                   │              │   Maintain fairness metrics     │
└──────────────────────────────┘              └─────────────────────────────────┘
```

---

## Database Changes

### 1. Add `region_id` to `restaurants` Table

```sql
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);

CREATE INDEX IF NOT EXISTS idx_restaurants_region ON restaurants(region_id);
```

### 2. Add Geographic Coordinates to `regions` Table

```sql
ALTER TABLE regions
  ADD COLUMN IF NOT EXISTS center_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS center_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS polygon JSONB,
  ADD COLUMN IF NOT EXISTS bbox JSONB;
```

### 3. Create `surge_rules` Table

```sql
CREATE TABLE public.surge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Surge Rule',
  is_active BOOLEAN DEFAULT true,
  min_pending_orders INT DEFAULT 5,
  max_online_drivers INT DEFAULT 3,
  surge_multiplier NUMERIC DEFAULT 1.25,
  max_multiplier NUMERIC DEFAULT 2.0,
  starts_at TIME,
  ends_at TIME,
  day_of_week INT[],
  priority INT DEFAULT 0,
  CONSTRAINT valid_multiplier CHECK (surge_multiplier >= 1.0 AND surge_multiplier <= 5.0)
);

CREATE INDEX idx_surge_rules_region ON surge_rules(region_id, is_active);
```

### 4. Create `surge_overrides` Table (Manual Admin Override)

```sql
CREATE TABLE public.surge_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  forced_multiplier NUMERIC NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_active_override UNIQUE (region_id, is_active)
);

CREATE INDEX idx_surge_overrides_region ON surge_overrides(region_id, is_active);
```

### 5. Create `driver_queue` Table

```sql
CREATE TABLE public.driver_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,
  last_assigned_at TIMESTAMPTZ,
  total_assigned_today INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_driver_per_region UNIQUE (region_id, driver_id)
);

CREATE INDEX idx_driver_queue_region ON driver_queue(region_id, is_active, score DESC);
CREATE INDEX idx_driver_queue_driver ON driver_queue(driver_id);
```

### 6. Add Surge Columns to Order Tables

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS surge_multiplier NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS surged_subtotal NUMERIC DEFAULT 0;

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS surge_multiplier NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS surged_fare NUMERIC DEFAULT 0;
```

### 7. RLS Policies

```sql
-- surge_rules (admin only write)
ALTER TABLE surge_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read surge rules" ON surge_rules FOR SELECT USING (true);
CREATE POLICY "Admin can manage surge rules" ON surge_rules FOR ALL
  USING (public.is_admin(auth.uid()));

-- surge_overrides (admin only)
ALTER TABLE surge_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage surge overrides" ON surge_overrides FOR ALL
  USING (public.is_admin(auth.uid()));

-- driver_queue (admin write, drivers read own)
ALTER TABLE driver_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage driver queue" ON driver_queue FOR ALL
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Drivers can read own queue entry" ON driver_queue FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));
```

---

## Database Functions (RPCs)

### 1. `get_zone_surge_multiplier(p_region_id uuid)`

Computes the current surge multiplier for a region:
- Count pending/active orders in last 30 minutes
- Count online drivers with recent activity (2 min)
- Check if override exists (return override first)
- Evaluate surge_rules against thresholds
- Return highest applicable multiplier

### 2. `score_driver_for_assignment(p_driver_id uuid, p_pickup_lat numeric, p_pickup_lng numeric)`

Calculates driver priority score:
- Distance score: 40 points max (closer = higher)
- Rating score: 25 points max (higher rating = higher)
- Fairness score: 25 points max (longer wait = higher)
- Freshness score: 10 points max (recent ping = higher)
- Returns composite score (0-100)

### 3. `auto_assign_order_v2(p_order_id uuid, p_service_type text)`

Enhanced auto-dispatch:
- Get order's region_id and pickup coordinates
- Find eligible drivers (same region, online, verified, recent activity)
- Score all drivers using `score_driver_for_assignment`
- Assign to highest scorer with atomic update
- Update `driver_queue.last_assigned_at`
- Log assignment event
- Return assigned driver info

### 4. `update_driver_queue_on_assignment()` (Trigger)

Trigger on order assignment:
- Updates `driver_queue.last_assigned_at`
- Increments `total_assigned_today`
- Resets counter at midnight

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useZoneDispatch.ts` | Create | Zone-aware dispatch hooks |
| `src/hooks/useZoneSurge.ts` | Create | Per-zone surge hooks with real-time |
| `src/hooks/useDriverQueue.ts` | Create | Driver queue management hooks |
| `src/pages/dispatch/DispatchZones.tsx` | Create | Zone list + management |
| `src/pages/dispatch/DispatchZoneDetail.tsx` | Create | Zone detail with drivers/merchants |
| `src/pages/dispatch/DispatchSurge.tsx` | Create | Surge rules + overrides management |
| `src/pages/dispatch/DispatchQueue.tsx` | Create | Live driver queue visualization |
| `src/components/dispatch/ZoneSurgeCard.tsx` | Create | Real-time surge indicator per zone |
| `src/components/dispatch/DriverQueueList.tsx` | Create | Ranked driver list component |
| `src/components/dispatch/ZoneMap.tsx` | Create | Map with zone boundaries (if mapbox available) |
| `supabase/functions/auto-dispatch-v2/index.ts` | Create | Enhanced dispatch with scoring |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Zones, Surge, Queue nav items |
| `src/App.tsx` | Modify | Add new dispatch routes |
| Database migration | Create | All tables, functions, triggers, RLS |

---

## Component Specifications

### DispatchZones Page

**Route:** `/dispatch/zones`

**Features:**
- List all regions with status badges
- Show online drivers count per zone
- Show pending orders count per zone
- Current surge multiplier badge
- Quick actions: Enable/Disable zone
- Create new zone button

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│  Zones                                     [+ Create Zone]   │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Houston - Downtown              🟢 Active              │  │
│  │ Drivers: 12 online • Orders: 5 pending • Surge: 1.0x  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Houston - Galleria              🟢 Active              │  │
│  │ Drivers: 4 online • Orders: 8 pending • Surge: 1.5x   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### DispatchZoneDetail Page

**Route:** `/dispatch/zones/:id`

**Sections:**
1. **Zone Info Card** - Name, city, center coordinates, edit button
2. **Statistics Cards** - Online drivers, pending orders, current surge, avg wait time
3. **Merchants Table** - Restaurants assigned to this zone
4. **Drivers Table** - Drivers in this zone (online/offline status)
5. **Map** (optional) - Show zone boundary, driver pins, order pins

### DispatchSurge Page

**Route:** `/dispatch/surge`

**Features:**
- Real-time surge multiplier cards per zone
- Surge rules table with CRUD
- Manual override section
- Historical surge chart (last 24 hours)

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│  Surge Management                                            │
├──────────────────────────────────────────────────────────────┤
│  CURRENT MULTIPLIERS                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Downtown  │ │ Galleria │ │ Midtown  │ │ Heights  │        │
│  │  1.0x    │ │  1.5x ⚡ │ │  1.25x   │ │  1.0x    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├──────────────────────────────────────────────────────────────┤
│  SURGE RULES                              [+ Add Rule]       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Peak Hours (5-8pm) • 1.25x • Active                    │  │
│  │ High Demand • 1.5x when orders > 10 & drivers < 5     │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  MANUAL OVERRIDE                                             │
│  Zone: [Select ▼]  Multiplier: [1.5]  [Apply Override]      │
└──────────────────────────────────────────────────────────────┘
```

### DispatchQueue Page

**Route:** `/dispatch/queue`

**Features:**
- Select zone dropdown
- Live ranked driver list with scores
- Score breakdown (distance, rating, fairness)
- Last assigned time
- Current order status
- "Rebuild Queue" button
- Feature flag toggle for v2 dispatch

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│  Driver Queue                      Zone: [Downtown ▼]        │
│                                    [🔄 Rebuild] [v2 ✓]       │
├──────────────────────────────────────────────────────────────┤
│  Rank │ Driver        │ Score │ Rating │ Last Assigned      │
│  ─────┼───────────────┼───────┼────────┼────────────────────│
│  1    │ Maria G.      │ 87    │ 4.9 ⭐ │ 45 min ago         │
│  2    │ John T.       │ 82    │ 4.8 ⭐ │ 30 min ago         │
│  3    │ Alex P.       │ 75    │ 4.7 ⭐ │ 15 min ago         │
│  4    │ Sarah M.      │ 68    │ 4.6 ⭐ │ 5 min ago          │
└──────────────────────────────────────────────────────────────┘
```

---

## Edge Function: `auto-dispatch-v2`

Enhanced version of auto-dispatch with zone filtering and scoring:

```typescript
// Pseudocode
async function autoDispatchV2(orderId: string, serviceType: 'eats' | 'rides') {
  // 1. Get order with region_id and pickup coordinates
  const order = await getOrder(orderId);
  
  // 2. Find eligible drivers in same region
  const drivers = await getEligibleDrivers({
    regionId: order.region_id,
    isOnline: true,
    lastActiveWithin: '2 minutes',
    hasCoordinates: true
  });
  
  // 3. Score each driver
  const scoredDrivers = drivers.map(driver => ({
    ...driver,
    score: calculateScore(driver, order)
  })).sort((a, b) => b.score - a.score);
  
  // 4. Assign to highest scorer (atomic)
  const assigned = await assignDriver(orderId, scoredDrivers[0].id);
  
  // 5. Update driver queue
  await updateDriverQueue(scoredDrivers[0].id, order.region_id);
  
  // 6. Send notification
  await notifyDriver(scoredDrivers[0].id, order);
  
  return assigned;
}
```

---

## Surge Calculation Logic

```sql
CREATE OR REPLACE FUNCTION get_zone_surge_multiplier(p_region_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_override NUMERIC;
  v_pending_orders INT;
  v_online_drivers INT;
  v_rule RECORD;
  v_multiplier NUMERIC := 1.0;
  v_current_time TIME := CURRENT_TIME;
  v_current_dow INT := EXTRACT(DOW FROM CURRENT_DATE);
BEGIN
  -- Check for active override first
  SELECT forced_multiplier INTO v_override
  FROM surge_overrides
  WHERE region_id = p_region_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
    
  IF v_override IS NOT NULL THEN
    RETURN v_override;
  END IF;
  
  -- Count pending orders in last 30 minutes
  SELECT COUNT(*) INTO v_pending_orders
  FROM food_orders
  WHERE region_id = p_region_id
    AND status IN ('pending', 'confirmed', 'ready_for_pickup')
    AND created_at > now() - INTERVAL '30 minutes';
  
  -- Count online drivers with recent activity
  SELECT COUNT(*) INTO v_online_drivers
  FROM drivers
  WHERE region_id = p_region_id
    AND is_online = true
    AND last_active_at > now() - INTERVAL '2 minutes';
  
  -- Evaluate surge rules
  FOR v_rule IN
    SELECT * FROM surge_rules
    WHERE region_id = p_region_id
      AND is_active = true
      AND (starts_at IS NULL OR v_current_time >= starts_at)
      AND (ends_at IS NULL OR v_current_time <= ends_at)
      AND (day_of_week IS NULL OR v_current_dow = ANY(day_of_week))
    ORDER BY priority DESC
  LOOP
    IF v_pending_orders >= v_rule.min_pending_orders 
       AND v_online_drivers <= v_rule.max_online_drivers THEN
      v_multiplier := GREATEST(v_multiplier, v_rule.surge_multiplier);
    END IF;
  END LOOP;
  
  RETURN v_multiplier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Driver Scoring Algorithm

```sql
CREATE OR REPLACE FUNCTION score_driver_for_assignment(
  p_driver_id UUID,
  p_pickup_lat NUMERIC,
  p_pickup_lng NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_driver RECORD;
  v_queue RECORD;
  v_distance_km NUMERIC;
  v_distance_score NUMERIC;
  v_rating_score NUMERIC;
  v_fairness_score NUMERIC;
  v_freshness_score NUMERIC;
  v_total_score NUMERIC;
BEGIN
  -- Get driver info
  SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id;
  SELECT * INTO v_queue FROM driver_queue WHERE driver_id = p_driver_id;
  
  -- Distance score (40 points max, 0 at 10km+)
  v_distance_km := haversine_miles(
    p_pickup_lat, p_pickup_lng, 
    v_driver.current_lat, v_driver.current_lng
  ) * 1.60934; -- Convert to km
  v_distance_score := GREATEST(0, 40 - (v_distance_km * 4));
  
  -- Rating score (25 points max)
  v_rating_score := COALESCE(v_driver.rating, 4.0) * 5;
  
  -- Fairness score (25 points, more time since last assignment = higher)
  v_fairness_score := LEAST(25, 
    EXTRACT(EPOCH FROM (now() - COALESCE(v_queue.last_assigned_at, now() - INTERVAL '1 hour'))) / 144
  );
  
  -- Freshness score (10 points, recent ping = higher)
  v_freshness_score := CASE
    WHEN v_driver.last_active_at > now() - INTERVAL '30 seconds' THEN 10
    WHEN v_driver.last_active_at > now() - INTERVAL '1 minute' THEN 7
    WHEN v_driver.last_active_at > now() - INTERVAL '2 minutes' THEN 4
    ELSE 0
  END;
  
  v_total_score := v_distance_score + v_rating_score + v_fairness_score + v_freshness_score;
  
  RETURN ROUND(v_total_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Real-time Subscriptions

```typescript
// Zone surge updates (poll every 30 seconds via RPC)
const { data: multipliers } = useQuery({
  queryKey: ['zone-surge', regionIds],
  queryFn: () => Promise.all(regionIds.map(id => 
    supabase.rpc('get_zone_surge_multiplier', { p_region_id: id })
  )),
  refetchInterval: 30000
});

// Driver queue changes
supabase
  .channel('driver-queue')
  .on('postgres_changes', { event: '*', table: 'driver_queue' }, 
    handleQueueChange)
  .subscribe();

// Zone driver online/offline
supabase
  .channel('zone-drivers')
  .on('postgres_changes', { event: 'UPDATE', table: 'drivers', 
    filter: `region_id=eq.${selectedZoneId}` }, 
    handleDriverChange)
  .subscribe();
```

---

## Sidebar Updates

Add to `DispatchSidebar.tsx`:

```typescript
{
  label: "Zones",
  path: "/dispatch/zones",
  icon: MapPin,
},
{
  label: "Surge",
  path: "/dispatch/surge",
  icon: TrendingUp,
},
{
  label: "Queue",
  path: "/dispatch/queue",
  icon: Users,
},
```

Position after "Drivers" section.

---

## Implementation Order

1. **Database migration** - Add tables, columns, functions, indexes
2. **useZoneDispatch hook** - Zone-aware data fetching
3. **useZoneSurge hook** - Surge multiplier hooks
4. **useDriverQueue hook** - Queue management hooks
5. **ZoneSurgeCard component** - Real-time surge display
6. **DispatchZones page** - Zone list
7. **DispatchZoneDetail page** - Zone management
8. **DispatchSurge page** - Surge rules UI
9. **DriverQueueList component** - Ranked driver list
10. **DispatchQueue page** - Queue visualization
11. **auto-dispatch-v2 edge function** - Enhanced dispatch
12. **Update sidebar + routes** - Navigation
13. **Integration testing** - End-to-end verification

---

## Feature Flags

Add to `region_settings.config` or create `dispatch_settings` table:

| Flag | Default | Description |
|------|---------|-------------|
| `use_v2_dispatch` | `false` | Enable zone-aware scoring dispatch |
| `surge_enabled` | `true` | Enable dynamic surge pricing |
| `queue_fairness_enabled` | `true` | Include fairness in scoring |
| `auto_zone_detection` | `true` | Auto-assign zone from coordinates |

---

## Testing Checklist

- [ ] Restaurants can be assigned to zones
- [ ] Drivers appear in correct zone when online
- [ ] Orders are assigned to zone based on restaurant
- [ ] Surge multiplier calculates correctly
- [ ] Manual override supersedes rules
- [ ] Override expires correctly
- [ ] Driver scoring produces expected rankings
- [ ] V2 dispatch assigns highest scorer
- [ ] Fairness score increases over time
- [ ] Queue updates in real-time
- [ ] Zone statistics are accurate
- [ ] RLS blocks unauthorized access
- [ ] Notifications fire on surge changes
