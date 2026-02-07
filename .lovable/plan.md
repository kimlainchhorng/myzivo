

# Notifications System Implementation Plan

## Summary

Build a comprehensive notifications system that automatically notifies Merchants, Drivers, and Customers when order status changes occur. This includes SMS/email for external notifications and in-app notifications with real-time toasts.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `notifications` table | Exists with full schema (user_id, channel, status, body, title, etc.) |
| `notification_templates` table | Exists with order-related templates |
| `notification_preferences` table | Exists for user opt-in/out |
| `driver_notifications` table | Exists for driver-specific in-app notifications |
| `send-notification` edge function | Exists with email support via Resend |
| `notifications-api` edge function | Exists for listing/marking read |
| `NotificationBell` component | Exists with real-time subscriptions |
| `useNotifications` hook | Exists with real-time updates |
| SMS (Twilio) integration | Not yet implemented |
| Order status change triggers | Not yet implemented |
| Secrets | `RESEND_API_KEY` configured; Twilio not configured |

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Order Status Change                       │
│            (INSERT/UPDATE on food_orders)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Database Trigger Function                          │
│        notify_on_order_status_change()                       │
│                                                              │
│  • Detects: order_created, assigned, picked_up,             │
│             delivered, cancelled                             │
│  • Inserts notifications for: Merchant, Driver, Customer     │
│  • Idempotent: unique constraint prevents duplicates         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              notifications table                             │
│                                                              │
│  channel: in_app  →  Immediate (RLS + realtime)             │
│  channel: email   →  Queued → process-order-notifications   │
│  channel: sms     →  Queued → process-order-notifications   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          Edge Function: process-order-notifications          │
│                                                              │
│  • Runs via admin button or scheduled                       │
│  • Fetches queued SMS/email notifications                   │
│  • Sends via Twilio (SMS) or Resend (email)                │
│  • Updates status to sent/failed                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Add tracking_code to food_orders

```sql
ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;

-- Generate tracking codes for new orders
CREATE OR REPLACE FUNCTION generate_order_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := 'ZV' || UPPER(SUBSTRING(md5(NEW.id::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_tracking_code
  BEFORE INSERT ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_tracking_code();
```

### 2. Add event_type column to notifications

```sql
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS to_value TEXT;

-- Unique constraint to prevent duplicate notifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotent
  ON public.notifications (order_id, event_type, channel, COALESCE(user_id::text, ''), COALESCE(to_value, ''))
  WHERE order_id IS NOT NULL AND event_type IS NOT NULL;
```

### 3. Create order status notification trigger

```sql
CREATE OR REPLACE FUNCTION notify_on_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_merchant_user_id UUID;
  v_driver_user_id UUID;
  v_customer_user_id UUID;
  v_customer_phone TEXT;
  v_customer_email TEXT;
  v_tracking_code TEXT;
  v_base_url TEXT := 'https://hizivo.com';
  v_title TEXT;
  v_body TEXT;
  v_action_url TEXT;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'order_created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if driver assigned
    IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
      v_event_type := 'order_assigned';
    -- Check status changes
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      CASE NEW.status
        WHEN 'in_progress' THEN v_event_type := 'order_picked_up';
        WHEN 'completed' THEN v_event_type := 'order_delivered';
        WHEN 'cancelled' THEN v_event_type := 'order_cancelled';
        ELSE v_event_type := NULL;
      END CASE;
    END IF;
  END IF;

  -- Exit if no event
  IF v_event_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Gather recipient info
  SELECT owner_id INTO v_merchant_user_id FROM restaurants WHERE id = NEW.restaurant_id;
  SELECT user_id INTO v_driver_user_id FROM drivers WHERE id = NEW.driver_id;
  v_customer_user_id := NEW.customer_id;
  v_customer_phone := NEW.customer_phone;
  v_customer_email := NEW.customer_email;
  v_tracking_code := NEW.tracking_code;

  -- Set message content per event
  CASE v_event_type
    WHEN 'order_created' THEN
      v_title := 'New Order Received';
      v_body := 'A new order has been placed. Order #' || LEFT(NEW.id::text, 8);
    WHEN 'order_assigned' THEN
      v_title := 'Driver Assigned';
      v_body := 'A driver has been assigned to your order. Track: ' || v_base_url || '/track/' || v_tracking_code;
    WHEN 'order_picked_up' THEN
      v_title := 'Order Picked Up';
      v_body := 'Your order is on the way! Track: ' || v_base_url || '/track/' || v_tracking_code;
    WHEN 'order_delivered' THEN
      v_title := 'Order Delivered';
      v_body := 'Your order has been delivered. Thanks for using ZIVO!';
    WHEN 'order_cancelled' THEN
      v_title := 'Order Cancelled';
      v_body := 'Order #' || LEFT(NEW.id::text, 8) || ' has been cancelled.';
  END CASE;

  -- Insert merchant notification (in_app)
  IF v_merchant_user_id IS NOT NULL AND v_event_type IN ('order_created', 'order_cancelled') THEN
    INSERT INTO notifications (user_id, order_id, channel, category, template, title, body, action_url, event_type, status)
    VALUES (v_merchant_user_id, NEW.id, 'in_app', 'operational', 'order_status', v_title, v_body, 
            '/merchant/orders/' || NEW.id, v_event_type, 'sent')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert driver notification (in_app)
  IF v_driver_user_id IS NOT NULL AND v_event_type IN ('order_assigned', 'order_cancelled') THEN
    INSERT INTO notifications (user_id, order_id, channel, category, template, title, body, action_url, event_type, status)
    VALUES (v_driver_user_id, NEW.id, 'in_app', 'operational', 'order_status', v_title, v_body,
            '/driver/orders/' || NEW.id, v_event_type, 'sent')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert customer in_app notification
  IF v_customer_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, order_id, channel, category, template, title, body, action_url, event_type, status)
    VALUES (v_customer_user_id, NEW.id, 'in_app', 'transactional', 'order_status', v_title, v_body,
            '/track/' || v_tracking_code, v_event_type, 'sent')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert customer SMS (queued for edge function processing)
  IF v_customer_phone IS NOT NULL AND v_customer_phone != '' THEN
    INSERT INTO notifications (user_id, order_id, channel, category, template, title, body, to_value, event_type, status)
    VALUES (v_customer_user_id, NEW.id, 'sms', 'transactional', 'order_status', v_title, v_body,
            v_customer_phone, v_event_type, 'queued')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert customer email (queued for edge function processing)
  IF v_customer_email IS NOT NULL AND v_customer_email != '' THEN
    INSERT INTO notifications (user_id, order_id, channel, category, template, title, body, to_value, action_url, event_type, status)
    VALUES (v_customer_user_id, NEW.id, 'email', 'transactional', 'order_status', v_title, v_body,
            v_customer_email, '/track/' || v_tracking_code, v_event_type, 'queued')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_order_status
  AFTER INSERT OR UPDATE ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_order_status_change();
```

---

## Edge Functions

### 1. process-order-notifications

New edge function to process queued SMS/email notifications:

```typescript
// supabase/functions/process-order-notifications/index.ts

// Fetches queued notifications (status = 'queued')
// For SMS: calls Twilio API
// For email: calls existing send-notification or Resend directly
// Updates status to 'sent' or 'failed'
// Limit 20 per invocation to avoid timeouts
```

**Key features:**
- Idempotent: checks status before processing
- Rate limited: 20 notifications per run
- Fallback: if Twilio not configured, skip SMS (log warning)
- Error handling: marks failed with error message

### 2. Update send-notification

Enhance existing function to support SMS via Twilio:

```typescript
// Add Twilio SMS sending
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

async function sendSms(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error("Twilio not configured");
  }
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_FROM_NUMBER,
        Body: body
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "SMS send failed");
  }
  
  return response.json();
}
```

---

## UI Components

### 1. MerchantNotificationBell

New component for merchant dashboard:

| File | Description |
|------|-------------|
| `src/components/merchant/MerchantNotificationBell.tsx` | Bell icon with dropdown for merchant notifications |

Uses existing `useNotifications` hook - notifications are already scoped to user_id.

### 2. DriverNotificationBell

New component for driver app:

| File | Description |
|------|-------------|
| `src/components/driver/DriverNotificationBell.tsx` | Bell icon for driver notifications |

Can reuse `NotificationBell` or query `driver_notifications` table.

### 3. OrderNotificationToasts

Enhanced realtime toasts for order changes:

| File | Description |
|------|-------------|
| `src/components/notifications/OrderNotificationToasts.tsx` | Subscribe to notifications table for real-time toasts |

```typescript
// Subscribe to new notifications for current user
supabase
  .channel('user-notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    const notif = payload.new;
    if (notif.channel === 'in_app') {
      toast.info(notif.title, { description: notif.body });
    }
  })
  .subscribe();
```

### 4. Admin Process Notifications Button

Add to dispatch settings or dashboard:

```tsx
<Button onClick={processQueuedNotifications}>
  Process Queued Notifications
</Button>
```

Calls `process-order-notifications` edge function.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/process-order-notifications/index.ts` | Create | Process queued SMS/email notifications |
| `supabase/functions/send-notification/index.ts` | Modify | Add Twilio SMS support |
| `src/components/merchant/MerchantNotificationBell.tsx` | Create | Merchant notification bell |
| `src/components/driver/DriverNotificationBell.tsx` | Create | Driver notification bell |
| `src/components/notifications/OrderNotificationToasts.tsx` | Create | Real-time toast component |
| `src/pages/dispatch/DispatchSettings.tsx` | Modify | Add "Process Notifications" button |
| `src/pages/merchant/MerchantDashboard.tsx` | Modify | Add MerchantNotificationBell |
| `src/pages/driver/DriverDashboard.tsx` | Modify | Add DriverNotificationBell |
| Database migration | Create | Add tracking_code, event_type, unique constraint, trigger |

---

## Message Templates

| Event | Merchant | Driver | Customer SMS | Customer Email |
|-------|----------|--------|--------------|----------------|
| order_created | "New order received" | - | - | - |
| order_assigned | - | "New delivery assigned" | "Driver assigned. Track: {url}" | ✓ |
| order_picked_up | - | - | "Order on the way. Track: {url}" | ✓ |
| order_delivered | - | - | "Order delivered. Thanks!" | ✓ |
| order_cancelled | "Order cancelled" | "Delivery cancelled" | "Order cancelled" | ✓ |

---

## Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | ✅ Already set | Email sending via Resend |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account ID for SMS |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_FROM_NUMBER` | Optional | Twilio sender number |
| `APP_BASE_URL` | Optional | Default: https://hizivo.com |

**Note:** SMS will be skipped if Twilio not configured (email fallback only).

---

## Security Considerations

| Access | Control |
|--------|---------|
| User's own notifications | RLS: `user_id = auth.uid()` |
| Admin view all | RLS: role check for admin/operations/support |
| Insert notifications | Trigger function with SECURITY DEFINER |
| SMS/Email sending | Edge function with service role key |
| Customer tracking | Only via `/track/:code` (no auth required) |

---

## Idempotency

The unique constraint ensures no duplicate notifications:

```sql
UNIQUE (order_id, event_type, channel, user_id, to_value)
```

This prevents:
- Multiple notifications for same status change
- Re-triggering on page refreshes or retries
- Duplicate SMS/emails if edge function runs multiple times

---

## Testing Checklist

- [ ] Order creation triggers merchant in-app notification
- [ ] Driver assignment triggers driver + customer notifications
- [ ] Pickup triggers customer SMS/email + in-app
- [ ] Delivery triggers customer notifications
- [ ] Cancellation triggers all parties
- [ ] No duplicates on rapid status changes
- [ ] Real-time toasts appear in merchant/driver dashboards
- [ ] NotificationBell shows unread count
- [ ] Mark as read works
- [ ] SMS skipped gracefully if Twilio not configured
- [ ] Email sends successfully via Resend

---

## Implementation Order

1. **Database migration** - Add columns, constraints, trigger function
2. **process-order-notifications** - New edge function for SMS/email
3. **Update send-notification** - Add Twilio SMS support
4. **Notification components** - MerchantNotificationBell, DriverNotificationBell
5. **OrderNotificationToasts** - Real-time toast component
6. **Dashboard integrations** - Add bells to merchant/driver pages
7. **Admin controls** - Add process button to dispatch settings

