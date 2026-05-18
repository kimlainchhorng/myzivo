CREATE OR REPLACE FUNCTION public.zivo_invoke_recompute_etas()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_url TEXT := 'https://slirphzzwcogdbkeicff.functions.supabase.co/zivo-recompute-etas';
  v_key TEXT := coalesce(
    current_setting('app.settings.service_role_key', true),
    current_setting('zivo.service_role_key', true),
    ''
  );
BEGIN
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 5000
  );

  PERFORM pg_sleep(30);

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
END $$;;
