-- Auto-create service_orders rows when a jobs row is inserted, so the new
-- unified zivodriver Service Jobs UI sees offers for ALL three product
-- verticals (rides, food delivery, grocery delivery) without each dispatcher
-- having to remember.
--
-- Idempotent: skips if a service_orders row already exists for this job
-- (e.g. dispatch-eats-order inserted the row directly first; we don't want
-- a duplicate).

CREATE OR REPLACE FUNCTION public.fan_jobs_to_service_orders() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_kind text;
  v_external_id uuid;
  v_external_kind text;
  v_existing uuid;
BEGIN
  -- Map jobs.job_type -> service_orders.kind ('ride' | 'delivery')
  IF NEW.job_type::text = 'ride' THEN
    v_kind := 'ride';
    v_external_kind := 'ride_request';
    -- ride_request id stashed in NEW.notes as "ride_request:<uuid>"
    v_external_id := NULLIF(substring(COALESCE(NEW.notes,'') from 'ride_request:([0-9a-f-]{36})'), '')::uuid;
  ELSIF NEW.job_type::text = 'food_delivery' THEN
    v_kind := 'delivery';
    v_external_kind := 'food_order';
    v_external_id := NULLIF(substring(COALESCE(NEW.notes,'') from 'Food order: ([0-9a-f-]{36})'), '')::uuid;
  ELSIF NEW.job_type::text = 'shopping_delivery' THEN
    v_kind := 'delivery';
    v_external_kind := 'shopping_order';
    v_external_id := NULLIF(substring(COALESCE(NEW.notes,'') from 'Grocery order: ([0-9a-f-]{36})'), '')::uuid;
  ELSE
    -- Other job_types (errand, lodging room service, etc.) — skip.
    RETURN NEW;
  END IF;

  -- If dispatch-eats-order (or similar) already inserted a service_orders
  -- row directly, don't double-insert.
  IF v_external_id IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM public.service_orders
    WHERE external_order_id = v_external_id
      AND external_kind = v_external_kind
    LIMIT 1;
    IF v_existing IS NOT NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.service_orders (
    kind, status, customer_id, shop_id,
    pickup_address, pickup_lat, pickup_lng,
    dropoff_address, dropoff_lat, dropoff_lng,
    distance_km, duration_minutes,
    total_cents, currency,
    external_order_id, external_kind
  ) VALUES (
    v_kind::service_order_kind,
    'searching'::service_order_status,
    NEW.customer_id,
    NEW.merchant_id,
    NEW.pickup_address,
    NEW.pickup_lat::double precision,
    NEW.pickup_lng::double precision,
    NEW.dropoff_address,
    NEW.dropoff_lat::double precision,
    NEW.dropoff_lng::double precision,
    NEW.estimated_miles * 1.60934, -- miles → km
    NEW.estimated_minutes,
    COALESCE(ROUND(NEW.price_total * 100), 0)::int,
    'USD',
    v_external_id,
    v_external_kind
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block the jobs insert. Log to postgres logs and continue.
  RAISE WARNING '[fan_jobs_to_service_orders] failed for job %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_to_service_orders ON public.jobs;
CREATE TRIGGER trg_jobs_to_service_orders
  AFTER INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.fan_jobs_to_service_orders();;
