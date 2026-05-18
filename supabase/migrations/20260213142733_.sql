
-- Auto-incentive rules table for configuring automatic incentive generation
CREATE TABLE public.auto_incentive_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_shortage_threshold INTEGER NOT NULL DEFAULT 3,
  bonus_amount_min NUMERIC NOT NULL DEFAULT 3,
  bonus_amount_max NUMERIC NOT NULL DEFAULT 15,
  incentive_duration_hours INTEGER NOT NULL DEFAULT 2,
  target_zone_codes TEXT[] DEFAULT '{}',
  service_type TEXT DEFAULT 'all',
  auto_apply BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_incentive_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage auto incentive rules"
  ON public.auto_incentive_rules FOR ALL
  USING (public.is_admin(auth.uid()));

-- AI forecast runs log
CREATE TABLE public.ai_forecast_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  forecast_horizon_hours INTEGER NOT NULL DEFAULT 24,
  zones_processed INTEGER NOT NULL DEFAULT 0,
  forecasts_generated INTEGER NOT NULL DEFAULT 0,
  incentives_suggested INTEGER NOT NULL DEFAULT 0,
  incentives_auto_applied INTEGER NOT NULL DEFAULT 0,
  accuracy_score NUMERIC,
  model_used TEXT DEFAULT 'google/gemini-3-flash-preview',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_forecast_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view forecast runs"
  ON public.ai_forecast_runs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert forecast runs"
  ON public.ai_forecast_runs FOR INSERT
  WITH CHECK (true);

-- Add AI-generated flag and rule reference to demand_forecasts
ALTER TABLE public.demand_forecasts
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_run_id UUID REFERENCES public.ai_forecast_runs(id),
  ADD COLUMN IF NOT EXISTS suggested_incentive_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS incentive_applied BOOLEAN DEFAULT false;

-- Add source tracking to driver_incentives
ALTER TABLE public.driver_incentives
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS auto_rule_id UUID REFERENCES public.auto_incentive_rules(id),
  ADD COLUMN IF NOT EXISTS ai_run_id UUID REFERENCES public.ai_forecast_runs(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS zone_code TEXT,
  ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auto_incentive_rules_active ON public.auto_incentive_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_forecast_runs_run_at ON public.ai_forecast_runs(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_ai_run ON public.demand_forecasts(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_driver_incentives_source ON public.driver_incentives(source);
;
