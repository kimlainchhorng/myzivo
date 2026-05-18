-- Create a function to safely create a driver record (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_driver_on_signup(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_vehicle_type TEXT,
  p_vehicle_plate TEXT,
  p_license_number TEXT,
  p_vehicle_model TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_driver_id UUID;
BEGIN
  INSERT INTO public.drivers (
    user_id, email, full_name, phone, 
    vehicle_type, vehicle_plate, license_number, vehicle_model,
    status, is_online
  ) VALUES (
    p_user_id, p_email, p_full_name, p_phone,
    p_vehicle_type, p_vehicle_plate, p_license_number, p_vehicle_model,
    'pending', false
  )
  RETURNING id INTO new_driver_id;
  
  -- Create sample trips for the new driver
  PERFORM create_sample_trips_for_driver(new_driver_id);
  
  RETURN new_driver_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_driver_on_signup TO authenticated;;
