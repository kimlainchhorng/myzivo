-- =====================================================================
-- Host engagement toolkit (consolidated).
--   * stream coin goal + pinned chat message
--   * scheduled streams + RSVP
--   * lifetime supporter tier per (gifter, host) view
--   * fanout trigger so RSVPs receive live-start notifications
-- =====================================================================

-- ── 1. live_streams extensions ─────────────────────────────────────
ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS coin_goal           integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pinned_comment_id   uuid,
  ADD COLUMN IF NOT EXISTS scheduled_at        timestamptz,
  ADD COLUMN IF NOT EXISTS cover_url           text;

CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled
  ON public.live_streams (scheduled_at)
  WHERE status = 'scheduled' AND ended_at IS NULL;

-- ── 2. RSVP table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_stream_rsvps (
  stream_id   uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (stream_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_live_rsvp_user
  ON public.live_stream_rsvps (user_id, created_at DESC);
ALTER TABLE public.live_stream_rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view RSVP counts" ON public.live_stream_rsvps;
CREATE POLICY "Anyone can view RSVP counts"
  ON public.live_stream_rsvps FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users RSVP themselves" ON public.live_stream_rsvps;
CREATE POLICY "Users RSVP themselves"
  ON public.live_stream_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users un-RSVP themselves" ON public.live_stream_rsvps;
CREATE POLICY "Users un-RSVP themselves"
  ON public.live_stream_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── 3. Lifetime supporter view ──────────────────────────────────────
CREATE OR REPLACE VIEW public.v_user_host_lifetime_gifts
WITH (security_invoker = true) AS
SELECT
  ct.user_id                                          AS gifter_id,
  (ct.metadata ->> 'host')::uuid                      AS host_id,
  SUM(-ct.delta)::bigint                              AS coins_total,
  COUNT(*)::int                                       AS gifts_count,
  MAX(ct.created_at)                                  AS last_gift_at
FROM public.coin_transactions ct
WHERE ct.kind = 'gift_send'
  AND ct.delta < 0
  AND (ct.metadata ->> 'host') IS NOT NULL
GROUP BY ct.user_id, (ct.metadata ->> 'host')::uuid;
GRANT SELECT ON public.v_user_host_lifetime_gifts TO authenticated, anon;

-- ── 4. RPCs: stream goal + pin ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_stream_coin_goal(p_stream_id uuid, p_goal integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); host uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_goal < 0 OR p_goal > 100000000 THEN RAISE EXCEPTION 'Invalid goal'; END IF;
  SELECT user_id INTO host FROM public.live_streams WHERE id = p_stream_id;
  IF host IS NULL OR host <> uid THEN RAISE EXCEPTION 'Only host can set goal'; END IF;
  UPDATE public.live_streams SET coin_goal = p_goal WHERE id = p_stream_id;
END $$;

CREATE OR REPLACE FUNCTION public.pin_live_comment(p_comment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); host uuid; s_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT stream_id INTO s_id FROM public.live_comments WHERE id = p_comment_id;
  IF s_id IS NULL THEN RAISE EXCEPTION 'Comment not found'; END IF;
  SELECT user_id INTO host FROM public.live_streams WHERE id = s_id;
  IF host <> uid THEN RAISE EXCEPTION 'Only host can pin'; END IF;
  UPDATE public.live_streams SET pinned_comment_id = p_comment_id WHERE id = s_id;
END $$;

CREATE OR REPLACE FUNCTION public.unpin_live_comment(p_stream_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); host uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT user_id INTO host FROM public.live_streams WHERE id = p_stream_id;
  IF host <> uid THEN RAISE EXCEPTION 'Only host can unpin'; END IF;
  UPDATE public.live_streams SET pinned_comment_id = NULL WHERE id = p_stream_id;
END $$;

-- ── 5. RPCs: scheduling + RSVP ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.schedule_live_stream(
  p_title text, p_topic text, p_scheduled_at timestamptz, p_cover_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); s_id uuid; prof record;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_scheduled_at IS NULL OR p_scheduled_at < now() + interval '1 minute'
     OR p_scheduled_at > now() + interval '90 days' THEN
    RAISE EXCEPTION 'scheduled_at must be 1m..90d in the future';
  END IF;
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN RAISE EXCEPTION 'Title required'; END IF;
  SELECT full_name AS host_name, avatar_url AS host_avatar INTO prof
    FROM public.profiles WHERE user_id = uid LIMIT 1;
  INSERT INTO public.live_streams (
    user_id, title, topic, status, started_at, scheduled_at, cover_url, host_name, host_avatar
  ) VALUES (
    uid, trim(p_title), COALESCE(NULLIF(trim(p_topic),''),'General'),
    'scheduled', p_scheduled_at, p_scheduled_at, p_cover_url,
    COALESCE(prof.host_name, 'Host'), prof.host_avatar
  ) RETURNING id INTO s_id;
  RETURN s_id;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_scheduled_stream(p_stream_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.live_streams SET status = 'ended', ended_at = now()
   WHERE id = p_stream_id AND user_id = uid AND status = 'scheduled';
  IF NOT FOUND THEN RAISE EXCEPTION 'Not your scheduled stream'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rsvp_scheduled_stream(p_stream_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.live_streams
                  WHERE id = p_stream_id AND status = 'scheduled' AND ended_at IS NULL) THEN
    RAISE EXCEPTION 'Stream is not scheduled';
  END IF;
  INSERT INTO public.live_stream_rsvps (stream_id, user_id) VALUES (p_stream_id, uid)
  ON CONFLICT (stream_id, user_id) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.unrsvp_scheduled_stream(p_stream_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  DELETE FROM public.live_stream_rsvps WHERE stream_id = p_stream_id AND user_id = uid;
END $$;

-- ── 6. Realtime + grants ───────────────────────────────────────────
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_rsvps;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
ALTER TABLE public.live_stream_rsvps REPLICA IDENTITY FULL;

GRANT EXECUTE ON FUNCTION public.set_stream_coin_goal(uuid, integer)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.pin_live_comment(uuid)                            TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpin_live_comment(uuid)                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_live_stream(text, text, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_scheduled_stream(uuid)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.rsvp_scheduled_stream(uuid)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.unrsvp_scheduled_stream(uuid)                     TO authenticated;
