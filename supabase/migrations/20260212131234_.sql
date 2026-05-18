
-- Table: demand_engine_snapshots
CREATE TABLE public.demand_engine_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  city text,
  service_type text,
  forecast_hour timestamptz NOT NULL,
  predicted_orders numeric NOT NULL,
  actual_orders numeric,
  predicted_drivers numeric,
  actual_drivers numeric,
  accuracy_pct numeric,
  horizon text DEFAULT '1h',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demand_engine_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on demand_engine_snapshots"
  ON public.demand_engine_snapshots
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support'))
  );

CREATE INDEX idx_demand_engine_snapshots_zone_hour ON public.demand_engine_snapshots(zone_id, forecast_hour DESC);
CREATE INDEX idx_demand_engine_snapshots_created ON public.demand_engine_snapshots(created_at DESC);

-- Table: demand_engine_alerts
CREATE TABLE public.demand_engine_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL,
  zone_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  city text,
  service_type text,
  severity text DEFAULT 'warning',
  message text NOT NULL,
  forecast_hour text,
  predicted_orders numeric,
  predicted_drivers numeric,
  gap numeric,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demand_engine_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on demand_engine_alerts"
  ON public.demand_engine_alerts
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support'))
  );

CREATE INDEX idx_demand_engine_alerts_unread ON public.demand_engine_alerts(is_read, created_at DESC);
;
