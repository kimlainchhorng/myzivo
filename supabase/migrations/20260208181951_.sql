-- Create demand_zones table for real-time demand visualization
CREATE TABLE public.demand_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  demand_level TEXT NOT NULL CHECK (demand_level IN ('low', 'medium', 'high')),
  radius_meters INTEGER DEFAULT 500,
  orders_count INTEGER DEFAULT 0,
  drivers_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for geospatial queries
CREATE INDEX idx_demand_zones_location ON public.demand_zones (latitude, longitude);
CREATE INDEX idx_demand_zones_updated ON public.demand_zones (updated_at DESC);

-- Enable RLS
ALTER TABLE public.demand_zones ENABLE ROW LEVEL SECURITY;

-- Policy: Any authenticated user can read demand zones
CREATE POLICY "Authenticated users can read demand zones"
ON public.demand_zones FOR SELECT
TO authenticated
USING (true);

-- Function to seed initial demand zones around a given location
CREATE OR REPLACE FUNCTION public.seed_demand_zones(
  p_center_lat NUMERIC,
  p_center_lng NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  zone_offsets NUMERIC[][] := ARRAY[
    ARRAY[0.015, 0.02, 3],   -- high demand
    ARRAY[-0.01, -0.025, 2], -- medium demand
    ARRAY[0.02, -0.01, 1],   -- low demand
    ARRAY[-0.018, 0.015, 3], -- high demand
    ARRAY[0.008, -0.018, 2], -- medium demand
    ARRAY[-0.025, 0.008, 1], -- low demand
    ARRAY[0.03, 0.012, 2],   -- medium demand
    ARRAY[-0.012, -0.035, 3] -- high demand
  ];
  offset_row NUMERIC[];
  demand_lvl TEXT;
BEGIN
  -- Clear existing zones
  DELETE FROM public.demand_zones;
  
  -- Insert new zones based on offsets
  FOREACH offset_row SLICE 1 IN ARRAY zone_offsets
  LOOP
    CASE offset_row[3]::INTEGER
      WHEN 3 THEN demand_lvl := 'high';
      WHEN 2 THEN demand_lvl := 'medium';
      ELSE demand_lvl := 'low';
    END CASE;
    
    INSERT INTO public.demand_zones (
      latitude,
      longitude,
      demand_level,
      radius_meters,
      orders_count,
      drivers_count
    ) VALUES (
      p_center_lat + offset_row[1],
      p_center_lng + offset_row[2],
      demand_lvl,
      CASE demand_lvl
        WHEN 'high' THEN 600
        WHEN 'medium' THEN 500
        ELSE 400
      END,
      CASE demand_lvl
        WHEN 'high' THEN floor(random() * 5 + 6)::INTEGER
        WHEN 'medium' THEN floor(random() * 3 + 3)::INTEGER
        ELSE floor(random() * 2 + 1)::INTEGER
      END,
      CASE demand_lvl
        WHEN 'high' THEN floor(random() * 2 + 1)::INTEGER
        WHEN 'medium' THEN floor(random() * 3 + 2)::INTEGER
        ELSE floor(random() * 4 + 3)::INTEGER
      END
    );
  END LOOP;
END;
$$;;
