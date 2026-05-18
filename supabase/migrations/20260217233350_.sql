
ALTER TABLE public.restricted_zones ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.restricted_zones ADD COLUMN IF NOT EXISTS zip_code text;
;
