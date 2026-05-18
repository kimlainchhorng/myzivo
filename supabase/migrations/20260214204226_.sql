
-- RPC: driver_decline_offer
-- Records the decline reason, increments decline_streak, and pauses driver if streak >= 3
CREATE OR REPLACE FUNCTION public.driver_decline_offer(
  p_offer_id uuid,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_id uuid := auth.uid();
  v_offer record;
  v_streak int;
  v_paused boolean := false;
  v_paused_until timestamptz;
BEGIN
  -- Validate offer belongs to this driver and is pending
  SELECT * INTO v_offer
  FROM job_offers
  WHERE id = p_offer_id AND driver_id = v_driver_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Offer not found or already handled');
  END IF;

  -- Update the offer
  UPDATE job_offers
  SET status = 'declined',
      declined_at = now(),
      decline_reason = p_reason
  WHERE id = p_offer_id;

  -- Increment decline streak
  UPDATE drivers_status
  SET decline_streak = COALESCE(decline_streak, 0) + 1,
      updated_at = now()
  WHERE driver_id = v_driver_id
  RETURNING COALESCE(decline_streak, 1) INTO v_streak;

  -- If 3+ consecutive declines, pause for 5 minutes
  IF v_streak >= 3 THEN
    v_paused := true;
    v_paused_until := now() + interval '5 minutes';

    UPDATE drivers_status
    SET driver_state = 'paused',
        paused_until = v_paused_until,
        updated_at = now()
    WHERE driver_id = v_driver_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'paused', v_paused,
    'paused_until', v_paused_until,
    'decline_streak', v_streak
  );
END;
$$;

-- Add decline_reason column to job_offers if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_offers' AND column_name = 'decline_reason'
  ) THEN
    ALTER TABLE public.job_offers ADD COLUMN decline_reason text;
  END IF;
END $$;
;
