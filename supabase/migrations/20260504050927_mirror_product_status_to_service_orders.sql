-- Mirror status changes on food_orders + shopping_orders into the matching
-- service_orders row, so the new unified driver UI sees shop confirmation,
-- preparation, and ready-for-pickup state changes without each call site
-- having to remember.
--
-- ride_requests is intentionally excluded — its status enum is the payment
-- lifecycle (auth/captured/refunded), not operational. Drivers update ride
-- service_orders directly via zivo-update-status.

CREATE OR REPLACE FUNCTION public.mirror_product_status_to_service()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_target service_order_status;
  v_extra jsonb := '{}'::jsonb;
  v_external_kind text;
BEGIN
  -- Only fire when status actually changed
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  v_external_kind := CASE TG_TABLE_NAME
    WHEN 'food_orders' THEN 'food_order'
    WHEN 'shopping_orders' THEN 'shopping_order'
    ELSE NULL
  END;
  IF v_external_kind IS NULL THEN
    RETURN NEW;
  END IF;

  -- Map product-level booking_status -> service_order_status
  v_target := CASE NEW.status::text
    WHEN 'pending' THEN 'shop_pending'::service_order_status
    WHEN 'placed'  THEN 'shop_pending'::service_order_status
    WHEN 'confirmed' THEN 'shop_accepted'::service_order_status
    WHEN 'preparing' THEN 'preparing'::service_order_status
    WHEN 'ready' THEN 'ready_for_pickup'::service_order_status
    WHEN 'ready_for_pickup' THEN 'ready_for_pickup'::service_order_status
    WHEN 'out_for_delivery' THEN 'picked_up'::service_order_status
    WHEN 'in_progress' THEN 'in_progress'::service_order_status
    WHEN 'delivered' THEN 'completed'::service_order_status
    WHEN 'completed' THEN 'completed'::service_order_status
    WHEN 'cancelled' THEN 'cancelled'::service_order_status
    ELSE NULL
  END;

  IF v_target IS NULL THEN
    RETURN NEW;
  END IF;

  -- Stamp the appropriate timestamp column too
  IF NEW.status::text = 'confirmed' THEN
    UPDATE public.service_orders
       SET status = v_target,
           shop_accepted_at = COALESCE(shop_accepted_at, now()),
           updated_at = now()
     WHERE external_order_id = NEW.id AND external_kind = v_external_kind;
  ELSIF NEW.status::text = 'preparing' THEN
    UPDATE public.service_orders
       SET status = v_target, updated_at = now()
     WHERE external_order_id = NEW.id AND external_kind = v_external_kind;
  ELSIF NEW.status::text IN ('ready', 'ready_for_pickup') THEN
    UPDATE public.service_orders
       SET status = v_target,
           prepared_at = COALESCE(prepared_at, now()),
           updated_at = now()
     WHERE external_order_id = NEW.id AND external_kind = v_external_kind;
  ELSIF NEW.status::text = 'cancelled' THEN
    UPDATE public.service_orders
       SET status = v_target,
           cancelled_at = COALESCE(cancelled_at, now()),
           updated_at = now()
     WHERE external_order_id = NEW.id AND external_kind = v_external_kind;
  ELSE
    UPDATE public.service_orders
       SET status = v_target, updated_at = now()
     WHERE external_order_id = NEW.id AND external_kind = v_external_kind;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[mirror_product_status_to_service] failed for %.%: %', TG_TABLE_NAME, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_food_orders_mirror_status ON public.food_orders;
CREATE TRIGGER trg_food_orders_mirror_status
  AFTER UPDATE OF status ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.mirror_product_status_to_service();

DROP TRIGGER IF EXISTS trg_shopping_orders_mirror_status ON public.shopping_orders;
CREATE TRIGGER trg_shopping_orders_mirror_status
  AFTER UPDATE OF status ON public.shopping_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.mirror_product_status_to_service();

-- Auto-update service_orders.updated_at on every UPDATE so the cascade above
-- and zivo-update-status both keep the timestamp fresh.
CREATE OR REPLACE FUNCTION public.set_service_orders_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER trg_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_service_orders_updated_at();;
