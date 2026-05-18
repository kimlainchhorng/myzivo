
-- RPC: driver_mark_arrived
-- Sets job status to 'arrived_pickup' if the caller is the assigned driver
CREATE OR REPLACE FUNCTION public.driver_mark_arrived(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_id uuid;
  v_status text;
BEGIN
  -- Get the caller's user id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Verify job ownership and current status
  SELECT status INTO v_status
  FROM jobs
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'job_not_found');
  END IF;

  IF v_status <> 'enroute_pickup' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_status', 'current_status', v_status);
  END IF;

  UPDATE jobs
  SET status = 'arrived_pickup',
      arrived_at = now(),
      updated_at = now()
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'status', 'arrived_pickup');
END;
$$;

-- RPC: driver_start_trip
-- Sets job status to 'enroute_dropoff' from either 'enroute_pickup' or 'arrived_pickup'
CREATE OR REPLACE FUNCTION public.driver_start_trip(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT status INTO v_status
  FROM jobs
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'job_not_found');
  END IF;

  IF v_status NOT IN ('enroute_pickup', 'arrived_pickup') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_status', 'current_status', v_status);
  END IF;

  UPDATE jobs
  SET status = 'enroute_dropoff',
      started_at = now(),
      updated_at = now()
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'status', 'enroute_dropoff');
END;
$$;

-- RPC: driver_complete_trip
-- Sets job status to 'completed'
CREATE OR REPLACE FUNCTION public.driver_complete_trip(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT status INTO v_status
  FROM jobs
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'job_not_found');
  END IF;

  IF v_status <> 'enroute_dropoff' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_status', 'current_status', v_status);
  END IF;

  UPDATE jobs
  SET status = 'completed',
      completed_at = now(),
      updated_at = now()
  WHERE id = p_job_id AND assigned_driver_id = auth.uid();

  -- Reset driver state to available
  UPDATE drivers_status
  SET is_busy = false,
      current_job_id = NULL,
      updated_at = now()
  WHERE user_id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'status', 'completed');
END;
$$;
;
