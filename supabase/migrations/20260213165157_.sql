
-- ============================================================
-- City Health Score System
-- ============================================================

-- 1) city_health_scores - daily snapshots of city health metrics
CREATE TABLE public.city_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  scored_date date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Individual dimension scores (0-100)
  demand_score numeric NOT NULL DEFAULT 0,
  supply_score numeric NOT NULL DEFAULT 0,
  service_quality_score numeric NOT NULL DEFAULT 0,
  financial_score numeric NOT NULL DEFAULT 0,
  
  -- Underlying metrics
  trips_per_day numeric DEFAULT 0,
  trips_growth_pct numeric DEFAULT 0,
  revenue_cents bigint DEFAULT 0,
  revenue_growth_pct numeric DEFAULT 0,
  active_drivers int DEFAULT 0,
  driver_utilization_pct numeric DEFAULT 0,
  customer_retention_pct numeric DEFAULT 0,
  cancellation_rate_pct numeric DEFAULT 0,
  avg_wait_time_min numeric DEFAULT 0,
  profit_margin_pct numeric DEFAULT 0,
  
  -- Composite score
  overall_score numeric NOT NULL DEFAULT 0,
  health_status text NOT NULL DEFAULT 'yellow',
  
  -- Trends
  score_change_7d numeric DEFAULT 0,
  score_change_30d numeric DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(city_id, scored_date)
);

CREATE INDEX idx_city_health_scores_city ON public.city_health_scores(city_id);
CREATE INDEX idx_city_health_scores_date ON public.city_health_scores(scored_date DESC);

CREATE OR REPLACE FUNCTION public.validate_city_health_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.health_status NOT IN ('green','yellow','red') THEN
    RAISE EXCEPTION 'Invalid health_status: %', NEW.health_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_city_health_status_validate
  BEFORE INSERT OR UPDATE ON public.city_health_scores
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_health_status();

ALTER TABLE public.city_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_health_scores"
  ON public.city_health_scores FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) city_health_alerts - triggered alerts for city health issues
CREATE TABLE public.city_health_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  title text NOT NULL,
  message text NOT NULL,
  metric_name text,
  metric_value numeric,
  threshold_value numeric,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_city_health_alert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.alert_type NOT IN ('score_drop','driver_shortage','wait_time_high','revenue_decline','cancellation_spike') THEN
    RAISE EXCEPTION 'Invalid alert_type: %', NEW.alert_type;
  END IF;
  IF NEW.severity NOT IN ('info','warning','critical') THEN
    RAISE EXCEPTION 'Invalid severity: %', NEW.severity;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_city_health_alert_validate
  BEFORE INSERT OR UPDATE ON public.city_health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_health_alert();

CREATE INDEX idx_city_health_alerts_city ON public.city_health_alerts(city_id);
CREATE INDEX idx_city_health_alerts_resolved ON public.city_health_alerts(is_resolved, created_at DESC);

ALTER TABLE public.city_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_health_alerts"
  ON public.city_health_alerts FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3) city_health_recommendations - AI/rule-based suggestions
CREATE TABLE public.city_health_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  impact_estimate text,
  priority int NOT NULL DEFAULT 3,
  is_actioned boolean NOT NULL DEFAULT false,
  actioned_at timestamptz,
  actioned_by uuid,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_city_health_recommendation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category NOT IN ('driver_supply','pricing','promotions','incentives','operations','expansion') THEN
    RAISE EXCEPTION 'Invalid recommendation category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_city_health_rec_validate
  BEFORE INSERT OR UPDATE ON public.city_health_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_health_recommendation();

CREATE INDEX idx_city_health_recs_city ON public.city_health_recommendations(city_id);

ALTER TABLE public.city_health_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_health_recommendations"
  ON public.city_health_recommendations FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
;
