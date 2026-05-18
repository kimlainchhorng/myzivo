-- Create trigger to automatically add sample trips when a new driver is created
CREATE OR REPLACE FUNCTION public.on_driver_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the sample trips function for the new driver
  PERFORM create_sample_trips_for_driver(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on drivers table
DROP TRIGGER IF EXISTS trigger_create_sample_trips ON public.drivers;
CREATE TRIGGER trigger_create_sample_trips
  AFTER INSERT ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.on_driver_created();;
