-- Telegram-parity additions to channels
-- 1. Pinned posts: owner/admin can pin one post per channel
-- 2. Discussion comments: subscribers can reply on a channel post

ALTER TABLE public.channel_posts
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_at timestamptz,
  ADD COLUMN IF NOT EXISTS comments_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_channel_posts_pinned
  ON public.channel_posts (channel_id, is_pinned)
  WHERE is_pinned = true;

-- Discussion comments table
CREATE TABLE IF NOT EXISTS public.channel_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.channel_posts(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.channel_post_comments(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_post_comments_post
  ON public.channel_post_comments (post_id, created_at);

CREATE INDEX IF NOT EXISTS idx_channel_post_comments_user
  ON public.channel_post_comments (user_id, created_at DESC);

ALTER TABLE public.channel_post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone who can view the channel can read comments
DROP POLICY IF EXISTS "channel_post_comments_select" ON public.channel_post_comments;
CREATE POLICY "channel_post_comments_select"
  ON public.channel_post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = channel_post_comments.channel_id
        AND (c.is_public = true OR public.can_view_channel(c.id, auth.uid()))
    )
  );

-- Subscribed (or owner/admin) members can post comments when enabled
DROP POLICY IF EXISTS "channel_post_comments_insert" ON public.channel_post_comments;
CREATE POLICY "channel_post_comments_insert"
  ON public.channel_post_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.channel_posts p
      WHERE p.id = channel_post_comments.post_id
        AND p.comments_enabled = true
        AND (
          public.is_channel_manager(p.channel_id, auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.channel_subscribers s
            WHERE s.channel_id = p.channel_id AND s.user_id = auth.uid()
          )
        )
    )
  );

-- Author can soft-delete (set deleted_at). Channel manager can also delete.
DROP POLICY IF EXISTS "channel_post_comments_update" ON public.channel_post_comments;
CREATE POLICY "channel_post_comments_update"
  ON public.channel_post_comments FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_channel_manager(channel_id, auth.uid())
  );

DROP POLICY IF EXISTS "channel_post_comments_delete" ON public.channel_post_comments;
CREATE POLICY "channel_post_comments_delete"
  ON public.channel_post_comments FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_channel_manager(channel_id, auth.uid())
  );

-- Counter trigger: keep channel_posts.comments_count in sync
CREATE OR REPLACE FUNCTION public.tg_channel_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.channel_posts
       SET comments_count = comments_count + 1
     WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.channel_posts
       SET comments_count = GREATEST(0, comments_count - 1)
     WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS channel_post_comments_count_trg ON public.channel_post_comments;
CREATE TRIGGER channel_post_comments_count_trg
AFTER INSERT OR DELETE ON public.channel_post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_channel_post_comments_count();

-- Pin / unpin RPC (only managers; pinning a new post unpins the previous one
-- so each channel has exactly one pinned post Telegram-style)
CREATE OR REPLACE FUNCTION public.toggle_channel_post_pin(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_channel_id uuid;
  v_already boolean;
BEGIN
  SELECT channel_id, is_pinned INTO v_channel_id, v_already
  FROM public.channel_posts WHERE id = p_post_id;

  IF v_channel_id IS NULL THEN
    RAISE EXCEPTION 'post not found';
  END IF;
  IF NOT public.is_channel_manager(v_channel_id, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF v_already THEN
    UPDATE public.channel_posts
       SET is_pinned = false, pinned_at = NULL
     WHERE id = p_post_id;
    RETURN false;
  END IF;

  UPDATE public.channel_posts
     SET is_pinned = false, pinned_at = NULL
   WHERE channel_id = v_channel_id AND is_pinned = true;

  UPDATE public.channel_posts
     SET is_pinned = true, pinned_at = now()
   WHERE id = p_post_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_channel_post_pin(uuid) TO authenticated;;
