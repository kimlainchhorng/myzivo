-- Add zone_code to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS zone_code text;

-- Add zone_code to trips table  
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS zone_code text;

-- Add zone_code to rides table
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS zone_code text;

-- Create index for dispatch performance (drivers by zone when online)
CREATE INDEX IF NOT EXISTS idx_drivers_zone_code_online ON public.drivers(zone_code) WHERE is_online = true;

-- Create index for trips by zone
CREATE INDEX IF NOT EXISTS idx_trips_zone_code ON public.trips(zone_code);

-- Create index for rides by zone
CREATE INDEX IF NOT EXISTS idx_rides_zone_code ON public.rides(zone_code);

-- Update find_nearest_drivers function to support zone filtering
CREATE OR REPLACE FUNCTION public.find_nearest_drivers(
  p_lat double precision,
  p_lng double precision,
  p_radius double precision DEFAULT 8,
  p_limit integer DEFAULT 5,
  p_mode text DEFAULT 'RIDES',
  p_zone_code text DEFAULT NULL
)
RETURNS TABLE(driver_id uuid, distance_miles double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as driver_id,
    (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    ) as distance_miles
  FROM drivers d
  WHERE d.is_online = true
    AND d.status = 'active'
    AND d.current_lat IS NOT NULL
    AND d.current_lng IS NOT NULL
    AND d.location_updated_at > now() - interval '2 minutes'
    AND (
      (p_mode = 'RIDES' AND d.current_mode IN ('RIDES', 'BOTH'))
      OR (p_mode = 'EATS' AND d.current_mode IN ('EATS', 'BOTH'))
      OR p_mode IS NULL
    )
    -- Zone filtering: if p_zone_code is provided, only match drivers in that zone
    -- If p_zone_code is NULL, match all drivers (backward compatible)
    AND (p_zone_code IS NULL OR d.zone_code = p_zone_code)
    AND (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    ) <= p_radius
  ORDER BY distance_miles ASC
  LIMIT p_limit;
END;
$$;;
