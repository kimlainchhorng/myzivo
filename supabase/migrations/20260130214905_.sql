-- Recreate the view with SECURITY INVOKER to respect RLS of the querying user
DROP VIEW IF EXISTS public.trips_masked;

CREATE VIEW public.trips_masked 
WITH (security_invoker = true)
AS
SELECT 
  id,
  rider_id,
  driver_id,
  pickup_address,
  pickup_lat,
  pickup_lng,
  dropoff_address,
  dropoff_lat,
  dropoff_lng,
  distance_km,
  duration_minutes,
  fare_amount,
  status,
  payment_status,
  rating,
  created_at,
  started_at,
  completed_at,
  -- Only show customer contact info to authorized users
  CASE 
    WHEN rider_id = auth.uid() THEN customer_name
    WHEN driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) THEN customer_name
    WHEN public.has_role(auth.uid(), 'admin') THEN customer_name
    ELSE NULL
  END AS customer_name,
  CASE 
    WHEN rider_id = auth.uid() THEN customer_phone
    WHEN driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) THEN customer_phone
    WHEN public.has_role(auth.uid(), 'admin') THEN customer_phone
    ELSE NULL
  END AS customer_phone,
  CASE 
    WHEN rider_id = auth.uid() THEN customer_lat
    WHEN driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) THEN customer_lat
    WHEN public.has_role(auth.uid(), 'admin') THEN customer_lat
    ELSE NULL
  END AS customer_lat,
  CASE 
    WHEN rider_id = auth.uid() THEN customer_lng
    WHEN driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) THEN customer_lng
    WHEN public.has_role(auth.uid(), 'admin') THEN customer_lng
    ELSE NULL
  END AS customer_lng
FROM public.trips;

-- Grant access to the view
GRANT SELECT ON public.trips_masked TO authenticated;

COMMENT ON VIEW public.trips_masked IS 'Masked view of trips that hides customer contact information (phone, name, precise location) except for the rider, assigned driver, and admins. Uses SECURITY INVOKER to respect RLS policies of the querying user.';;
