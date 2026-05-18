
-- Create a trigger function that auto-creates a minimal driver skeleton
-- when a new user signs up via any method (Google OAuth, email, etc.)
-- This ensures OAuth users always have a driver record for onboarding.

CREATE OR REPLACE FUNCTION public.handle_new_user_driver_skeleton()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create if no driver record exists yet for this user
  IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE user_id = NEW.id) THEN
    INSERT INTO public.drivers (
      user_id,
      email,
      full_name,
      phone,
      vehicle_type,
      vehicle_plate,
      license_number,
      status,
      is_online,
      is_verified,
      rating,
      total_trips
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'car',
      '',
      '',
      'pending',
      false,
      false,
      5.0,
      0
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;
CREATE TRIGGER on_auth_user_created_driver
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_driver_skeleton();
;
