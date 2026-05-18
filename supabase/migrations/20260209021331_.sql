-- Add max auto-accept distance setting for drivers
ALTER TABLE public.driver_settings 
ADD COLUMN IF NOT EXISTS auto_accept_max_distance_miles numeric(4,1) DEFAULT NULL;

-- NULL means no limit (accept all), any value limits auto-accept to orders within that distance
COMMENT ON COLUMN public.driver_settings.auto_accept_max_distance_miles IS 'Maximum distance in miles for auto-accept. NULL = no limit.';;
