
# Customer Order Tracking Enhancement — Driver Display, Live Map & Timestamps

## Overview
Enhance the `/eats/orders/[id]` page with real-time driver tracking, live map display, timeline timestamps, and automated order status notifications.

---

## Current State Analysis

### Already Implemented
| Feature | Status | Location |
|---------|--------|----------|
| Order realtime subscription | ✅ Working | `useLiveEatsOrder.ts` |
| Driver fetching hook | ✅ Working | `useEatsDriver.ts` — fetches from `drivers` table |
| Delivery map component | ✅ Exists | `DeliveryMap.tsx` — shows driver + destination markers |
| Status timeline | ⚠️ Partial | `StatusTimeline.tsx` — no timestamps shown |
| Order detail page | ✅ Exists | `EatsOrderDetail.tsx` — missing driver card |
| Notifications table | ✅ Exists | Has `order_id`, `user_id`, `title`, `body`, etc. |
| Eats alerts hook | ✅ Working | `useEatsAlerts.ts` — realtime subscription |

### Database Schema Findings

**`food_orders` Table — Has Timestamps:**
```text
- placed_at           (when order was placed)
- accepted_at         (when restaurant confirmed)
- prepared_at         (when food was ready)
- picked_up_at        (when driver picked up)
- delivered_at        (when delivered)
- ready_at            (ready for pickup)
- assigned_at         (driver assigned)
- cancelled_at
```

**`drivers` Table:**
```text
- id, full_name, phone, avatar_url, rating
- current_lat, current_lng (live location)
- vehicle_type, vehicle_model, vehicle_plate
```

**No `driver_locations` table exists** — Driver location is stored directly in `drivers.current_lat/lng`

---

## Implementation Details

### 1. Extend LiveEatsOrder Interface with Timestamps

Update `useLiveEatsOrder.ts` to fetch all timestamp columns for the timeline.

**File to Modify:**
- `src/hooks/useLiveEatsOrder.ts`

**Add Fields:**
```typescript
interface LiveEatsOrder {
  // ... existing fields ...
  placed_at: string | null;
  accepted_at: string | null;
  prepared_at: string | null;
  ready_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  assigned_at: string | null;
}
```

### 2. Create Driver Info Card Component

Create a reusable card to display assigned driver info (similar to ride tracking).

**File to Create:**
- `src/components/eats/DriverInfoCard.tsx`

**Features:**
- Driver avatar, name, rating
- Vehicle type/model
- Phone button to call driver
- Animated "arriving" indicator when out for delivery

**Props:**
```typescript
interface DriverInfoCardProps {
  driver: EatsDriver;
  isDelivering: boolean;
  onCall?: () => void;
}
```

### 3. Enhance StatusTimeline with Timestamps

Update the timeline to show actual timestamps for each completed step.

**File to Modify:**
- `src/components/eats/StatusTimeline.tsx`

**Add Props:**
```typescript
interface StatusTimelineProps {
  currentStatus: string;
  timestamps?: {
    placed_at?: string | null;
    accepted_at?: string | null;
    prepared_at?: string | null;
    ready_at?: string | null;
    picked_up_at?: string | null;
    delivered_at?: string | null;
  };
  className?: string;
}
```

**Display:**
```text
✓ Order Placed         10:32 AM
✓ Confirmed           10:35 AM
● Preparing           In progress...
○ On the Way
○ Delivered
```

### 4. Integrate Driver + Map into Order Detail

Update `EatsOrderDetail.tsx` to:
- Fetch driver info when `driver_id` exists
- Show `DriverInfoCard` component
- Show `DeliveryMap` with live driver location
- Subscribe to driver location updates

**File to Modify:**
- `src/pages/EatsOrderDetail.tsx`

**Logic:**
```typescript
// Fetch driver when assigned
const { driver } = useEatsDriver(order?.driver_id);

// Show map when order is out for delivery
const showMap = ["confirmed", "ready_for_pickup", "out_for_delivery"].includes(order.status);
```

### 5. Create Order Status Alert Trigger

Create a database trigger to automatically insert notifications when order status changes.

**Database Migration — Create Trigger:**
```sql
-- Function to create notification on order status change
CREATE OR REPLACE FUNCTION notify_customer_order_status()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  action_link TEXT;
BEGIN
  -- Only notify on specific status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    action_link := '/eats/orders/' || NEW.id;
    
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Order Confirmed';
        notification_body := 'Your order has been accepted and is being prepared';
      WHEN 'preparing' THEN
        notification_title := 'Preparing Your Order';
        notification_body := 'The restaurant is now preparing your food';
      WHEN 'ready_for_pickup' THEN
        notification_title := 'Order Ready';
        notification_body := 'Your order is ready and waiting for pickup';
      WHEN 'out_for_delivery' THEN
        notification_title := 'Driver On The Way';
        notification_body := 'Your order is on its way to you!';
      WHEN 'delivered' THEN
        notification_title := 'Order Delivered';
        notification_body := 'Enjoy your meal! Rate your experience';
        action_link := '/eats/orders/' || NEW.id || '?rate=true';
      ELSE
        RETURN NEW;
    END CASE;
    
    -- Insert in-app notification
    INSERT INTO notifications (
      user_id, order_id, channel, category, template,
      title, body, action_url, status, metadata
    ) VALUES (
      NEW.customer_id,
      NEW.id,
      'in_app',
      'transactional',
      'order_status_update',
      notification_title,
      notification_body,
      action_link,
      'sent',
      jsonb_build_object('status', NEW.status, 'type', 'eats')
    );
    
    -- Also notify when driver is assigned
    IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id, order_id, channel, category, template,
        title, body, action_url, status, metadata
      ) VALUES (
        NEW.customer_id,
        NEW.id,
        'in_app',
        'transactional',
        'driver_assigned',
        'Driver Assigned',
        'A driver has been assigned to your order',
        '/eats/orders/' || NEW.id,
        'sent',
        jsonb_build_object('driver_id', NEW.driver_id, 'type', 'eats')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_food_order_status_change ON food_orders;
CREATE TRIGGER on_food_order_status_change
  AFTER UPDATE ON food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_customer_order_status();
```

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/eats/DriverInfoCard.tsx` | Driver display card with avatar, info, call button |

### Modified Files
| File | Changes |
|------|---------|
| `src/hooks/useLiveEatsOrder.ts` | Add timestamp fields to interface and select |
| `src/components/eats/StatusTimeline.tsx` | Add timestamp prop, display times for completed steps |
| `src/pages/EatsOrderDetail.tsx` | Integrate useEatsDriver, show DriverInfoCard + DeliveryMap |

### Database Migration
| Change | Purpose |
|--------|---------|
| `notify_customer_order_status()` function | Auto-create notifications on status change |
| `on_food_order_status_change` trigger | Fire function after order updates |

---

## UI Layout

### Order Detail Page (Enhanced)
```text
+----------------------------------+
| [← Back]  Order Details  [?]     |
+----------------------------------+
| [Live Status Banner]             |
| "Driver is on the way!"          |
+----------------------------------+
|                                  |
|        [LIVE MAP]                |
|    Driver ▸         📍 You       |
|    "3 min away"                  |
|                                  |
+----------------------------------+
| Driver Info Card                 |
| +------------------------------+ |
| | 👤 John D.    ★ 4.9    📞    | |
| | Toyota Prius • ABC-1234      | |
| +------------------------------+ |
+----------------------------------+
| Order Status                     |
| ✓ Placed          10:32 AM      |
| ✓ Confirmed       10:35 AM      |
| ✓ Preparing       10:40 AM      |
| ● On the Way      10:55 AM      |
| ○ Delivered                      |
+----------------------------------+
| Restaurant Info                  |
| ...                              |
+----------------------------------+
| Items Ordered                    |
| ...                              |
+----------------------------------+
```

---

## Data Flow

```text
Order Status Change (Merchant/Driver App)
    │
    ▼
food_orders UPDATE
    │
    ├──▶ Trigger: notify_customer_order_status()
    │       └──▶ INSERT into notifications
    │               └──▶ Realtime push to customer app
    │                       └──▶ useEatsAlerts() catches new alert
    │                              └──▶ Toast notification + badge
    │
    └──▶ Realtime: useLiveEatsOrder() catches update
            └──▶ UI updates status banner + timeline

Driver Location Update
    │
    ▼
drivers UPDATE (current_lat, current_lng)
    │
    └──▶ Realtime: useEatsDriver() catches update
            └──▶ DeliveryMap marker moves
```

---

## Implementation Order

1. **Update `useLiveEatsOrder.ts`** — Add timestamp fields
2. **Update `StatusTimeline.tsx`** — Add timestamp display
3. **Create `DriverInfoCard.tsx`** — Driver display component
4. **Update `EatsOrderDetail.tsx`** — Integrate driver card + map
5. **Create database trigger** — Auto-notify on status changes

---

## Technical Notes

### Driver Location Source
- Location stored in `drivers.current_lat` and `drivers.current_lng`
- `useEatsDriver` hook already subscribes to realtime updates
- `DeliveryMap` component already handles driver markers

### Timestamp Mapping
| Status | Timestamp Column |
|--------|------------------|
| placed | `placed_at` or `created_at` |
| confirmed | `accepted_at` |
| preparing | `prepared_at` |
| ready | `ready_at` |
| out_for_delivery | `picked_up_at` |
| delivered | `delivered_at` |

### Map Display Conditions
Show map when:
- `order.status` is `confirmed`, `ready_for_pickup`, or `out_for_delivery`
- `order.driver_id` is not null
- `order.delivery_lat` and `order.delivery_lng` are set

---

## Summary

This update enhances order tracking with:

- **Driver Card**: Shows assigned driver info (photo, name, vehicle, rating, call button)
- **Live Map**: Real-time driver location on map with destination marker
- **Timestamped Timeline**: Each status step shows when it happened
- **Automatic Alerts**: Database trigger creates notifications on status changes (driver assigned, picked up, delivered)
- **Real-time Updates**: All changes sync instantly via Supabase Realtime
