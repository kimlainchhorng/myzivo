-- Add affiliate tracking columns to drivers table (matching restaurant pattern)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS affiliate_code TEXT DEFAULT NULL;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS affiliate_partner_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS affiliate_partner_name TEXT DEFAULT NULL;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS affiliate_captured_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS affiliate_signup_bonus_points INTEGER DEFAULT NULL;

-- Update create_driver_on_signup to accept and process affiliate code
CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_vehicle_type TEXT,
  p_vehicle_plate TEXT,
  p_license_number TEXT,
  p_vehicle_model TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL,
  p_affiliate_code TEXT DEFAULT NULL
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
  v_affiliate_id UUID;
  v_affiliate_name TEXT;
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

  -- Handle driver-to-driver referral if code provided
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

  -- Handle affiliate partner referral if code provided
  IF p_affiliate_code IS NOT NULL AND p_affiliate_code != '' THEN
    SELECT id, name INTO v_affiliate_id, v_affiliate_name
    FROM public.affiliates
    WHERE referral_code = upper(p_affiliate_code)
    LIMIT 1;

    IF v_affiliate_id IS NOT NULL THEN
      -- Update driver with affiliate info
      UPDATE public.drivers SET
        affiliate_code = upper(p_affiliate_code),
        affiliate_partner_id = v_affiliate_id,
        affiliate_partner_name = v_affiliate_name,
        affiliate_captured_at = NOW()
      WHERE id = new_driver_id;

      -- Log affiliate event
      INSERT INTO public.affiliate_events (
        affiliate_id,
        event_type,
        reference_id
      ) VALUES (
        v_affiliate_id,
        'driver_signup',
        new_driver_id::text
      );
    END IF;
  END IF;

  RETURN new_driver_id;
END;
$$;;
