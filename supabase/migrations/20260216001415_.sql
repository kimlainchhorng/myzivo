
-- AI Pricing Bot runs and suggestions
CREATE TABLE public.ai_pricing_bot_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  zones_analyzed INT NOT NULL DEFAULT 0,
  suggestions_generated INT NOT NULL DEFAULT 0,
  auto_applied INT NOT NULL DEFAULT 0,
  model_used TEXT DEFAULT 'google/gemini-3-flash-preview',
  run_duration_ms INT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_pricing_bot_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID REFERENCES public.ai_pricing_bot_runs(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL,
  zone_name TEXT NOT NULL,
  ride_type TEXT NOT NULL DEFAULT 'standard',
  field TEXT NOT NULL, -- 'base_fare', 'per_mile', 'per_minute', 'minimum_fare', 'booking_fee', 'multiplier'
  current_value NUMERIC,
  suggested_value NUMERIC,
  change_pct NUMERIC,
  reason TEXT,
  factors JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_applied'
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_pricing_bot_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_pricing_bot_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read pricing bot runs" ON public.ai_pricing_bot_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
);
CREATE POLICY "Admins can insert pricing bot runs" ON public.ai_pricing_bot_runs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
);

CREATE POLICY "Admins can read pricing bot suggestions" ON public.ai_pricing_bot_suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
);
CREATE POLICY "Admins can manage pricing bot suggestions" ON public.ai_pricing_bot_suggestions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
);

CREATE INDEX idx_ai_pricing_bot_suggestions_status ON public.ai_pricing_bot_suggestions(status);
CREATE INDEX idx_ai_pricing_bot_suggestions_zone ON public.ai_pricing_bot_suggestions(zone_id);
CREATE INDEX idx_ai_pricing_bot_runs_run_at ON public.ai_pricing_bot_runs(run_at DESC);
;
