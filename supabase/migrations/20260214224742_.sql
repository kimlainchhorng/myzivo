
-- 1. device_registry table
CREATE TABLE public.device_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text UNIQUE NOT NULL,
  platform text,
  app_version text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert devices"
  ON public.device_registry FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can select devices"
  ON public.device_registry FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update devices"
  ON public.device_registry FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- 2. device_user_links table
CREATE TABLE public.device_user_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.device_registry(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  linked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id, user_id, role)
);

ALTER TABLE public.device_user_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own device links"
  ON public.device_user_links FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own device links"
  ON public.device_user_links FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. RPC: register_device
CREATE OR REPLACE FUNCTION public.register_device(
  p_fingerprint text,
  p_platform text DEFAULT 'web',
  p_app_version text DEFAULT null,
  p_user_agent text DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device_id uuid;
BEGIN
  INSERT INTO public.device_registry (fingerprint, platform, app_version, user_agent)
  VALUES (p_fingerprint, p_platform, p_app_version, p_user_agent)
  ON CONFLICT (fingerprint) DO UPDATE
    SET last_seen_at = now(),
        platform = COALESCE(EXCLUDED.platform, device_registry.platform),
        app_version = COALESCE(EXCLUDED.app_version, device_registry.app_version),
        user_agent = COALESCE(EXCLUDED.user_agent, device_registry.user_agent)
  RETURNING id INTO v_device_id;

  RETURN v_device_id;
END;
$$;

-- 4. RPC: link_user_device
CREATE OR REPLACE FUNCTION public.link_user_device(
  p_device_id uuid,
  p_role text DEFAULT 'driver'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.device_user_links (device_id, user_id, role)
  VALUES (p_device_id, auth.uid(), p_role)
  ON CONFLICT (device_id, user_id, role) DO NOTHING;
END;
$$;

-- 5. RPC: check_multi_account
CREATE OR REPLACE FUNCTION public.check_multi_account(
  p_device_id uuid,
  p_role text DEFAULT 'driver',
  p_max_accounts int DEFAULT 2,
  p_lookback_days int DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO v_count
  FROM public.device_user_links
  WHERE device_id = p_device_id
    AND role = p_role
    AND linked_at >= now() - (p_lookback_days || ' days')::interval;

  RETURN json_build_object(
    'flagged', v_count > p_max_accounts,
    'distinct_accounts', v_count
  );
END;
$$;
;
