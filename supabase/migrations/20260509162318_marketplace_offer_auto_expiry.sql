
-- Reject pending offers older than 48 hours.
CREATE OR REPLACE FUNCTION public.expire_stale_marketplace_offers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n int;
BEGIN
  WITH upd AS (
    UPDATE public.marketplace_offers
       SET status = 'rejected', responded_at = now()
     WHERE status = 'pending'
       AND created_at < now() - interval '48 hours'
    RETURNING id
  )
  SELECT count(*) INTO n FROM upd;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_stale_marketplace_offers() TO authenticated;

-- Best-effort cron schedule if pg_cron is installed; ignore errors silently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('marketplace_expire_offers');
    PERFORM cron.schedule('marketplace_expire_offers', '0 * * * *', 'SELECT public.expire_stale_marketplace_offers();');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END$$;
;
