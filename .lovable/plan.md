
# Standardize Eats Order Flow & Reliability

## Current State Analysis

### Database Schema
- **`food_orders.status`** uses `booking_status` enum with values: `pending`, `confirmed`, `in_progress`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`, `refunded`
- **`order_events`** table already exists with: `id`, `order_id`, `trip_id`, `actor_id`, `type`, `data`, `created_at`

### Status Inconsistencies Found
| Location | Status Values Used |
|----------|-------------------|
| `StatusTimeline.tsx` | `pending`, `confirmed`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `delivered` |
| `useOrderMutations.ts` | `confirmed`, `pending`, `in_progress`, `completed`, `cancelled` |
| `useCrossAppRealtime.ts` | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` |
| `RealtimeOrderToasts.tsx` | `confirmed`, `in_progress`, `completed`, `cancelled` |
| Database enum | `pending`, `confirmed`, `in_progress`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`, `refunded` |

### Problems
1. **Inconsistent naming**: `delivered` vs `completed`, `preparing` vs `in_progress`
2. **No transition validation**: Any status can be set without checking if allowed
3. **No audit logging**: Status changes not logged to `order_events`
4. **No completed order lock**: Delivered/cancelled orders can still be modified
5. **No reconnection handling**: Realtime drops not recovered

---

## Implementation Plan

### 1. Create Order Status Constants (`/lib/orderStatus.ts`)

Single source of truth for all order status logic across all apps:

```typescript
// Standard Eats order statuses (use these exact strings everywhere)
export const EatsOrderStatus = {
  PLACED: "placed",
  CONFIRMED: "confirmed", 
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type EatsOrderStatusType = typeof EatsOrderStatus[keyof typeof EatsOrderStatus];

// Actor roles for audit trail
export const ActorRole = {
  CUSTOMER: "customer",
  MERCHANT: "merchant", 
  DRIVER: "driver",
  SYSTEM: "system",
  ADMIN: "admin",
} as const;

// Allowed status transitions by role
const MERCHANT_TRANSITIONS: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery"], // When driver picks up
};

const DRIVER_TRANSITIONS: Record<string, string[]> = {
  ready: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

// Validation functions
export function canMerchantUpdateStatus(current: string, next: string): boolean;
export function canDriverUpdateStatus(current: string, next: string): boolean;
export function getNextStatusOptions(role: ActorRole, status: string): string[];
export function isOrderLocked(status: string): boolean;
export function getStatusLabel(status: string): string;
export function getStatusTimestampField(status: string): string;
```

### 2. Update Database Enum

The current `booking_status` enum needs to be extended to include `placed`, `preparing`, `ready`, `delivered`:

```sql
-- Add missing enum values
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'placed';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'delivered';
```

### 3. Add `actor_role` Column to `order_events`

Enhance the existing table:

```sql
ALTER TABLE order_events 
ADD COLUMN IF NOT EXISTS actor_role TEXT DEFAULT 'system';
```

### 4. Create Validated Order Update Hook

New hook that enforces transition rules and logs events:

**File: `src/hooks/useEatsOrderMutations.ts`**

```typescript
export function useUpdateEatsOrderStatus() {
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      newStatus, 
      actorRole, 
      actorId 
    }: UpdateParams) => {
      // 1. Fetch current order status
      const { data: order } = await supabase
        .from("food_orders")
        .select("status")
        .eq("id", orderId)
        .single();
      
      // 2. Check if order is locked
      if (isOrderLocked(order.status)) {
        throw new Error("Cannot modify completed or cancelled orders");
      }
      
      // 3. Validate transition based on role
      const canTransition = actorRole === "merchant" 
        ? canMerchantUpdateStatus(order.status, newStatus)
        : canDriverUpdateStatus(order.status, newStatus);
      
      if (!canTransition) {
        throw new Error(`Invalid status transition: ${order.status} → ${newStatus}`);
      }
      
      // 4. Build update with correct timestamp
      const timestampField = getStatusTimestampField(newStatus);
      const updates = {
        status: newStatus,
        [timestampField]: new Date().toISOString(),
      };
      
      // 5. Update order
      const { error } = await supabase
        .from("food_orders")
        .update(updates)
        .eq("id", orderId);
      
      if (error) throw error;
      
      // 6. Log event to order_events
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: `status_${newStatus}`,
        actor_id: actorId,
        actor_role: actorRole,
        data: { 
          previous_status: order.status, 
          new_status: newStatus 
        },
      });
    },
    onError: (error) => {
      toast.error("Update failed", { 
        description: error.message,
        action: { label: "Retry", onClick: () => {} }
      });
    }
  });
}
```

### 5. Create Database Trigger for Event Logging

Automatic event logging as backup (in case app doesn't log):

```sql
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_events (order_id, type, actor_role, data)
    VALUES (
      NEW.id,
      'status_' || NEW.status,
      COALESCE(current_setting('app.actor_role', true), 'system'),
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  -- Log driver assignment
  IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
    INSERT INTO order_events (order_id, type, actor_role, data)
    VALUES (
      NEW.id,
      'driver_assigned',
      'system',
      jsonb_build_object('driver_id', NEW.driver_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_food_order_change
AFTER UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();
```

### 6. Safe Realtime Reconnection

Update `useLiveEatsOrder.ts` with reconnection logic:

```typescript
export function useLiveEatsOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<LiveEatsOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");
  
  // Refetch function for reconnection
  const refetch = useCallback(async () => {
    if (!orderId) return;
    const { data } = await supabase
      .from(EATS_TABLES.orders)
      .select("*, restaurants:restaurant_id(...)")
      .eq("id", orderId)
      .single();
    if (data) setOrder(data);
  }, [orderId]);

  useEffect(() => {
    // ... existing subscription code ...
    
    channel
      .on("system", { event: "disconnect" }, () => {
        setConnectionStatus("disconnected");
        // Auto-reconnect with fresh data
        setTimeout(() => {
          refetch();
          channel.subscribe();
        }, 2000);
      })
      .subscribe((status) => {
        setConnectionStatus(status === "SUBSCRIBED" ? "connected" : "disconnected");
      });
  }, [orderId, refetch]);

  return { order, loading, error, connectionStatus, refetch };
}
```

### 7. Update All Status References

**Files to update:**

| File | Changes |
|------|---------|
| `StatusTimeline.tsx` | Use `EatsOrderStatus` constants, map DB values |
| `useOrderMutations.ts` | Use new `useUpdateEatsOrderStatus` |
| `useCrossAppRealtime.ts` | Update status type to `EatsOrderStatusType` |
| `RealtimeOrderToasts.tsx` | Use `EatsOrderStatus` for switch cases |
| `EatsOrderDetail.tsx` | Use `getStatusLabel()` for display |

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/orderStatus.ts` | Status constants, transitions, validation helpers |
| `src/hooks/useEatsOrderMutations.ts` | Validated order update mutation with event logging |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/eats/StatusTimeline.tsx` | Import from `orderStatus.ts`, use standard constants |
| `src/hooks/useLiveEatsOrder.ts` | Add reconnection handling, connection status |
| `src/hooks/useOrderMutations.ts` | Use central validation, log to `order_events` |
| `src/hooks/useCrossAppRealtime.ts` | Use `EatsOrderStatus` type |
| `src/components/dispatch/RealtimeOrderToasts.tsx` | Use standard status constants |
| `src/lib/eatsTables.ts` | Add `orderEvents` table reference |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Add enum values | Add `placed`, `preparing`, `ready`, `delivered` to `booking_status` |
| Add `actor_role` column | Extend `order_events` table |
| Create trigger | Auto-log status changes to `order_events` |

---

## Validation Flow Diagram

```text
Order Status Update Request
          │
          ▼
┌─────────────────────────┐
│ 1. Fetch current status │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. Check if locked      │──▶ REJECT if delivered/cancelled
│    (delivered/cancelled)│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. Validate transition  │──▶ REJECT if not allowed for role
│    by role              │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Update with timestamp│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Log to order_events  │
└───────────┬─────────────┘
            │
            ▼
         SUCCESS
```

---

## Status Transition Rules

### Merchant (Restaurant) Can:
| From | To |
|------|----|
| placed | confirmed, cancelled |
| confirmed | preparing, cancelled |
| preparing | ready, cancelled |

### Driver Can:
| From | To |
|------|----|
| ready | out_for_delivery |
| out_for_delivery | delivered |

### Locked States (No Changes Allowed):
- `delivered`
- `cancelled`

---

## Summary

This update standardizes the Eats order flow with:

1. **Single Source of Truth**: `orderStatus.ts` with exact status enum and labels
2. **Central Validation**: `canMerchantUpdateStatus()` and `canDriverUpdateStatus()` functions
3. **Audit Trail**: Every status change logged to `order_events` with actor info
4. **Double-Update Prevention**: Fetch-then-validate pattern before any update
5. **Locked Orders**: Delivered and cancelled orders cannot be modified
6. **Safe Reconnection**: Realtime drops trigger refetch and resubscribe
7. **Error Handling**: Clear error messages with retry options

All apps (customer, merchant, driver, dispatch) will import from `orderStatus.ts` to ensure consistency.
