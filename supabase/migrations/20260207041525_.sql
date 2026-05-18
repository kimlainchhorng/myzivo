-- Create driver_schedule table for weekly recurring availability
CREATE TABLE public.driver_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.driver_schedule ENABLE ROW LEVEL SECURITY;

-- Create policy for drivers to view their own schedule
CREATE POLICY "Drivers can view their own schedule"
  ON public.driver_schedule FOR SELECT
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Create policy for drivers to insert their own schedule
CREATE POLICY "Drivers can insert their own schedule"
  ON public.driver_schedule FOR INSERT
  WITH CHECK (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Create policy for drivers to update their own schedule
CREATE POLICY "Drivers can update their own schedule"
  ON public.driver_schedule FOR UPDATE
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Create policy for drivers to delete their own schedule
CREATE POLICY "Drivers can delete their own schedule"
  ON public.driver_schedule FOR DELETE
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_driver_schedule_updated_at
  BEFORE UPDATE ON public.driver_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
