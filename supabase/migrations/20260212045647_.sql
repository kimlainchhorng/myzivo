
-- Create driver_rebalancing_events table
CREATE TABLE public.driver_rebalancing_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  from_zone TEXT,
  to_zone TEXT NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'heatmap',
  accepted BOOLEAN NOT NULL DEFAULT false,
  responded_at TIMESTAMPTZ,
  trip_accepted_after BOOLEAN NOT NULL DEFAULT false,
  wait_time_before_min NUMERIC,
  wait_time_after_min NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_rebalancing_events_driver ON public.driver_rebalancing_events(driver_id);
CREATE INDEX idx_rebalancing_events_created ON public.driver_rebalancing_events(created_at DESC);
CREATE INDEX idx_rebalancing_events_to_zone ON public.driver_rebalancing_events(to_zone);

-- Enable RLS
ALTER TABLE public.driver_rebalancing_events ENABLE ROW LEVEL SECURITY;

-- Driver policies: own records
CREATE POLICY "Drivers can view own rebalancing events"
  ON public.driver_rebalancing_events FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert own rebalancing events"
  ON public.driver_rebalancing_events FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own rebalancing events"
  ON public.driver_rebalancing_events FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can view all rebalancing events"
  ON public.driver_rebalancing_events FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('owner','admin','manager','support'))
  );

CREATE POLICY "Admins can manage all rebalancing events"
  ON public.driver_rebalancing_events FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('owner','admin','manager'))
  );
;
