-- Add last_heading and last_speed columns to drivers table
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS last_heading double precision,
  ADD COLUMN IF NOT EXISTS last_speed double precision;

-- Create or replace the function to update location timestamp and previous location
CREATE OR REPLACE FUNCTION public.update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.current_lat IS DISTINCT FROM NEW.current_lat 
      OR OLD.current_lng IS DISTINCT FROM NEW.current_lng) THEN
    NEW.prev_lat := OLD.current_lat;
    NEW.prev_lng := OLD.current_lng;
    NEW.prev_location_at := OLD.updated_at;
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_driver_location_update ON public.drivers;

CREATE TRIGGER trg_driver_location_update
  BEFORE UPDATE OF current_lat, current_lng ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_location_timestamp();

-- Add comment for documentation
COMMENT ON FUNCTION public.update_driver_location_timestamp() IS 'Automatically updates previous location and timestamp when driver location changes';;
