
-- Auto-run AI Pricing Bot every 15 minutes, 24/7
SELECT cron.schedule(
  'ai-pricing-bot-auto-run',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/ai-pricing-bot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := jsonb_build_object(
      'scope', 'full_platform_optimization',
      'auto_apply', true,
      'cron', true,
      'context', jsonb_build_object('triggered_by', 'cron', 'interval', '15m')
    )
  );
  $$
);
;
