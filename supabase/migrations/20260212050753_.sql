
-- Create peak_events table
CREATE TABLE public.peak_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  zones text[] NOT NULL DEFAULT '{}',
  expected_demand_level text NOT NULL DEFAULT 'high',
  status text NOT NULL DEFAULT 'planned',
  surge_multiplier numeric,
  bonus_amount numeric,
  incentive_id uuid REFERENCES public.driver_incentives(id) ON DELETE SET NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create peak_event_metrics table
CREATE TABLE public.peak_event_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.peak_events(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  online_drivers integer NOT NULL DEFAULT 0,
  active_orders integer NOT NULL DEFAULT 0,
  avg_wait_time_min numeric,
  revenue_cents integer NOT NULL DEFAULT 0,
  trips_completed integer NOT NULL DEFAULT 0,
  demand_ratio numeric
);

-- Indexes
CREATE INDEX idx_peak_events_date ON public.peak_events(event_date);
CREATE INDEX idx_peak_events_status ON public.peak_events(status);
CREATE INDEX idx_peak_event_metrics_event_ts ON public.peak_event_metrics(event_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.peak_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peak_event_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for peak_events
CREATE POLICY "Admins can view peak_events"
  ON public.peak_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations','support')));

CREATE POLICY "Admins can insert peak_events"
  ON public.peak_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations')));

CREATE POLICY "Admins can update peak_events"
  ON public.peak_events FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations')));

CREATE POLICY "Admins can delete peak_events"
  ON public.peak_events FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));

-- Admin-only policies for peak_event_metrics
CREATE POLICY "Admins can view peak_event_metrics"
  ON public.peak_event_metrics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations','support')));

CREATE POLICY "Admins can insert peak_event_metrics"
  ON public.peak_event_metrics FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations')));

-- Trigger for updated_at on peak_events
CREATE TRIGGER update_peak_events_updated_at
  BEFORE UPDATE ON public.peak_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
