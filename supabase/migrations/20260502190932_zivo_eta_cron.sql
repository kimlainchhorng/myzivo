-- Schedule zivo-recompute-etas every 30 seconds via pg_cron + pg_net.
-- pg_cron's minimum interval at the row level is 1 minute, so we use a
-- single 1-minute job that fires the function twice (T+0s, T+30s).

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

-- Helper to call the edge function with the service-role bearer.
CREATE OR REPLACE FUNCTION public.zivo_invoke_recompute_etas()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT := 'https://slirphzzwcogdbkeicff.functions.supabase.co/zivo-recompute-etas';
  v_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  IF v_key IS NULL OR v_key = '' THEN
    -- Fall back to an env-style setting if not set; pg_cron jobs can
    -- still be created and will fail loudly until the secret is wired.
    v_key := coalesce(current_setting('zivo.service_role_key', true), '');
  END IF;

  PERFORM extensions.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 5000
  );

  -- Sleep ~30 seconds and fire again so we hit roughly twice a minute.
  PERFORM pg_sleep(30);

  PERFORM extensions.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
END $$;

-- Drop existing job if any, then schedule fresh
DO $$ BEGIN
  PERFORM cron.unschedule(jobid)
    FROM cron.job WHERE jobname = 'zivo-recompute-etas';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'zivo-recompute-etas',
  '* * * * *',                              -- every minute
  $$ SELECT public.zivo_invoke_recompute_etas(); $$
);;
