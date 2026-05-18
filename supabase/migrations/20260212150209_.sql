
-- Table 1: api_partners
CREATE TABLE public.api_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'suspended')),
  permissions text[] NOT NULL DEFAULT '{}',
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  rate_limit_per_hour int NOT NULL DEFAULT 1000,
  daily_limit int NOT NULL DEFAULT 10000,
  burst_limit int NOT NULL DEFAULT 20,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only on api_partners" ON public.api_partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_api_partners_updated_at
  BEFORE UPDATE ON public.api_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table 2: api_keys
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.api_partners(id) ON DELETE CASCADE,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Default Key',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  last_used_at timestamptz,
  total_requests bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only on api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table 3: api_request_logs
CREATE TABLE public.api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.api_partners(id),
  api_key_id uuid REFERENCES public.api_keys(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code int,
  response_time_ms int,
  ip_address text,
  user_agent text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only on api_request_logs" ON public.api_request_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_api_request_logs_partner ON public.api_request_logs(partner_id, created_at DESC);
CREATE INDEX idx_api_request_logs_created ON public.api_request_logs(created_at DESC);
;
