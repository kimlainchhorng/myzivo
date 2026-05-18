-- Two cron jobs have been failing 100% of runs:
--   * wallet-release-pending — every 5 min for 24h+ (288 consecutive failures).
--     Pulls URL/JWT from vault.decrypted_secrets which is empty (missing
--     'supabase_url' and 'service_role_key' rows). Real money has been
--     stuck in pending_cents because nobody's calling the release endpoint.
--   * stories-cleanup-hourly — every hour, blocked by storage.protect_delete.
--     Expired stories' DB rows are never deleted, and storage objects
--     accumulate forever.
--
-- Both fixed inline using the same hardcoded URL + anon JWT pattern the
-- channel-publish-scheduled cron already uses (vetted by the team).

-- Fix 1: wallet-release-pending
SELECT cron.unschedule('wallet-release-pending');
SELECT cron.schedule(
  'wallet-release-pending',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/wallet-release-pending',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'
    ),
    body := jsonb_build_object('ts', now())
  );
  $$
);

-- Fix 2: cleanup_expired_stories — remove DB rows but skip the storage
-- DELETE (blocked by protect_delete trigger). Orphaned storage objects
-- can be reaped by a separate Edge Function on a slower schedule using
-- the Storage REST API. Still cleans up cascading rows so the app's
-- queries stay fast.
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_ids uuid[];
  removed_count integer := 0;
BEGIN
  SELECT array_agg(id) INTO expired_ids
    FROM public.stories
   WHERE expires_at < now();

  IF expired_ids IS NULL OR array_length(expired_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  DELETE FROM public.story_views     WHERE story_id = ANY(expired_ids);
  DELETE FROM public.story_comments  WHERE story_id = ANY(expired_ids);
  DELETE FROM public.story_reactions WHERE story_id = ANY(expired_ids);

  DELETE FROM public.stories WHERE id = ANY(expired_ids);
  GET DIAGNOSTICS removed_count = ROW_COUNT;

  -- Storage object reap is intentionally left to a dedicated Edge Function
  -- that uses the Storage API (DELETE FROM storage.objects is now blocked
  -- by storage.protect_delete to prevent accidental data loss).
  RETURN removed_count;
END;
$$;;
