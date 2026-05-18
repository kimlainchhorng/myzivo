
-- Add GPS telemetry columns to drivers_status
ALTER TABLE public.drivers_status
  ADD COLUMN IF NOT EXISTS heading real,
  ADD COLUMN IF NOT EXISTS speed_mps real,
  ADD COLUMN IF NOT EXISTS accuracy_m real;

-- Create driver_location_events for historical GPS trail
CREATE TABLE IF NOT EXISTS public.driver_location_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  heading REAL,
  speed_mps REAL,
  accuracy_m REAL,
  driver_state TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partition-friendly index on driver + time
CREATE INDEX idx_driver_location_events_driver_time
  ON public.driver_location_events (driver_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.driver_location_events ENABLE ROW LEVEL SECURITY;

-- Only the driver can insert their own events
CREATE POLICY "Drivers insert own location events"
  ON public.driver_location_events FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Drivers can read their own history
CREATE POLICY "Drivers read own location events"
  ON public.driver_location_events FOR SELECT
  USING (auth.uid() = driver_id);
;
