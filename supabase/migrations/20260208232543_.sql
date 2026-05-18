-- Fix: Remove sample trips creation from driver signup flow
-- This fixes the "admin access required" error during registration

-- Step 1: Drop the trigger that fires on driver creation
DROP TRIGGER IF EXISTS trigger_create_sample_trips ON public.drivers;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS public.on_driver_created();

-- Step 3: Update create_driver_on_signup to remove sample trips call
CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_vehicle_type TEXT,
  p_vehicle_plate TEXT,
  p_license_number TEXT,
  p_vehicle_model TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_driver_id UUID;
  referrer_driver_id UUID;
  generated_referral_code TEXT;
BEGIN
  -- Generate unique referral code for new driver
  generated_referral_code := upper(substring(md5(random()::text) from 1 for 8));
  
  -- Create the driver record
  INSERT INTO public.drivers (
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
    total_trips,
    referral_code,
    acceptance_count,
    decline_count,
    cancel_count
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_phone,
    p_vehicle_type,
    p_vehicle_plate,
    p_license_number,
    p_vehicle_model,
    'pending',
    false,
    false,
    5.0,
    0,
    generated_referral_code,
    0,
    0,
    0
  )
  RETURNING id INTO new_driver_id;

  -- Handle referral if code provided
  IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
    SELECT id INTO referrer_driver_id
    FROM public.drivers
    WHERE referral_code = upper(p_referral_code)
    LIMIT 1;

    IF referrer_driver_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_driver_id,
        referred_driver_id,
        referral_code,
        status
      ) VALUES (
        referrer_driver_id,
        new_driver_id,
        upper(p_referral_code),
        'pending'
      );
    END IF;
  END IF;

  -- NOTE: Sample trips are NO LONGER created automatically
  -- Admins can use the Demo Data Seeder tool to create test data

  RETURN new_driver_id;
END;
$$;;
