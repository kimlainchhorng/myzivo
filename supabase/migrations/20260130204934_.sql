-- Add server-side input validation to create_driver_on_signup function
-- This provides defense-in-depth alongside client-side validation

CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id uuid, 
  p_email text, 
  p_full_name text, 
  p_phone text, 
  p_vehicle_type text, 
  p_vehicle_plate text, 
  p_license_number text, 
  p_vehicle_model text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  -- Validate user_id matches the authenticated user (prevent creating drivers for other users)
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create driver for another user';
  END IF;

  -- Sanitize and validate email
  v_email := TRIM(LOWER(p_email));
  IF v_email IS NULL OR LENGTH(v_email) < 5 OR LENGTH(v_email) > 254 THEN
    RAISE EXCEPTION 'Invalid email length';
  END IF;
  IF v_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Sanitize and validate full_name
  v_full_name := TRIM(p_full_name);
  IF v_full_name IS NULL OR LENGTH(v_full_name) < 2 OR LENGTH(v_full_name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  IF v_full_name !~ '^[a-zA-Z\s\-'']+$' THEN
    RAISE EXCEPTION 'Name contains invalid characters';
  END IF;

  -- Sanitize and validate phone
  v_phone := TRIM(p_phone);
  IF v_phone IS NULL OR LENGTH(v_phone) < 7 OR LENGTH(v_phone) > 20 THEN
    RAISE EXCEPTION 'Phone must be between 7 and 20 characters';
  END IF;
  IF v_phone !~ '^\+?[0-9\s\-()]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;

  -- Validate vehicle_type against allowed values
  v_vehicle_type := LOWER(TRIM(p_vehicle_type));
  IF v_vehicle_type NOT IN ('car', 'motorcycle', 'bicycle', 'scooter', 'van') THEN
    v_vehicle_type := 'car'; -- Default to car if invalid
  END IF;

  -- Sanitize and validate vehicle_plate
  v_vehicle_plate := UPPER(TRIM(p_vehicle_plate));
  IF v_vehicle_plate IS NULL OR LENGTH(v_vehicle_plate) < 2 OR LENGTH(v_vehicle_plate) > 20 THEN
    RAISE EXCEPTION 'License plate must be between 2 and 20 characters';
  END IF;
  IF v_vehicle_plate !~ '^[A-Z0-9\s\-]+$' THEN
    RAISE EXCEPTION 'Invalid license plate format';
  END IF;

  -- Sanitize and validate license_number
  v_license_number := TRIM(p_license_number);
  IF v_license_number IS NULL OR LENGTH(v_license_number) < 5 OR LENGTH(v_license_number) > 50 THEN
    RAISE EXCEPTION 'License number must be between 5 and 50 characters';
  END IF;

  -- Sanitize vehicle_model (optional)
  v_vehicle_model := NULLIF(TRIM(p_vehicle_model), '');
  IF v_vehicle_model IS NOT NULL AND LENGTH(v_vehicle_model) > 100 THEN
    RAISE EXCEPTION 'Vehicle model must be less than 100 characters';
  END IF;

  -- Log the signup attempt for audit purposes
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
    status, is_online
  ) VALUES (
    p_user_id, v_email, v_full_name, v_phone,
    v_vehicle_type, v_vehicle_plate, v_license_number, v_vehicle_model,
    'pending', false
  )
  RETURNING id INTO new_driver_id;
  
  -- Create sample trips for the new driver
  PERFORM create_sample_trips_for_driver(new_driver_id);
  
  RETURN new_driver_id;
END;
$function$;;
