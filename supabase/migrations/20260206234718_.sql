-- Fix find_nearest_drivers RPC (use 'verified' instead of 'approved')
CREATE OR REPLACE FUNCTION find_nearest_drivers(
  p_lat numeric, 
  p_lng numeric, 
  p_radius numeric, 
  p_limit int,
  p_mode text DEFAULT 'RIDES'
)
RETURNS TABLE(driver_id uuid, distance_miles numeric)
LANGUAGE sql AS $$
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
$$;

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_offers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_offers;
  END IF;
END $$;

-- RLS for order_offers
ALTER TABLE order_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drivers_read_own_offers" ON order_offers;

CREATE POLICY "drivers_read_own_offers"
ON order_offers FOR SELECT TO authenticated
USING (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
));;
