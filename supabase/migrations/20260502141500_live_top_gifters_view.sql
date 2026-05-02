-- =====================================================================
-- Per-stream top gifters view (Bigo-style supporter board).
-- Aggregates from `coin_transactions` rows kind='gift_send' where the
-- reference_id is the live stream id.
-- =====================================================================

CREATE OR REPLACE VIEW public.v_live_stream_top_gifters
WITH (security_invoker = true) AS
SELECT
  ct.reference_id::uuid                          AS stream_id,
  ct.user_id                                     AS gifter_id,
  COALESCE(p.full_name, 'Guest')                 AS gifter_name,
  p.avatar_url                                   AS gifter_avatar,
  COALESCE(p.is_verified, false)                 AS gifter_verified,
  SUM(-ct.delta)::bigint                         AS coins_total,
  COUNT(*)::int                                  AS gifts_count,
  MAX(ct.created_at)                             AS last_gift_at
FROM public.coin_transactions ct
LEFT JOIN public.profiles p ON p.user_id = ct.user_id
WHERE ct.kind = 'gift_send'
  AND ct.reference_id IS NOT NULL
  AND ct.delta < 0
GROUP BY ct.reference_id, ct.user_id, p.full_name, p.avatar_url, p.is_verified;

GRANT SELECT ON public.v_live_stream_top_gifters TO authenticated, anon;
