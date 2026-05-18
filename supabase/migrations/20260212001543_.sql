
CREATE TABLE public.background_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type text NOT NULL,
  service text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  priority integer NOT NULL DEFAULT 0,
  payload jsonb DEFAULT '{}',
  related_id text,
  related_type text,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  error_stack text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  scheduled_for timestamptz,
  retried_by uuid,
  cancelled_by uuid,
  created_by text
);

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read background jobs" ON public.background_jobs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert background jobs" ON public.background_jobs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update background jobs" ON public.background_jobs FOR UPDATE TO authenticated USING (public.is_admin());

CREATE INDEX idx_background_jobs_status ON public.background_jobs (status);
CREATE INDEX idx_background_jobs_job_type ON public.background_jobs (job_type);
CREATE INDEX idx_background_jobs_service ON public.background_jobs (service);
CREATE INDEX idx_background_jobs_created_at ON public.background_jobs (created_at DESC);
CREATE INDEX idx_background_jobs_priority ON public.background_jobs (priority DESC);
;
