-- Add county, state, and zip_code to eats_zones
ALTER TABLE public.eats_zones
  ADD COLUMN IF NOT EXISTS county text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip_code text;

-- Index for filtering by state/county/zip
CREATE INDEX IF NOT EXISTS idx_eats_zones_state ON public.eats_zones (state);
CREATE INDEX IF NOT EXISTS idx_eats_zones_county ON public.eats_zones (county);
CREATE INDEX IF NOT EXISTS idx_eats_zones_zip_code ON public.eats_zones (zip_code);;
