-- Drop the existing function first to change its return type
DROP FUNCTION IF EXISTS find_nearest_drivers(double precision, double precision, double precision, integer, text);

-- Recreate find_nearest_drivers with performance_score in ordering
CREATE OR REPLACE FUNCTION find_nearest_drivers(
  p_lat double precision,
  p_lng double precision,
  p_radius double precision DEFAULT 8,
  p_limit integer DEFAULT 5,
  p_mode text DEFAULT 'RIDES'
)
RETURNS TABLE(driver_id uuid, distance_miles numeric, priority_score integer, performance_score integer)
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
    COALESCE(d.priority_score, 1) AS priority_score,
    COALESCE(d.performance_score, 50) AS performance_score
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
    -- Combined score: level priority (1-5) * 10 + performance bonus (0-10)
    (COALESCE(d.priority_score, 1) * 10 + COALESCE(d.performance_score, 50) / 10) DESC,
    distance_miles ASC,
    d.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$;;
