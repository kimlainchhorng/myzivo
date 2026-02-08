
# Smart Dispatch System for Eats Deliveries

## Overview
Implement an automatic driver dispatch system that assigns the best available driver to food orders when they become ready, using distance-based prioritization, driver load management, and ETA calculations.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `drivers` table | ✅ Complete | Has `is_online`, `current_lat`, `current_lng`, `eats_enabled`, `last_active_at`, `status` |
| `food_orders` table | ✅ Complete | Has `driver_id`, `assigned_at`, `eta_pickup`, `eta_dropoff`, `eta_minutes`, `needs_driver` |
| `order_offers` table | ✅ Exists | Track offers sent to drivers (status, expires_at, distance_miles) |
| `auto-dispatch` edge function | ✅ Exists | For rides/trips — can adapt for Eats |
| `manual-dispatch` edge function | ✅ Exists | Admin manual assignment with distance calc |
| `send-driver-notification` | ✅ Exists | Push notifications to drivers |
| Haversine distance calculation | ✅ Exists | In both dispatch functions |
| Driver location updates | ✅ Exists | 15-20 second interval via `update-driver-location` |
| `useDispatchDrivers` hook | ✅ Exists | Fetches drivers with realtime updates |
| `useDispatchOrders` hook | ✅ Exists | Fetches orders with realtime updates |
| Driver online toggle | ✅ Exists | `useToggleDriverOnline` mutation |

### Missing
| Feature | Status |
|---------|--------|
| Eats-specific auto-dispatch function | ❌ Need `eats-auto-dispatch` edge function |
| Active order count check | ❌ `max_active_orders` logic not implemented |
| Dispatch trigger on "ready" status | ❌ No database trigger or webhook |
| ETA calculation service | ❌ Need `eta_pickup_minutes`, `eta_delivery_minutes` calculation |
| Driver rejection/offline fallback | ❌ Re-dispatch logic not implemented |
| Customer ETA display | ❌ Not shown in `EatsOrderDetail` |
| Driver new order notification (Eats) | ❌ Driver app doesn't receive Eats order alerts |
| Merchant driver assignment display | ❌ Merchant dashboard doesn't show assigned driver |

---

## Implementation Plan

### A) Create `eats-auto-dispatch` Edge Function

A new edge function specifically for Eats order dispatch.

**File to Create:** `supabase/functions/eats-auto-dispatch/index.ts`

**Logic Flow:**
```text
1. Receive order_id (triggered when order becomes "ready")
2. Validate order:
   - status = "ready_for_pickup" AND driver_id IS NULL
   - needs_driver = true (for delivery orders)
3. Fetch restaurant location (lat, lng from restaurants table)
4. Find eligible drivers:
   - is_online = true
   - eats_enabled = true (or not false)
   - is_suspended = false
   - status = "verified"
   - current_lat/lng NOT NULL
   - Active order count < max_active_orders (default: 2)
5. Sort by distance to restaurant (Haversine)
6. Either:
   a) Direct assign closest driver, OR
   b) Send offers to top 3 drivers
7. Update order:
   - driver_id
   - assigned_at
   - status = "out_for_delivery" (or "assigned")
   - eta_pickup, eta_dropoff, eta_minutes
8. Send push notification to assigned driver
9. Log dispatch event in order_status_events
```

**Key Algorithm:**
```typescript
// Haversine formula (existing)
function calculateDistance(lat1, lng1, lat2, lng2): number

// Eligibility filter
const eligibleDrivers = drivers.filter(d => 
  d.is_online && 
  d.eats_enabled !== false &&
  !d.is_suspended &&
  d.status === "verified" &&
  d.current_lat && d.current_lng &&
  d.active_order_count < MAX_ACTIVE_ORDERS
);

// ETA calculation (MVP: 2 min/km average)
const etaPickupMinutes = Math.ceil(distanceToRestaurant * 2);
const etaDeliveryMinutes = Math.ceil(distanceToCustomer * 2);
const totalEtaMinutes = etaPickupMinutes + etaDeliveryMinutes;
```

### B) Create Database Trigger for Auto-Dispatch

A PostgreSQL trigger that fires when order status changes to "ready_for_pickup".

**Migration to Create:**
```sql
-- Function to call edge function
CREATE OR REPLACE FUNCTION trigger_eats_auto_dispatch()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to ready_for_pickup and no driver assigned
  IF NEW.status = 'ready_for_pickup' 
     AND OLD.status != 'ready_for_pickup'
     AND NEW.driver_id IS NULL 
     AND NEW.needs_driver = true THEN
    -- Use pg_net to call edge function asynchronously
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/eats-auto-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('order_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on food_orders
CREATE TRIGGER trg_eats_auto_dispatch
AFTER UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_eats_auto_dispatch();
```

### C) Add Driver Load Check (Active Orders Query)

To prevent overloading drivers, check their current active order count.

**Query in eats-auto-dispatch:**
```sql
SELECT d.*, 
  (SELECT COUNT(*) FROM food_orders 
   WHERE driver_id = d.id 
   AND status IN ('confirmed', 'ready_for_pickup', 'in_progress')
  ) as active_order_count
FROM drivers d
WHERE d.is_online = true
  AND d.eats_enabled != false
  AND d.is_suspended != true
  AND d.status = 'verified'
  AND d.current_lat IS NOT NULL
  AND d.current_lng IS NOT NULL
```

**Configurable constant:**
```typescript
const MAX_ACTIVE_ORDERS = 2; // Can be per-driver or global config
```

### D) Create Offer-Based Dispatch (Optional Mode)

Instead of direct assignment, send offers to top N drivers.

**File to Modify:** Add offer mode to `eats-auto-dispatch`

**Logic:**
```typescript
if (dispatchMode === 'offer') {
  const topDrivers = sortedDrivers.slice(0, 3);
  
  // Create offers with expiration
  const offers = topDrivers.map(driver => ({
    order_id: orderId,
    driver_id: driver.id,
    distance_miles: driver.distance_km / 1.60934,
    status: 'pending',
    expires_at: new Date(Date.now() + 60 * 1000).toISOString(), // 60 sec
  }));
  
  await supabase.from('order_offers').insert(offers);
  
  // Send push to each driver
  for (const driver of topDrivers) {
    await sendDriverNotification(driver.id, ...);
  }
}
```

### E) Driver Accept/Reject Offer Hook

**File to Create:** `src/hooks/useDriverOffers.ts`

```typescript
export function useDriverOffers(driverId: string | undefined) {
  // Query pending offers for this driver
  const offers = useQuery(...)
  
  // Accept offer mutation
  const acceptOffer = useMutation(...)
  
  // Reject offer mutation
  const rejectOffer = useMutation(...)
  
  return { offers, acceptOffer, rejectOffer };
}
```

### F) Re-dispatch on Driver Rejection/Offline

**Logic in eats-auto-dispatch:**
```typescript
// When driver goes offline or rejects
async function handleDriverRejection(orderId: string) {
  // Clear driver assignment
  await supabase
    .from('food_orders')
    .update({
      driver_id: null,
      assigned_at: null,
      status: 'ready_for_pickup'
    })
    .eq('id', orderId);
  
  // Re-run dispatch
  await triggerAutoDispatch(orderId);
}
```

### G) ETA Display in Customer Order Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

Add ETA display section:
```typescript
// After driver assignment
{order.driver_id && order.eta_minutes && (
  <motion.div className="...">
    <div className="flex items-center gap-3">
      <Clock className="w-5 h-5 text-orange-500" />
      <div>
        <p className="font-bold text-lg">{order.eta_minutes} min</p>
        <p className="text-xs text-zinc-500">Estimated delivery time</p>
      </div>
    </div>
  </motion.div>
)}

// Show "Driver assigned automatically" message
{order.driver_id && order.assigned_at && (
  <p className="text-xs text-emerald-400">
    Driver assigned automatically
  </p>
)}
```

### H) Driver App Updates

**File to Modify:** `src/pages/driver/DriverHomePage.tsx`

Add Eats order section:
```typescript
// Fetch active Eats orders for this driver
const { data: eatsOrders } = useQuery({
  queryKey: ['driver-eats-orders', driverId],
  queryFn: async () => {
    const { data } = await supabase
      .from('food_orders')
      .select('*, restaurants:restaurant_id(name, address, lat, lng)')
      .eq('driver_id', driverId)
      .in('status', ['confirmed', 'ready_for_pickup', 'in_progress'])
      .order('created_at', { ascending: true });
    return data;
  },
  enabled: !!driverId,
  refetchInterval: 30000,
});

// Display active Eats deliveries
{eatsOrders?.map(order => (
  <EatsOrderCard 
    key={order.id} 
    order={order}
    onStatusUpdate={handleStatusUpdate}
  />
))}
```

**New Component:** `src/components/driver/EatsOrderCard.tsx`
- Show pickup address (restaurant)
- Show delivery address
- Show payout amount
- Action buttons: Navigate, Picked Up, Delivered

### I) Merchant Dashboard Driver Display

Add assigned driver info to merchant order view.

**File to Modify:** Merchant app (separate project) or dispatch panel

In dispatch panel (`src/components/dispatch/OrderCard.tsx`):
```typescript
// Already shows driver badge - enhance with ETA
{order.driver && (
  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="flex items-center gap-1">
      <User className="h-3 w-3" />
      {order.driver.full_name}
    </Badge>
    {order.eta_minutes && (
      <span className="text-xs text-zinc-500">
        ETA: {order.eta_minutes} min
      </span>
    )}
  </div>
)}
```

### J) Create Scheduled Dispatch Worker

Edge function that runs periodically to catch any unassigned ready orders.

**File to Create:** `supabase/functions/eats-dispatch-worker/index.ts`

```typescript
// Runs every 30-60 seconds via cron
serve(async (req) => {
  // Find unassigned ready orders
  const { data: unassignedOrders } = await supabase
    .from('food_orders')
    .select('id')
    .eq('status', 'ready_for_pickup')
    .is('driver_id', null)
    .eq('needs_driver', true)
    .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());
  
  // Dispatch each
  for (const order of unassignedOrders || []) {
    await dispatchOrder(order.id);
  }
});
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/eats-auto-dispatch/index.ts` | Main auto-dispatch logic for Eats orders |
| `supabase/functions/eats-dispatch-worker/index.ts` | Scheduled worker for missed dispatches |
| `src/hooks/useDriverOffers.ts` | Driver offer accept/reject mutations |
| `src/hooks/useDriverEatsOrders.ts` | Fetch active Eats orders for driver |
| `src/components/driver/EatsOrderCard.tsx` | Driver view of Eats order with actions |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Add ETA display and "Driver assigned automatically" message |
| `src/pages/driver/DriverHomePage.tsx` | Add Eats orders section |
| `src/components/dispatch/OrderCard.tsx` | Add ETA display next to driver badge |
| `src/hooks/useLiveEatsOrder.ts` | Add `eta_pickup`, `eta_dropoff`, `eta_minutes` to interface |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Add trigger `trg_eats_auto_dispatch` | Auto-dispatch on status = ready_for_pickup |
| Add function `trigger_eats_auto_dispatch()` | Calls edge function via pg_net |

---

## ETA Calculation Logic (MVP)

Simple distance-based estimation:

```typescript
// Constants
const AVG_SPEED_KM_PER_MIN = 0.5; // ~30 km/h in city traffic

// Calculation
function calculateETA(
  driverLat: number, driverLng: number,
  restaurantLat: number, restaurantLng: number,
  customerLat: number, customerLng: number
) {
  const distanceToRestaurant = calculateDistance(driverLat, driverLng, restaurantLat, restaurantLng);
  const distanceToCustomer = calculateDistance(restaurantLat, restaurantLng, customerLat, customerLng);
  
  const etaPickupMinutes = Math.ceil(distanceToRestaurant / AVG_SPEED_KM_PER_MIN);
  const etaDeliveryMinutes = Math.ceil(distanceToCustomer / AVG_SPEED_KM_PER_MIN);
  
  return {
    eta_pickup: new Date(Date.now() + etaPickupMinutes * 60 * 1000).toISOString(),
    eta_dropoff: new Date(Date.now() + (etaPickupMinutes + etaDeliveryMinutes) * 60 * 1000).toISOString(),
    eta_minutes: etaPickupMinutes + etaDeliveryMinutes,
  };
}
```

---

## Dispatch Flow Diagram

```text
Merchant marks order "ready"
    ↓
Trigger fires: trg_eats_auto_dispatch
    ↓
Calls eats-auto-dispatch edge function
    ↓
Query eligible drivers:
  - is_online=true, eats_enabled=true
  - status=verified, not suspended
  - active_orders < max_active_orders
    ↓
Calculate distance to restaurant for each
    ↓
Sort by distance (nearest first)
    ↓
┌─────────────────────────────────────┐
│ Dispatch Mode                       │
├─────────────────────────────────────┤
│ DIRECT: Assign nearest driver       │
│ OFFER: Send offers to top 3         │
└─────────────────────────────────────┘
    ↓
Update food_orders:
  - driver_id
  - assigned_at = now()
  - status = "out_for_delivery"
  - eta_pickup, eta_dropoff, eta_minutes
    ↓
Send push notification to driver
    ↓
Log event to order_status_events
    ↓
Customer sees: "Driver assigned automatically"
               "ETA: X minutes"
```

---

## Safety: Driver Rejection/Offline Handling

```text
Driver goes offline OR rejects order
    ↓
Check: is order.driver_id = this driver?
    ↓
Yes → Update order:
  - driver_id = NULL
  - assigned_at = NULL
  - status = "ready_for_pickup"
    ↓
Trigger fires again → re-dispatch
    ↓
Exclude this driver from candidates
    ↓
Assign next best driver
```

---

## Summary

This implementation adds:

1. **eats-auto-dispatch Edge Function**: Core dispatch logic with distance sorting, load checking, ETA calculation
2. **Database Trigger**: Fires on `status = 'ready_for_pickup'` to auto-dispatch
3. **ETA Calculation**: Simple distance-based estimate displayed to customer, driver, and merchant
4. **Driver Load Management**: Check active order count before assignment (max 2)
5. **Customer UX**: Show "Driver assigned automatically" and ETA in order detail
6. **Driver UX**: See assigned Eats orders with pickup/delivery actions
7. **Fallback**: Scheduled worker catches any missed orders every 30-60s
8. **Safety**: Re-dispatch if driver rejects or goes offline
