-- Create background_checks table for Checkr integration
CREATE TABLE public.background_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'checkr',
  checkr_candidate_id TEXT,
  checkr_report_id TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  adjudication TEXT,
  admin_override BOOLEAN NOT NULL DEFAULT false,
  admin_override_by UUID,
  admin_override_at TIMESTAMPTZ,
  admin_override_note TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.background_checks IS 'Tracks Checkr background check status for driver applications';

-- Create unique index on application_id (one check per application)
CREATE UNIQUE INDEX idx_background_checks_application_id ON public.background_checks(application_id);

-- Create index for driver lookup
CREATE INDEX idx_background_checks_driver_id ON public.background_checks(driver_id);

-- Create index for webhook matching
CREATE INDEX idx_background_checks_report_id ON public.background_checks(checkr_report_id) WHERE checkr_report_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can read background_checks"
  ON public.background_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert background_checks"
  ON public.background_checks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update background_checks"
  ON public.background_checks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Service role bypass for edge functions (webhooks)
CREATE POLICY "Service role can manage background_checks"
  ON public.background_checks
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_background_checks_updated_at
  BEFORE UPDATE ON public.background_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
