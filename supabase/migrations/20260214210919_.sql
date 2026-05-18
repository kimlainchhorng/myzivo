
-- Create helper RPC to fetch zone geometries as GeoJSON
CREATE OR REPLACE FUNCTION public.get_zone_geojsons()
RETURNS TABLE(id uuid, geojson jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sz.id, ST_AsGeoJSON(sz.geom)::jsonb AS geojson
  FROM surge_zones sz
  WHERE sz.geom IS NOT NULL;
$$;
;
