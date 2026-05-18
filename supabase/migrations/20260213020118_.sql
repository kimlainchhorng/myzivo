
-- Add scheduled_for to trips table for scheduled rides
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN NOT NULL DEFAULT false;

-- Add scheduling_settings table for admin controls
CREATE TABLE public.scheduling_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL UNIQUE, -- 'ride', 'eats', 'delivery'
  min_advance_minutes INT NOT NULL DEFAULT 30,
  max_advance_days INT NOT NULL DEFAULT 7,
  cancellation_cutoff_minutes INT NOT NULL DEFAULT 15,
  scheduling_enabled BOOLEAN NOT NULL DEFAULT true,
  available_start_hour INT NOT NULL DEFAULT 6,
  available_end_hour INT NOT NULL DEFAULT 23,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduling_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read and update scheduling settings
CREATE POLICY "Admins can manage scheduling settings"
  ON public.scheduling_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role IS NOT NULL)
  );

-- Anyone authenticated can read settings (needed for customer UI)
CREATE POLICY "Authenticated users can read scheduling settings"
  ON public.scheduling_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed default settings
INSERT INTO public.scheduling_settings (service_type, min_advance_minutes, max_advance_days, cancellation_cutoff_minutes)
VALUES
  ('ride', 30, 7, 15),
  ('eats', 60, 3, 30),
  ('delivery', 30, 7, 15)
ON CONFLICT (service_type) DO NOTHING;

-- Index for scheduled trips
CREATE INDEX IF NOT EXISTS idx_trips_scheduled_for ON public.trips(scheduled_for) WHERE scheduled_for IS NOT NULL;
;
