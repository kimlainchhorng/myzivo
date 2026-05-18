-- Add country column to drivers table (US or KH only)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS country text DEFAULT 'US';

-- Update the handle_new_user_driver_skeleton function to include country
CREATE OR REPLACE FUNCTION public.handle_new_user_driver_skeleton()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _phone text;
  _vehicle_type text;
  _country text;
  _ref_code text;
BEGIN
  -- Only create driver profile if signup_role is NOT 'customer'
  IF (NEW.raw_user_meta_data->>'signup_role') = 'customer' THEN
    RETURN NEW;
  END IF;

  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  _phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  _vehicle_type := COALESCE(NEW.raw_user_meta_data->>'vehicle_type', 'car');
  _country := COALESCE(NEW.raw_user_meta_data->>'country', 'US');
  _ref_code := 'ZV' || UPPER(SUBSTR(MD5(RANDOM()::text), 1, 6));

  INSERT INTO public.drivers (
    user_id, full_name, email, phone, vehicle_type, country,
    referral_code, status, onboarding_status, can_go_online
  ) VALUES (
    NEW.id, _full_name, NEW.email, _phone, _vehicle_type, _country,
    _ref_code, 'pending', 'not_started', false
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Assign driver role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'driver')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;;
