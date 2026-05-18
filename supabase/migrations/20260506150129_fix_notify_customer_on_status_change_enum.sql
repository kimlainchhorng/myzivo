-- Repair an existing food-order customer notification trigger that has
-- been silently failing every status change because:
--   1. It tries to INSERT notifications with channel='push', but the
--      notification_channel enum only allows {email,in_app,sms}.
--   2. It writes status='pending', which is below the dispatch trigger's
--      threshold so even if the row landed, no push would fire.
--
-- Verified by counting: 0 rows of template='order_status_change' exist
-- across the whole table, despite many delivered orders.

CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  customer_status TEXT;
  msg TEXT;
  status_messages JSONB := '{
    "placed": "Your order has been placed",
    "confirmed": "Your order has been confirmed!",
    "preparing": "Your order is being prepared",
    "ready": "Your order is ready for pickup",
    "out_for_delivery": "Your order is on the way!",
    "delivered": "Your order has been delivered",
    "cancelled": "Your order has been cancelled"
  }'::jsonb;
  v_recipient uuid;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    customer_status := CASE NEW.status::text
      WHEN 'pending'          THEN 'placed'
      WHEN 'in_progress'      THEN 'preparing'
      WHEN 'ready_for_pickup' THEN 'ready'
      WHEN 'completed'        THEN 'delivered'
      ELSE NEW.status::text
    END;

    msg := COALESCE(status_messages->>customer_status, 'Your order is now ' || customer_status);

    -- food_orders has both customer_id and user_id; prefer customer_id.
    v_recipient := COALESCE(NEW.customer_id, NEW.user_id);

    -- Customer-facing alert (hiZIVO inbox)
    IF v_recipient IS NOT NULL THEN
      BEGIN
        INSERT INTO public.alerts (user_id, order_id, title, body)
        VALUES (v_recipient, NEW.id, 'Order update', msg);
      EXCEPTION WHEN OTHERS THEN
        -- alerts table may not exist in this branch — keep going
        NULL;
      END;
    END IF;

    -- Audit
    BEGIN
      INSERT INTO public.order_status_events (order_id, from_status, to_status, actor_type)
      VALUES (NEW.id, OLD.status::text, NEW.status::text, 'system');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- The actual push-fan-out path. channel='in_app' so the dispatch
    -- trigger picks it up; status='sent' so it's not gated as a draft.
    IF v_recipient IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, order_id, channel, category, template,
        title, body, action_url, status, metadata
      ) VALUES (
        v_recipient,
        NEW.id,
        'in_app',
        'transactional',
        'order_status_change',
        'Order update',
        msg,
        '/orders/' || NEW.id::text,
        'sent',
        jsonb_build_object('status', customer_status, 'order_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_customer_on_status_change failed: %', SQLERRM;
  RETURN NEW;
END;
$$;;
