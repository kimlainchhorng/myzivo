
-- RPC: set_driver_state
-- Transitions the calling driver between offline / online_available / paused
CREATE OR REPLACE FUNCTION public.set_driver_state(p_state text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_id uuid := auth.uid();
  v_valid_states text[] := ARRAY['offline', 'online_available', 'paused'];
BEGIN
  IF v_driver_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  IF NOT (p_state = ANY(v_valid_states)) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid state: ' || p_state);
  END IF;

  UPDATE drivers_status
  SET driver_state = p_state,
      is_online = (p_state = 'online_available'),
      is_busy = CASE WHEN p_state = 'offline' THEN false ELSE is_busy END,
      current_job_id = CASE WHEN p_state = 'offline' THEN NULL ELSE current_job_id END,
      updated_at = now(),
      last_seen = now()
  WHERE driver_id = v_driver_id;

  -- If no row existed, insert one
  IF NOT FOUND THEN
    INSERT INTO drivers_status (driver_id, driver_state, is_online, is_busy, current_job_id, updated_at, last_seen)
    VALUES (v_driver_id, p_state, (p_state = 'online_available'), false, NULL, now(), now());
  END IF;

  RETURN jsonb_build_object('ok', true, 'state', p_state);
END;
$$;
;
