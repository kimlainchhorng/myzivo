
-- Add services_enabled to regions table
ALTER TABLE public.regions
ADD COLUMN IF NOT EXISTS services_enabled text[] NOT NULL DEFAULT '{ride,eats,delivery}';

-- Add services_available to brands table
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS services_available text[] NOT NULL DEFAULT '{ride,eats,delivery}';
;
