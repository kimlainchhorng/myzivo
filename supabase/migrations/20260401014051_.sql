
CREATE OR REPLACE VIEW public.pos_integrations_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  restaurant_id,
  provider,
  status,
  external_merchant_id,
  token_expires_at,
  last_sync_at,
  sync_error,
  created_at,
  updated_at
FROM public.pos_integrations;
;
