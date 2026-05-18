
-- ============================
-- 1. driver_earnings_goals
-- ============================
CREATE TABLE public.driver_earnings_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  target_value numeric NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(driver_id, goal_type, period_start)
);

ALTER TABLE public.driver_earnings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own goals"
  ON public.driver_earnings_goals FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can create own goals"
  ON public.driver_earnings_goals FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own goals"
  ON public.driver_earnings_goals FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete own goals"
  ON public.driver_earnings_goals FOR DELETE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access on goals"
  ON public.driver_earnings_goals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
  );

-- ============================
-- 2. driver_earnings_forecast_cache
-- ============================
CREATE TABLE public.driver_earnings_forecast_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  forecast_date date NOT NULL,
  estimated_daily_earnings_cents integer NOT NULL DEFAULT 0,
  estimated_weekly_earnings_cents integer NOT NULL DEFAULT 0,
  avg_trips_per_hour numeric NOT NULL DEFAULT 0,
  avg_earnings_per_trip_cents integer NOT NULL DEFAULT 0,
  surge_bonus_estimate_cents integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(driver_id, forecast_date)
);

ALTER TABLE public.driver_earnings_forecast_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own forecast"
  ON public.driver_earnings_forecast_cache FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access on forecast cache"
  ON public.driver_earnings_forecast_cache FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
  );
;
