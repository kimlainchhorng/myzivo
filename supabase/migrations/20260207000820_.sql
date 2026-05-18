-- Add SET search_path = public to functions for security hardening
-- This prevents SQL injection via search path manipulation

-- 1. Fix haversine_miles function
CREATE OR REPLACE FUNCTION public.haversine_miles(
  lat1 numeric, 
  lon1 numeric, 
  lat2 numeric, 
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $$
declare
  r numeric := 3958.7613; -- earth radius miles
  dlat numeric := radians(lat2 - lat1);
  dlon numeric := radians(lon2 - lon1);
  a numeric;
  c numeric;
begin
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  return r * c;
end;
$$;

-- 2. Fix find_nearest_drivers function
CREATE OR REPLACE FUNCTION public.find_nearest_drivers(
  p_lat numeric, 
  p_lng numeric, 
  p_radius numeric, 
  p_limit integer,
  p_mode text DEFAULT 'RIDES'
)
RETURNS TABLE(driver_id uuid, distance_miles numeric)
LANGUAGE sql
SET search_path = public
AS $$
  SELECT
    d.id AS driver_id,
    haversine_miles(p_lat, p_lng, d.current_lat, d.current_lng) AS distance_miles
  FROM drivers d
  WHERE d.is_online = true
    AND d.status = 'verified'
    AND d.current_lat IS NOT NULL
    AND d.current_lng IS NOT NULL
    AND d.updated_at > now() - interval '2 minutes'
    AND haversine_miles(p_lat, p_lng, d.current_lat, d.current_lng) <= p_radius
    AND CASE 
      WHEN p_mode = 'RIDES' THEN d.rides_enabled = true
      WHEN p_mode = 'EATS' THEN d.eats_enabled = true
      ELSE true
    END
  ORDER BY distance_miles ASC
  LIMIT p_limit;
$$;;
