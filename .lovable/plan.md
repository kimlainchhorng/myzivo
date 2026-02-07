
# Maps + Real Distance/Time + Live Driver Location Implementation

## Summary

Add comprehensive maps integration with real-time location tracking to enable:
1. Automatic distance/duration calculation for accurate pricing
2. Live driver location updates for dispatch visibility
3. Real-time driver tracking for customer order tracking

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| Map providers | Google Maps + Mapbox both configured |
| Edge functions | `maps-autocomplete`, `maps-place-details`, `maps-route`, `update-driver-location` exist |
| `trips` table | Has `pickup_lat/lng`, `dropoff_lat/lng`, `distance_miles`, `duration_minutes` |
| `food_orders` table | Has `delivery_lat/lng`, `distance_miles` but missing `pickup_lat/lng` and `duration_minutes` |
| `drivers` table | Has `current_lat/lng`, `updated_at` |
| Live map | `LiveMapOverview` exists for admin with Mapbox |
| Address autocomplete | `useServerGeocode` hook + edge functions exist |
| Secrets | `GOOGLE_MAPS_API_KEY`, `MAPBOX_ACCESS_TOKEN` configured |

---

## Database Changes

### food_orders table updates

Add missing columns for pickup location and route data:

```sql
ALTER TABLE public.food_orders 
  ADD COLUMN IF NOT EXISTS pickup_lat numeric,
  ADD COLUMN IF NOT EXISTS pickup_lng numeric,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0;

COMMENT ON COLUMN public.food_orders.pickup_lat IS 'Restaurant pickup latitude';
COMMENT ON COLUMN public.food_orders.pickup_lng IS 'Restaurant pickup longitude';
COMMENT ON COLUMN public.food_orders.duration_minutes IS 'Estimated delivery duration in minutes';
```

### drivers table updates

Add `last_active_at` column for more accurate activity tracking:

```sql
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.drivers.last_active_at IS 'Last time driver sent location update';
```

---

## RLS Security Policies

### New RPC for customer tracking with driver location

```sql
-- RPC to get driver location for a specific order (customer tracking)
CREATE OR REPLACE FUNCTION public.get_order_driver_location(p_order_id uuid)
RETURNS TABLE(
  driver_id uuid,
  driver_name text,
  driver_lat numeric,
  driver_lng numeric,
  last_updated timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.full_name,
    d.current_lat,
    d.current_lng,
    d.updated_at
  FROM food_orders fo
  JOIN drivers d ON d.id = fo.driver_id
  WHERE fo.id = p_order_id
    AND fo.customer_id = auth.uid()
    AND fo.status IN ('confirmed', 'ready_for_pickup', 'in_progress');
END;
$function$;
```

---

## Implementation Details

### A. Shared Address Autocomplete Component

Create a reusable `AddressAutocomplete` component that wraps `useServerGeocode`:

**File: `src/components/shared/AddressAutocomplete.tsx`**

```text
- Uses existing useServerGeocode hook
- Shows dropdown with suggestions
- Returns selected place with coordinates
- Fallback to manual input if API fails
```

### B. Dispatch Live Map Panel

Add map to dispatch dashboard showing drivers + orders:

**File: `src/components/dispatch/DispatchLiveMap.tsx`**

```text
- Uses GoogleMap component (with dark mode)
- Subscribes to drivers table via Realtime
- Shows online drivers as pins with popup (name, last_active, active order)
- Shows selected order pickup/dropoff with route line
- "Assign to selected order" action from driver popup
- Toggle layers: drivers, orders, routes
```

**Integration points:**
- Add to `DispatchDashboard.tsx` as collapsible panel
- Add to `DispatchOrdersKanban.tsx` as side panel when order selected

### C. Enhanced Driver Location Updates

Modify existing `update-driver-location` edge function to also update `last_active_at`:

**File: `supabase/functions/update-driver-location/index.ts`**

```text
Current: Updates current_lat, current_lng, updated_at
Add: Update last_active_at to now()
```

### D. Driver Location Watcher Hook

Create hook for driver app to broadcast location:

**File: `src/hooks/useDriverLocationBroadcast.ts`**

```text
- Watches geolocation when driver is online
- Sends updates to update-driver-location edge function every 10-20s
- Also triggers on significant movement (>50m)
- Handles permission errors gracefully
- Exposes "Refresh location" trigger
```

### E. Customer Order Tracking Page

Create customer tracking view with live driver map:

**File: `src/pages/track/OrderTrackingPage.tsx`**

```text
- Route: /track/:orderId
- Shows order status timeline
- Map with pickup, dropoff, and driver pins
- Real-time subscription to:
  - Order status changes
  - Driver location (via RPC get_order_driver_location)
- Driver moving animation along route
```

### F. Calculate Route on Order Creation

Update order creation flow to auto-calculate distance/duration:

**File: Merchant order creation flow**

```text
When creating order:
1. Use AddressAutocomplete for pickup (restaurant) and delivery
2. Call maps-route edge function to get distance_miles, duration_minutes
3. Store pickup_lat/lng, delivery_lat/lng, distance_miles, duration_minutes
4. Use calculate-price RPC with real distance/duration
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/shared/AddressAutocomplete.tsx` | Create | Reusable address autocomplete with coords |
| `src/components/dispatch/DispatchLiveMap.tsx` | Create | Live map for dispatch with drivers/orders |
| `src/pages/dispatch/DispatchDashboard.tsx` | Modify | Add DispatchLiveMap panel |
| `src/hooks/useDriverLocationBroadcast.ts` | Create | Hook for driver location updates |
| `src/hooks/useDispatchDrivers.ts` | Modify | Add realtime subscription + last_active_at |
| `src/pages/track/OrderTrackingPage.tsx` | Create | Customer order tracking with live driver |
| `src/hooks/useOrderTracking.ts` | Create | Hook for order tracking + driver location |
| `supabase/functions/update-driver-location/index.ts` | Modify | Add last_active_at update |
| Database migration | Create | Add columns to food_orders, drivers |
| RLS migration | Create | Add get_order_driver_location RPC |

---

## Detailed Component Specifications

### AddressAutocomplete Component

```typescript
interface AddressAutocompleteProps {
  placeholder?: string;
  value?: string;
  onSelect: (place: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  proximity?: { lat: number; lng: number };
  disabled?: boolean;
}
```

Features:
- Debounced input (300ms)
- Loading spinner during fetch
- Error state with retry
- Clear button
- Keyboard navigation (arrow keys, enter)
- Falls back to mock data if API unavailable

### DispatchLiveMap Component

```typescript
interface DispatchLiveMapProps {
  selectedOrderId?: string;
  onDriverClick?: (driverId: string) => void;
  onAssignDriver?: (driverId: string, orderId: string) => void;
  className?: string;
}
```

Features:
- GoogleMap with dark mode styling
- Driver markers (green online, gray offline)
- Order markers (blue pickup, red dropoff)
- Route polyline for selected order
- Real-time driver position updates (5s interval)
- Driver popup with "Assign" button
- Layer toggle controls
- Stats overlay (X drivers online, Y active orders)

### OrderTrackingPage

Features:
- Status timeline (Confirmed → Picked Up → Delivering → Delivered)
- Estimated arrival time based on duration_minutes + current position
- Map with:
  - Restaurant pickup (blue pin)
  - Customer dropoff (green pin)
  - Driver position (car icon, animated)
  - Route line
- Real-time updates via Supabase Realtime
- Driver info card (name, vehicle, rating)
- Contact driver button

---

## Real-time Subscriptions

### Dispatch Panel

```typescript
// Subscribe to driver location changes
supabase
  .channel('dispatch-driver-locations')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'drivers',
    filter: 'is_online=eq.true'
  }, handleDriverUpdate)
  .subscribe()
```

### Customer Tracking

```typescript
// Subscribe to order status changes
supabase
  .channel(`order-${orderId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'food_orders',
    filter: `id=eq.${orderId}`
  }, handleOrderUpdate)
  .subscribe()

// Poll driver location every 5s via RPC
useInterval(async () => {
  const { data } = await supabase.rpc('get_order_driver_location', { p_order_id: orderId });
  if (data?.[0]) setDriverLocation(data[0]);
}, 5000)
```

---

## Security Considerations

| Access Pattern | Control |
|----------------|---------|
| Drivers table location (dispatch) | Admin role check via existing RLS |
| Driver location for customer | Only via RPC, only for assigned order, only active status |
| Order details for customer | customer_id = auth.uid() RLS |
| Location updates from driver | Auth required, driver verified, GPS spoof detection (existing) |

---

## Fallback Behavior

| Scenario | Fallback |
|----------|----------|
| Maps API key missing | Show static map image, manual distance input |
| No GPS permission | Show error message, disable location features |
| API rate limit | Queue requests, use cached data |
| Driver location stale (>2 min) | Show "Last seen X min ago" badge |

---

## Implementation Order

1. **Database migration** - Add columns to food_orders and drivers
2. **RLS/RPC migration** - Add get_order_driver_location function
3. **AddressAutocomplete component** - Reusable address input
4. **DispatchLiveMap component** - Live map for dispatch panel
5. **Update DispatchDashboard** - Integrate map panel
6. **useDriverLocationBroadcast hook** - For driver app location updates
7. **OrderTrackingPage** - Customer tracking view
8. **useOrderTracking hook** - Order + driver location subscription
9. **Route registration** - Add /track/:orderId route

---

## Routes to Add

```tsx
<Route path="/track/:orderId" element={<OrderTrackingPage />} />
```

---

## Testing Checklist

- [ ] Dispatch map shows online drivers with correct positions
- [ ] Driver positions update in real-time when location changes
- [ ] Order pickup/dropoff markers display correctly
- [ ] Route line draws between pickup and dropoff
- [ ] "Assign driver" from map popup works
- [ ] Customer tracking page loads with order details
- [ ] Driver marker moves as location updates
- [ ] Status timeline updates in real-time
- [ ] RPC blocks access for non-owner customers
- [ ] Fallback UI shows when maps unavailable
