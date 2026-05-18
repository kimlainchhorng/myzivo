-- Add Khmer name column to ride_zones
ALTER TABLE public.ride_zones ADD COLUMN IF NOT EXISTS city_name_km text;;
