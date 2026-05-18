-- Part 1: Backfill service_orders for existing jobs rows (24 rides + any
-- food/grocery rows). Reuses the same regex extraction the trigger uses.
INSERT INTO public.service_orders (
  kind, status, customer_id, shop_id,
  pickup_address, pickup_lat, pickup_lng,
  dropoff_address, dropoff_lat, dropoff_lng,
  distance_km, duration_minutes,
  total_cents, currency,
  external_order_id, external_kind,
  driver_id, driver_assigned_at,
  completed_at, cancelled_at
)
SELECT
  CASE j.job_type::text
    WHEN 'ride' THEN 'ride'::service_order_kind
    ELSE 'delivery'::service_order_kind
  END,
  -- Snap status to the closest service_order_status terminal value.
  CASE j.status::text
    WHEN 'completed' THEN 'completed'::service_order_status
    WHEN 'cancelled' THEN 'cancelled'::service_order_status
    WHEN 'canceled'  THEN 'cancelled'::service_order_status
    WHEN 'accepted'  THEN 'assigned'::service_order_status
    WHEN 'driver_assigned' THEN 'assigned'::service_order_status
    WHEN 'en_route_pickup' THEN 'driver_en_route'::service_order_status
    WHEN 'in_progress' THEN 'in_progress'::service_order_status
    WHEN 'picked_up' THEN 'picked_up'::service_order_status
    ELSE 'searching'::service_order_status
  END,
  j.customer_id, j.merchant_id,
  j.pickup_address, j.pickup_lat::double precision, j.pickup_lng::double precision,
  j.dropoff_address, j.dropoff_lat::double precision, j.dropoff_lng::double precision,
  COALESCE(j.estimated_miles * 1.60934, j.final_miles * 1.60934),
  COALESCE(j.estimated_minutes, j.final_minutes),
  COALESCE(ROUND(j.price_total * 100), ROUND(j.final_total * 100), 0)::int,
  'USD',
  CASE j.job_type::text
    WHEN 'ride' THEN NULLIF(substring(COALESCE(j.notes,'') from 'ride_request:([0-9a-f-]{36})'), '')::uuid
    WHEN 'food_delivery' THEN NULLIF(substring(COALESCE(j.notes,'') from 'Food order: ([0-9a-f-]{36})'), '')::uuid
    WHEN 'shopping_delivery' THEN NULLIF(substring(COALESCE(j.notes,'') from 'Grocery order: ([0-9a-f-]{36})'), '')::uuid
  END,
  CASE j.job_type::text
    WHEN 'ride' THEN 'ride_request'
    WHEN 'food_delivery' THEN 'food_order'
    WHEN 'shopping_delivery' THEN 'shopping_order'
  END,
  j.assigned_driver_id,
  j.accepted_at,
  j.completed_at,
  j.canceled_at
FROM public.jobs j
WHERE j.job_type::text IN ('ride','food_delivery','shopping_delivery')
  AND NOT EXISTS (
    SELECT 1 FROM public.service_orders s2
     WHERE s2.external_kind = CASE j.job_type::text
       WHEN 'ride' THEN 'ride_request'
       WHEN 'food_delivery' THEN 'food_order'
       WHEN 'shopping_delivery' THEN 'shopping_order'
     END
     AND s2.external_order_id = CASE j.job_type::text
       WHEN 'ride' THEN NULLIF(substring(COALESCE(j.notes,'') from 'ride_request:([0-9a-f-]{36})'), '')::uuid
       WHEN 'food_delivery' THEN NULLIF(substring(COALESCE(j.notes,'') from 'Food order: ([0-9a-f-]{36})'), '')::uuid
       WHEN 'shopping_delivery' THEN NULLIF(substring(COALESCE(j.notes,'') from 'Grocery order: ([0-9a-f-]{36})'), '')::uuid
     END
  );

-- Part 2: Push the restaurant owner when a new paid food order arrives, so
-- they don't have to keep the merchant dashboard open. Fires AFTER UPDATE
-- when payment_status flips to 'paid' (any rail). Same logic for grocery.
CREATE OR REPLACE FUNCTION public.notify_merchant_new_paid_order() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid;
  v_name text;
  v_payload jsonb;
  v_url text;
BEGIN
  IF NEW.payment_status IS NOT DISTINCT FROM OLD.payment_status THEN
    RETURN NEW;
  END IF;
  IF NEW.payment_status::text NOT IN ('paid', 'cash_on_delivery') THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'food_orders' THEN
    SELECT r.owner_id, r.name INTO v_owner, v_name
      FROM public.restaurants r WHERE r.id = NEW.restaurant_id;
  ELSIF TG_TABLE_NAME = 'shopping_orders' THEN
    -- shopping_orders has store text not restaurant_id; skip merchant push.
    RETURN NEW;
  ELSE
    RETURN NEW;
  END IF;

  IF v_owner IS NULL THEN RETURN NEW; END IF;

  v_url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-push-notification';
  v_payload := jsonb_build_object(
    'user_id', v_owner,
    'notification_type', 'new_paid_order',
    'title', 'New paid order 🍽️',
    'body', 'A customer just paid — confirm the order in your dashboard.',
    'data', jsonb_build_object('type','new_paid_order','order_id', NEW.id, 'action_url','/eats/restaurant-dashboard?tab=orders')
  );

  -- pg_net is the supabase-recommended way to call edge functions from triggers
  -- without blocking the transaction. If pg_net isn't installed, this fails
  -- silently and the order still completes.
  BEGIN
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type','application/json'),
      body := v_payload
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[notify_merchant_new_paid_order] pg_net call failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_food_orders_notify_merchant ON public.food_orders;
CREATE TRIGGER trg_food_orders_notify_merchant
  AFTER UPDATE OF payment_status ON public.food_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_merchant_new_paid_order();;
