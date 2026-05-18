-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule cleanup_old_location_history to run daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-location-history-daily',
  '0 3 * * *',
  $$SELECT public.cleanup_old_location_history()$$
);

-- Schedule cleanup_old_login_sessions to run daily at 3:15 AM UTC
SELECT cron.schedule(
  'cleanup-login-sessions-daily',
  '15 3 * * *',
  $$SELECT public.cleanup_old_login_sessions()$$
);

-- Schedule cleanup_old_security_events to run weekly on Sunday at 4 AM UTC
SELECT cron.schedule(
  'cleanup-security-events-weekly',
  '0 4 * * 0',
  $$SELECT public.cleanup_old_security_events()$$
);

-- Schedule cleanup_expired_tokens to run hourly
SELECT cron.schedule(
  'cleanup-expired-tokens-hourly',
  '0 * * * *',
  $$SELECT public.cleanup_expired_tokens()$$
);;
