-- Two bugs in one function. Verified by edge function logs (every tick 403)
-- and Postgres logs (every tick blocks 30s on pg_sleep + another 30s).
--
-- Bug 1: reads service_role_key from current_setting('app.settings.service_role_key')
--        which is NOT SET. The 'app.settings.*' GUC pattern only works on
--        Supabase if you've set it via supabase_admin SET command — this
--        project hasn't. v_key resolves to '' so every request goes out
--        as 'Bearer ' which the edge gateway rejects as 403.
--
-- Bug 2: pg_sleep(30) holds the cron transaction open for 30 seconds.
--        Combined with the second post that's another 30s. Each minute,
--        this single function pins a cron worker for ~60s (and pollutes
--        Postgres logs with duration warnings). At 12 cron ticks per hour
--        that's a massive amount of cron worker time wasted on a function
--        that always returns 403.
--
-- Fix: use the hardcoded anon JWT pattern that channel-publish-scheduled
-- and tg_dispatch_notification_push both use successfully. Drop the
-- pg_sleep — if the function needs two passes per minute, the cron
-- can be scheduled at 30s intervals (or the function can do its own
-- internal pacing).

CREATE OR REPLACE FUNCTION public.zivo_invoke_recompute_etas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net'
AS $$
DECLARE
  v_url TEXT := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/zivo-recompute-etas';
  v_anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI';
BEGIN
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
END;
$$;;
