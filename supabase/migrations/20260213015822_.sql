
-- Surge analytics log for tracking surge events
CREATE TABLE public.surge_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.surge_zones(id) ON DELETE SET NULL,
  zone_name TEXT,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  active_orders INT NOT NULL DEFAULT 0,
  active_drivers INT NOT NULL DEFAULT 0,
  demand_ratio NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.surge_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read surge analytics"
  ON public.surge_analytics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role IS NOT NULL)
  );

CREATE POLICY "Anyone can insert surge analytics"
  ON public.surge_analytics FOR INSERT
  WITH CHECK (true);

ALTER TABLE public.surge_zones
  ADD COLUMN IF NOT EXISTS max_multiplier NUMERIC NOT NULL DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS surge_enabled BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_surge_analytics_recorded_at ON public.surge_analytics(recorded_at DESC);
CREATE INDEX idx_surge_analytics_zone_id ON public.surge_analytics(zone_id);
;
