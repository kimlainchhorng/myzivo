-- Add altitude column to driver_location_history
ALTER TABLE public.driver_location_history
ADD COLUMN IF NOT EXISTS altitude double precision;

-- Add comment for documentation
COMMENT ON COLUMN public.driver_location_history.altitude IS 'GPS altitude in meters above sea level';

-- Note: Index for drivers table location queries added without CONCURRENTLY
CREATE INDEX IF NOT EXISTS idx_drivers_location_update
ON public.drivers (id)
WHERE current_lat IS NOT NULL;;
