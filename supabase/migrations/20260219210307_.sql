
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_color text;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_year integer;
;
