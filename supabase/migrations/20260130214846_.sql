-- First, drop the existing trips_masked view if it exists
DROP VIEW IF EXISTS public.trips_masked;

-- Create or replace the trips_masked view that hides sensitive contact info
-- Only reveals customer_phone and customer_name to the rider, assigned driver, or admins
CREATE VIEW public.trips_masked AS
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
  -- Also mask precise customer location for non-participants
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

-- Now clean up the trips table RLS policies to ensure proper access control
-- Drop redundant SELECT policies (keep only the most restrictive participant-only one)
DROP POLICY IF EXISTS "Riders can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can view their assigned trips" ON public.trips;
DROP POLICY IF EXISTS "trips_participant_only" ON public.trips;
DROP POLICY IF EXISTS "trips_restricted" ON public.trips;

-- Create a single comprehensive SELECT policy
CREATE POLICY "trips_select_participants_only" ON public.trips
FOR SELECT
TO authenticated
USING (
  rider_id = auth.uid() 
  OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Add comment documenting the security approach
COMMENT ON VIEW public.trips_masked IS 'Masked view of trips that hides customer contact information (phone, name, precise location) except for the rider, assigned driver, and admins. Use this view for general queries to prevent PII exposure.';;
