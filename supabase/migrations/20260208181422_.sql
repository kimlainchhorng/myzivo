-- Update create_driver_on_signup to accept referral code and create referral entry
CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id uuid, 
  p_email text, 
  p_full_name text, 
  p_phone text, 
  p_vehicle_type text, 
  p_vehicle_plate text, 
  p_license_number text, 
  p_vehicle_model text DEFAULT NULL,
  p_referral_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_driver_id uuid;
  referrer_driver_id uuid;
  v_full_name text;
  v_email text;
BEGIN
  -- Sanitize inputs
  v_full_name := TRIM(p_full_name);
  v_email := LOWER(TRIM(p_email));

  -- Check if driver already exists for this user
  SELECT id INTO new_driver_id FROM drivers WHERE user_id = p_user_id;
  
  IF new_driver_id IS NOT NULL THEN
    RETURN new_driver_id;
  END IF;

  -- Insert new driver
  INSERT INTO drivers (
    user_id,
    email,
    full_name,
    phone,
    vehicle_type,
    vehicle_plate,
    license_number,
    vehicle_model,
    status,
    is_online,
    is_verified,
    rating,
    total_trips
  ) VALUES (
    p_user_id,
    v_email,
    v_full_name,
    TRIM(p_phone),
    p_vehicle_type,
    UPPER(TRIM(p_vehicle_plate)),
    TRIM(p_license_number),
    TRIM(p_vehicle_model),
    'pending',
    false,
    false,
    5.0,
    0
  )
  RETURNING id INTO new_driver_id;

  -- Process referral code if provided
  IF p_referral_code IS NOT NULL AND TRIM(p_referral_code) != '' THEN
    -- Find referrer driver with matching code (case-insensitive)
    SELECT id INTO referrer_driver_id 
    FROM drivers 
    WHERE referral_code = UPPER(TRIM(p_referral_code));
    
    -- Only create referral if referrer exists and is not self-referral
    IF referrer_driver_id IS NOT NULL AND referrer_driver_id != new_driver_id THEN
      -- Check if this driver was already referred (prevent duplicate referrals)
      IF NOT EXISTS (
        SELECT 1 FROM driver_referrals 
        WHERE referred_driver_id = new_driver_id
      ) THEN
        INSERT INTO driver_referrals (
          referrer_id,
          referrer_driver_id,
          referred_driver_id,
          referee_name,
          referee_email,
          required_orders,
          reward_amount,
          completed_orders,
          status,
          signed_up_at
        ) VALUES (
          referrer_driver_id,
          referrer_driver_id,
          new_driver_id,
          v_full_name,
          v_email,
          20,
          100,
          0,
          'pending',
          NOW()
        );
      END IF;
    END IF;
  END IF;

  RETURN new_driver_id;
END;
$$;;
