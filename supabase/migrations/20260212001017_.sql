
-- Create webhook_endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_received_at TIMESTAMPTZ,
  last_response_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_payload_bytes INTEGER,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create webhook_event_logs table
CREATE TABLE public.webhook_event_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  service TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_details TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_event_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_endpoints (admin-only, matching admin_audit_logs pattern)
CREATE POLICY "Admins can view webhook endpoints"
  ON public.webhook_endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can insert webhook endpoints"
  ON public.webhook_endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can update webhook endpoints"
  ON public.webhook_endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  );

-- RLS policies for webhook_event_logs
CREATE POLICY "Admins can view webhook event logs"
  ON public.webhook_event_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can insert webhook event logs"
  ON public.webhook_event_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can update webhook event logs"
  ON public.webhook_event_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  );

-- Indexes for performance
CREATE INDEX idx_webhook_event_logs_timestamp ON public.webhook_event_logs (timestamp DESC);
CREATE INDEX idx_webhook_event_logs_status ON public.webhook_event_logs (status);
CREATE INDEX idx_webhook_event_logs_service ON public.webhook_event_logs (service);
CREATE INDEX idx_webhook_event_logs_source ON public.webhook_event_logs (source);
CREATE INDEX idx_webhook_endpoints_source ON public.webhook_endpoints (source);

-- Trigger for updated_at on webhook_endpoints
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
