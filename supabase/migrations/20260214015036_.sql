
DROP FUNCTION IF EXISTS public.accept_job_offer(uuid);

CREATE OR REPLACE FUNCTION public.accept_job_offer(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_offer record;
  v_order_type text;
  v_order_id uuid;
  v_driver_id uuid;
  v_assigned boolean;
BEGIN
  SELECT id INTO v_driver_id FROM drivers WHERE user_id = auth.uid();
  IF v_driver_id IS NULL THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('offer_' || p_offer_id::text));

  SELECT * INTO v_offer
  FROM order_offers
  WHERE id = p_offer_id AND status = 'offered' AND driver_id = v_driver_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job offer already taken or invalid';
  END IF;

  IF v_offer.expires_at < now() THEN
    UPDATE order_offers SET status = 'expired', updated_at = now() WHERE id = p_offer_id;
    RAISE EXCEPTION 'Offer expired';
  END IF;

  IF v_offer.trip_id IS NOT NULL THEN
    v_order_type := 'trip';
    v_order_id := v_offer.trip_id;
  ELSE
    v_order_type := 'food_order';
    v_order_id := v_offer.food_order_id;
  END IF;

  UPDATE order_offers SET status = 'accepted', updated_at = now() WHERE id = p_offer_id;

  v_assigned := false;
  IF v_order_type = 'trip' THEN
    UPDATE trips SET driver_id = v_driver_id, status = 'accepted', offer_status = 'assigned', updated_at = now()
    WHERE id = v_order_id AND driver_id IS NULL;
    GET DIAGNOSTICS v_assigned = ROW_COUNT;
  ELSE
    UPDATE food_orders SET driver_id = v_driver_id, status = 'accepted', offer_status = 'assigned', updated_at = now()
    WHERE id = v_order_id AND driver_id IS NULL;
    GET DIAGNOSTICS v_assigned = ROW_COUNT;
  END IF;

  IF v_assigned = 0 THEN
    UPDATE order_offers SET status = 'expired', updated_at = now() WHERE id = p_offer_id;
    RAISE EXCEPTION 'Order already assigned';
  END IF;

  IF v_order_type = 'trip' THEN
    UPDATE order_offers SET status = 'expired', updated_at = now()
    WHERE trip_id = v_order_id AND id != p_offer_id AND status = 'offered';
  ELSE
    UPDATE order_offers SET status = 'expired', updated_at = now()
    WHERE food_order_id = v_order_id AND id != p_offer_id AND status = 'offered';
  END IF;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'order_type', v_order_type);
END;
$$;
;
