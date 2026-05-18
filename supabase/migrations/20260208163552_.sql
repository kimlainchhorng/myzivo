-- Add priority_score and approved_for_blacklux columns to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS approved_for_blacklux BOOLEAN DEFAULT FALSE;

-- Update existing drivers to have default priority_score
UPDATE public.drivers SET priority_score = 1 WHERE priority_score IS NULL;

-- Create index for dispatch ordering
CREATE INDEX IF NOT EXISTS idx_drivers_priority_score ON public.drivers(priority_score DESC);

-- Update the find_nearest_drivers function to include priority_score in ordering
CREATE OR REPLACE FUNCTION find_nearest_drivers(
  p_lat double precision,
  p_lng double precision,
  p_radius double precision DEFAULT 8,
  p_limit integer DEFAULT 5,
  p_mode text DEFAULT 'RIDES'
)
RETURNS TABLE(driver_id uuid, distance_miles numeric, priority_score integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS driver_id,
    (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    )::numeric AS distance_miles,
    COALESCE(d.priority_score, 1) AS priority_score
  FROM drivers d
  WHERE d.is_online = true
    AND d.current_mode = p_mode
    AND d.current_lat IS NOT NULL
    AND d.current_lng IS NOT NULL
    AND d.last_location_at > NOW() - INTERVAL '2 minutes'
    AND (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    ) <= p_radius
  ORDER BY 
    COALESCE(d.priority_score, 1) DESC,  -- Higher priority first
    distance_miles ASC,                    -- Then closest
    d.rating DESC NULLS LAST               -- Then highest rated
  LIMIT p_limit;
END;
$$;;
