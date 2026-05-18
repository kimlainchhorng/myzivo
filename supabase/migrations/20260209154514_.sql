
-- Create payout_schedules table
CREATE TABLE public.payout_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payee_type TEXT NOT NULL, -- 'driver' | 'merchant' | 'affiliate'
  frequency TEXT NOT NULL DEFAULT 'weekly', -- 'daily' | 'weekly' | 'monthly'
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  day_of_week INT, -- 0=Sun..6=Sat
  day_of_month INT, -- 1-28
  time_utc TEXT NOT NULL DEFAULT '09:00',
  min_payout_threshold_cents INT NOT NULL DEFAULT 2500,
  require_risk_check BOOLEAN NOT NULL DEFAULT true,
  require_stripe_verified BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payee_type)
);

-- Enable RLS
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view payout schedules"
  ON public.payout_schedules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Owner/admin can update payout schedules"
  ON public.payout_schedules FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Updated-at trigger
CREATE TRIGGER update_payout_schedules_updated_at
  BEFORE UPDATE ON public.payout_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with 3 rows
INSERT INTO public.payout_schedules (payee_type, frequency, day_of_week, time_utc)
VALUES
  ('driver', 'weekly', 5, '09:00'),
  ('merchant', 'weekly', 5, '09:00'),
  ('affiliate', 'monthly', NULL, '09:00');

UPDATE public.payout_schedules SET day_of_month = 1 WHERE payee_type = 'affiliate';

-- Extend payout_runs table
ALTER TABLE public.payout_runs
  ADD COLUMN IF NOT EXISTS payee_type TEXT DEFAULT 'driver',
  ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES public.payout_schedules(id);
;
