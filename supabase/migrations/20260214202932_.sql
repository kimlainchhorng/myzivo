
-- Fix: Add SET search_path = public to all user-created functions missing it
-- This prevents search path injection attacks

-- 1. ensure_job_otp
CREATE OR REPLACE FUNCTION public.ensure_job_otp(p_job_id uuid, p_digits integer DEFAULT 4, p_ttl_minutes integer DEFAULT 120, p_enc_key text DEFAULT NULL::text)
 RETURNS TABLE(job_id uuid, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_exists boolean;
  v_verified timestamptz;
  v_expires timestamptz;
  v_otp text;
  v_hash text;
  v_min int;
  v_max int;
BEGIN
  SELECT true, verified_at, jo.expires_at
    INTO v_exists, v_verified, v_expires
  FROM public.job_otps jo
  WHERE jo.job_id = p_job_id;

  IF v_exists AND v_verified IS NOT NULL THEN
    RETURN QUERY SELECT p_job_id, v_expires;
    RETURN;
  END IF;

  IF v_exists AND v_expires > now() THEN
    RETURN QUERY SELECT p_job_id, v_expires;
    RETURN;
  END IF;

  v_min := power(10, p_digits - 1)::int;
  v_max := power(10, p_digits)::int - 1;
  v_otp := (floor(random() * (v_max - v_min + 1) + v_min))::int::text;

  v_hash := encode(digest(v_otp, 'sha256'), 'hex');
  v_expires := now() + make_interval(mins => p_ttl_minutes);

  IF p_enc_key IS NULL OR length(p_enc_key) < 8 THEN
    RAISE EXCEPTION 'Missing/weak encryption key';
  END IF;

  INSERT INTO public.job_otps (job_id, otp_hash, otp_last4, otp_enc, expires_at, attempts, max_attempts, verified_at)
  VALUES (
    p_job_id,
    v_hash,
    right(v_otp, 4),
    pgp_sym_encrypt(v_otp, p_enc_key),
    v_expires,
    0,
    6,
    NULL
  )
  ON CONFLICT (job_id) DO UPDATE
  SET otp_hash = excluded.otp_hash,
      otp_last4 = excluded.otp_last4,
      otp_enc  = excluded.otp_enc,
      expires_at = excluded.expires_at,
      attempts = 0,
      max_attempts = 6,
      verified_at = NULL;

  RETURN QUERY SELECT p_job_id, v_expires;
END;
$function$;

-- 2. expire_job_offers (no args)
CREATE OR REPLACE FUNCTION public.expire_job_offers()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.job_offers
  SET offer_status = 'expired'
  WHERE offer_status = 'sent'
    AND expires_at <= now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

-- 3. expire_job_offers (with p_job_id)
CREATE OR REPLACE FUNCTION public.expire_job_offers(p_job_id uuid)
 RETURNS TABLE(expired_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_expired int := 0;
BEGIN
  UPDATE public.job_offers
  SET offer_status = 'expired'
  WHERE job_id = p_job_id
    AND offer_status = 'sent'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  GET DIAGNOSTICS v_expired = ROW_COUNT;

  UPDATE public.drivers_status ds
  SET driver_state = 'online_available',
      is_busy = false,
      last_seen = now()
  WHERE ds.driver_state = 'online_offered'
    AND NOT EXISTS (
      SELECT 1 FROM public.job_offers o
      WHERE o.driver_id = ds.driver_id
        AND o.offer_status = 'sent'
        AND o.expires_at > now()
    );

  RETURN QUERY SELECT v_expired;
END;
$function$;

-- 4. expire_offers_and_reset
CREATE OR REPLACE FUNCTION public.expire_offers_and_reset(p_limit integer DEFAULT 200)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_count_expired int := 0;
  v_count_driver_reset int := 0;
BEGIN
  WITH exp AS (
    UPDATE public.job_offers jo
    SET offer_status = 'expired',
        expired_at = now()
    WHERE jo.offer_status IN ('sent','created')
      AND jo.expires_at IS NOT NULL
      AND jo.expires_at < now()
    RETURNING jo.job_id, jo.driver_id
  )
  SELECT count(*) INTO v_count_expired FROM exp;

  WITH d AS (
    UPDATE public.drivers_status ds
    SET driver_state = 'online_available'
    WHERE ds.is_busy = false
      AND ds.driver_state = 'online_offered'
      AND ds.driver_id IN (SELECT driver_id FROM public.job_offers WHERE offer_status='expired' AND expired_at >= now()-interval '10 minutes')
    RETURNING 1
  )
  SELECT count(*) INTO v_count_driver_reset FROM d;

  RETURN jsonb_build_object(
    'ok', true,
    'expired_offers', v_count_expired,
    'drivers_reset', v_count_driver_reset
  );
END;
$function$;

-- 5. get_dispatch_candidates
CREATE OR REPLACE FUNCTION public.get_dispatch_candidates(p_job_id uuid, p_pickup_lat numeric, p_pickup_lng numeric, p_radius_m integer, p_since timestamp with time zone, p_recent_offer_cutoff timestamp with time zone, p_limit integer)
 RETURNS TABLE(driver_id uuid, distance_m integer, last_seen timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT
    ds.driver_id,
    public.haversine_meters(p_pickup_lat::float8, p_pickup_lng::float8, ds.lat::float8, ds.lng::float8)::int AS distance_m,
    ds.last_seen
  FROM public.drivers_status ds
  WHERE ds.is_online = true
    AND COALESCE(ds.is_busy,false) = false
    AND ds.last_seen >= p_since
    AND ds.lat IS NOT NULL AND ds.lng IS NOT NULL
    AND public.haversine_meters(p_pickup_lat::float8, p_pickup_lng::float8, ds.lat::float8, ds.lng::float8) <= p_radius_m
    AND NOT EXISTS (
      SELECT 1
      FROM public.dispatch_driver_history h
      WHERE h.job_id = p_job_id
        AND h.driver_id = ds.driver_id
        AND h.offered_at >= p_recent_offer_cutoff
    )
  ORDER BY distance_m ASC, ds.last_seen DESC
  LIMIT p_limit;
$function$;

-- 6. get_driver_balance
CREATE OR REPLACE FUNCTION public.get_driver_balance(p_driver_id uuid)
 RETURNS TABLE(balance_cents bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(SUM(amount_cents),0)::bigint AS balance_cents
  FROM public.ledger_entries
  WHERE user_id = p_driver_id
    AND entry_type = 'driver_earning'
    AND payout_batch_id IS NULL;
$function$;

-- 7. get_nearby_drivers
CREATE OR REPLACE FUNCTION public.get_nearby_drivers(p_lat double precision, p_lng double precision, p_radius_m integer, p_limit integer DEFAULT 25)
 RETURNS TABLE(driver_id uuid, lat double precision, lng double precision, driver_state text, is_online boolean, is_busy boolean, last_seen timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  SELECT
    ds.driver_id,
    ds.lat,
    ds.lng,
    ds.driver_state::text,
    ds.is_online,
    ds.is_busy,
    ds.last_seen
  FROM public.drivers_status ds
  WHERE ds.is_online = true
    AND ds.is_busy = false
    AND ds.lat IS NOT NULL AND ds.lng IS NOT NULL
    AND ds.driver_state::text IN ('online_available')
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(ds.lng, ds.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
  ORDER BY ds.last_seen DESC
  LIMIT p_limit;
$function$;

-- 8. haversine_meters
CREATE OR REPLACE FUNCTION public.haversine_meters(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
 RETURNS double precision
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
DECLARE
  r double precision := 6371000;
  dlat double precision := radians(lat2 - lat1);
  dlon double precision := radians(lon2 - lon1);
  a double precision :=
    sin(dlat/2)^2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
BEGIN
  RETURN 2 * r * asin(sqrt(a));
END;
$function$;

-- 9. set_driver_state
CREATE OR REPLACE FUNCTION public.set_driver_state(p_to_state text, p_reason text DEFAULT NULL::text, p_meta jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(driver_id uuid, driver_state text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_driver uuid := auth.uid();
  v_from text;
BEGIN
  IF v_driver IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT ds.driver_state INTO v_from
  FROM public.drivers_status ds
  WHERE ds.driver_id = v_driver
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.drivers_status(driver_id, driver_state, is_online, is_busy, last_seen)
    VALUES (v_driver, 'offline', false, false, now());
    v_from := 'offline';
  END IF;

  IF p_to_state NOT IN ('offline','online_available','online_offered','online_ontrip','paused') THEN
    RAISE EXCEPTION 'Invalid state %', p_to_state;
  END IF;

  IF p_to_state IN ('online_offered','online_ontrip') THEN
    RAISE EXCEPTION 'State % can only be set by dispatch system', p_to_state;
  END IF;

  UPDATE public.drivers_status
  SET
    driver_state = p_to_state,
    is_online = (p_to_state IN ('online_available','paused')),
    is_busy = false,
    last_seen = now()
  WHERE drivers_status.driver_id = v_driver;

  INSERT INTO public.driver_state_events(driver_id, from_state, to_state, reason, meta)
  VALUES (v_driver, v_from, p_to_state, p_reason, COALESCE(p_meta,'{}'::jsonb));

  RETURN QUERY
  SELECT v_driver, p_to_state;
END;
$function$;

-- 10. set_job_status_safe
CREATE OR REPLACE FUNCTION public.set_job_status_safe(p_job_id uuid, p_new_status job_status)
 RETURNS TABLE(id uuid, status job_status, assigned_driver_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_current public.job_status;
  v_driver uuid;
BEGIN
  SELECT j.status, j.assigned_driver_id
    INTO v_current, v_driver
  FROM public.jobs j
  WHERE j.id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_driver IS NULL OR v_driver <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF (v_current = 'assigned' AND p_new_status = 'arrived')
     OR (v_current = 'arrived' AND p_new_status = 'in_progress')
     OR (v_current = 'in_progress' AND p_new_status = 'completed') THEN
    UPDATE public.jobs
    SET status = p_new_status
    WHERE jobs.id = p_job_id;
  ELSE
    RAISE EXCEPTION 'Invalid transition % -> %', v_current, p_new_status;
  END IF;

  RETURN QUERY
  SELECT j.id, j.status, j.assigned_driver_id
  FROM public.jobs j
  WHERE j.id = p_job_id;
END;
$function$;

-- 11. set_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 12. verify_job_otp_and_complete
CREATE OR REPLACE FUNCTION public.verify_job_otp_and_complete(p_job_id uuid, p_otp text)
 RETURNS TABLE(ok boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_driver uuid;
  v_status public.job_status;
  v_hash text;
  v_expires timestamptz;
  v_attempts int;
  v_max int;
  v_verified timestamptz;
BEGIN
  SELECT assigned_driver_id, j.status
    INTO v_driver, v_status
  FROM public.jobs j
  WHERE j.id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Job not found';
    RETURN;
  END IF;

  IF v_driver IS NULL OR v_driver <> auth.uid() THEN
    RETURN QUERY SELECT false, 'Not authorized';
    RETURN;
  END IF;

  IF v_status <> 'in_progress' THEN
    RETURN QUERY SELECT false, 'Job is not in progress';
    RETURN;
  END IF;

  SELECT otp_hash, jo.expires_at, attempts, max_attempts, verified_at
    INTO v_hash, v_expires, v_attempts, v_max, v_verified
  FROM public.job_otps jo
  WHERE jo.job_id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'OTP not created';
    RETURN;
  END IF;

  IF v_verified IS NOT NULL THEN
    RETURN QUERY SELECT true, 'Already verified';
    RETURN;
  END IF;

  IF now() > v_expires THEN
    RETURN QUERY SELECT false, 'OTP expired';
    RETURN;
  END IF;

  IF v_attempts >= v_max THEN
    RETURN QUERY SELECT false, 'Too many attempts';
    RETURN;
  END IF;

  IF encode(digest(p_otp, 'sha256'), 'hex') <> v_hash THEN
    UPDATE public.job_otps
    SET attempts = attempts + 1
    WHERE job_otps.job_id = p_job_id;

    RETURN QUERY SELECT false, 'Invalid OTP';
    RETURN;
  END IF;

  UPDATE public.job_otps
  SET verified_at = now()
  WHERE job_otps.job_id = p_job_id;

  UPDATE public.jobs
  SET status = 'completed'
  WHERE jobs.id = p_job_id;

  RETURN QUERY SELECT true, 'Verified and completed';
END;
$function$;
;
