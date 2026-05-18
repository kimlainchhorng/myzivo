
-- =====================================================
-- Security Hardening Round 6: Anti-Fraud Constraints
-- =====================================================

-- 1. Add unique indexes to prevent duplicate driver accounts
-- Use WHERE clauses to allow NULLs (drivers may not have all fields yet)
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone_unique 
  ON public.drivers(phone) WHERE phone IS NOT NULL AND phone != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_license_unique 
  ON public.drivers(license_number) WHERE license_number IS NOT NULL AND license_number != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_plate_unique 
  ON public.drivers(vehicle_plate) WHERE vehicle_plate IS NOT NULL AND vehicle_plate != '';

-- 2. Add signup tracking columns for fraud detection
ALTER TABLE public.drivers 
  ADD COLUMN IF NOT EXISTS signup_device_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS signup_ip TEXT;

-- 3. Update create_driver_on_signup to check blocked_entities and log risk events
CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_vehicle_type TEXT DEFAULT 'car',
  p_vehicle_plate TEXT DEFAULT '',
  p_license_number TEXT DEFAULT '',
  p_vehicle_model TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL,
  p_affiliate_code TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_signup_ip TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_driver_id UUID;
  v_email TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_vehicle_type TEXT;
  v_vehicle_plate TEXT;
  v_license_number TEXT;
  v_vehicle_model TEXT;
BEGIN
  -- Validate user_id matches the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create driver for another user';
  END IF;

  -- Sanitize inputs
  v_email := TRIM(LOWER(p_email));
  IF v_email IS NULL OR LENGTH(v_email) < 5 OR LENGTH(v_email) > 254 THEN
    RAISE EXCEPTION 'Invalid email length';
  END IF;
  IF v_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  v_full_name := TRIM(p_full_name);
  IF v_full_name IS NULL OR LENGTH(v_full_name) < 2 OR LENGTH(v_full_name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  IF v_full_name !~ '^[a-zA-Z\s\-'']+$' THEN
    RAISE EXCEPTION 'Name contains invalid characters';
  END IF;

  v_phone := TRIM(p_phone);
  IF v_phone IS NULL OR LENGTH(v_phone) < 7 OR LENGTH(v_phone) > 20 THEN
    RAISE EXCEPTION 'Phone must be between 7 and 20 characters';
  END IF;
  IF v_phone !~ '^\+?[0-9\s\-()]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;

  v_vehicle_type := LOWER(TRIM(p_vehicle_type));
  IF v_vehicle_type NOT IN ('car', 'motorcycle', 'bicycle', 'scooter', 'van') THEN
    v_vehicle_type := 'car';
  END IF;

  v_vehicle_plate := UPPER(TRIM(p_vehicle_plate));
  IF v_vehicle_plate IS NULL OR LENGTH(v_vehicle_plate) < 2 OR LENGTH(v_vehicle_plate) > 20 THEN
    RAISE EXCEPTION 'License plate must be between 2 and 20 characters';
  END IF;
  IF v_vehicle_plate !~ '^[A-Z0-9\s\-]+$' THEN
    RAISE EXCEPTION 'Invalid license plate format';
  END IF;

  v_license_number := TRIM(p_license_number);
  IF v_license_number IS NULL OR LENGTH(v_license_number) < 5 OR LENGTH(v_license_number) > 50 THEN
    RAISE EXCEPTION 'License number must be between 5 and 50 characters';
  END IF;

  v_vehicle_model := NULLIF(TRIM(p_vehicle_model), '');
  IF v_vehicle_model IS NOT NULL AND LENGTH(v_vehicle_model) > 100 THEN
    RAISE EXCEPTION 'Vehicle model must be less than 100 characters';
  END IF;

  -- ========== BLOCKED ENTITY CHECK ==========
  IF EXISTS (
    SELECT 1 FROM public.blocked_entities
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        (entity_type = 'email' AND entity_value = v_email)
        OR (entity_type = 'phone' AND entity_value = v_phone)
        OR (entity_type = 'license' AND entity_value = v_license_number)
        OR (entity_type = 'plate' AND entity_value = v_vehicle_plate)
      )
  ) THEN
    RAISE EXCEPTION 'Account creation blocked. Contact support.';
  END IF;

  -- ========== DUPLICATE DEVICE FINGERPRINT CHECK ==========
  IF p_device_fingerprint IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.drivers
    WHERE signup_device_fingerprint = p_device_fingerprint
      AND created_at > now() - interval '30 days'
      AND user_id != p_user_id
  ) THEN
    -- Log risk event for admin review but still allow signup
    INSERT INTO public.risk_events (user_id, event_type, severity, details)
    VALUES (p_user_id, 'duplicate_device_signup', 4,
      jsonb_build_object(
        'fingerprint', LEFT(p_device_fingerprint, 12),
        'email_domain', SPLIT_PART(v_email, '@', 2)
      ));
  END IF;

  -- Log the signup attempt for audit
  PERFORM log_security_event(
    'driver_signup',
    'info',
    p_user_id,
    NULL,
    NULL,
    NULL,
    NULL,
    jsonb_build_object('email_domain', SPLIT_PART(v_email, '@', 2))
  );

  -- Insert the validated driver record
  INSERT INTO public.drivers (
    user_id, email, full_name, phone,
    vehicle_type, vehicle_plate, license_number, vehicle_model,
    status, is_online,
    signup_device_fingerprint, signup_ip
  ) VALUES (
    p_user_id, v_email, v_full_name, v_phone,
    v_vehicle_type, v_vehicle_plate, v_license_number, v_vehicle_model,
    'pending', false,
    p_device_fingerprint, p_signup_ip
  )
  RETURNING id INTO new_driver_id;

  -- Create sample trips for the new driver
  PERFORM create_sample_trips_for_driver(new_driver_id);

  RETURN new_driver_id;
END;
$$;
;
