
-- Update the trigger function to also assign the 'driver' role
CREATE OR REPLACE FUNCTION public.handle_new_user_driver_skeleton()
RETURNS trigger
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

  -- Also assign the 'driver' role if not already present
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = NEW.id AND role = 'driver'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'driver');
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill: assign 'driver' role to existing users who have a driver record but no role
INSERT INTO public.user_roles (user_id, role)
SELECT d.user_id, 'driver'::app_role
FROM public.drivers d
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = d.user_id AND ur.role = 'driver'
);
;
