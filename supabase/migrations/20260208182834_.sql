-- Create payout_runs table for tracking weekly payout batches
CREATE TABLE public.payout_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type text NOT NULL DEFAULT 'weekly_auto',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  drivers_processed integer NOT NULL DEFAULT 0,
  drivers_paid integer NOT NULL DEFAULT 0,
  drivers_failed integer NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  error_message text,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create payout_run_items table for individual driver payouts
CREATE TABLE public.payout_run_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.payout_runs(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_transfer_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_payout_run_items_run_id ON public.payout_run_items(run_id);
CREATE INDEX idx_payout_run_items_driver_id ON public.payout_run_items(driver_id);
CREATE INDEX idx_payout_run_items_created_at ON public.payout_run_items(created_at DESC);
CREATE INDEX idx_payout_runs_created_at ON public.payout_runs(created_at DESC);
CREATE INDEX idx_payout_runs_status ON public.payout_runs(status);

-- Enable RLS
ALTER TABLE public.payout_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_run_items ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for payout_runs
CREATE POLICY "Admins can view payout runs"
  ON public.payout_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert payout runs"
  ON public.payout_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update payout runs"
  ON public.payout_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admin-only policies for payout_run_items
CREATE POLICY "Admins can view payout run items"
  ON public.payout_run_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert payout run items"
  ON public.payout_run_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update payout run items"
  ON public.payout_run_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );;
