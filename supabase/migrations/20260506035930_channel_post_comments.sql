-- Channel post discussion threads (Telegram-parity).
-- Anyone who can_view_channel can read; subscribers + owner/admins can write.
-- Authors can edit their own and soft-delete via deleted_at.

CREATE TABLE IF NOT EXISTS public.channel_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.channel_posts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.channel_post_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpc_post ON public.channel_post_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cpc_user ON public.channel_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_cpc_parent ON public.channel_post_comments(parent_id);

ALTER TABLE public.channel_post_comments ENABLE ROW LEVEL SECURITY;

-- Read: anyone who can view the channel
DROP POLICY IF EXISTS "cpc_read" ON public.channel_post_comments;
CREATE POLICY "cpc_read"
  ON public.channel_post_comments FOR SELECT
  USING (public.can_view_channel(channel_id, auth.uid()));

-- Insert: subscribers, owner, admins (must match auth.uid)
DROP POLICY IF EXISTS "cpc_insert" ON public.channel_post_comments;
CREATE POLICY "cpc_insert"
  ON public.channel_post_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.channels c WHERE c.id = channel_id AND c.owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.channel_subscribers s
                 WHERE s.channel_id = channel_id AND s.user_id = auth.uid())
    )
  );

-- Update: own comment OR channel manager (for moderation soft-delete)
DROP POLICY IF EXISTS "cpc_update" ON public.channel_post_comments;
CREATE POLICY "cpc_update"
  ON public.channel_post_comments FOR UPDATE
  USING (user_id = auth.uid() OR public.is_channel_manager(channel_id, auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_channel_manager(channel_id, auth.uid()));

-- Delete: own comment OR channel manager
DROP POLICY IF EXISTS "cpc_delete" ON public.channel_post_comments;
CREATE POLICY "cpc_delete"
  ON public.channel_post_comments FOR DELETE
  USING (user_id = auth.uid() OR public.is_channel_manager(channel_id, auth.uid()));

-- Comment likes (separate table, mirrors post_comment_likes pattern)
CREATE TABLE IF NOT EXISTS public.channel_post_comment_likes (
  comment_id UUID NOT NULL REFERENCES public.channel_post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE public.channel_post_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cpcl_read" ON public.channel_post_comment_likes;
CREATE POLICY "cpcl_read"
  ON public.channel_post_comment_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_post_comments cmt
      WHERE cmt.id = comment_id AND public.can_view_channel(cmt.channel_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "cpcl_write" ON public.channel_post_comment_likes;
CREATE POLICY "cpcl_write"
  ON public.channel_post_comment_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cpcl_delete" ON public.channel_post_comment_likes;
CREATE POLICY "cpcl_delete"
  ON public.channel_post_comment_likes FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: maintain likes_count on channel_post_comments
CREATE OR REPLACE FUNCTION public.tg_cpc_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.channel_post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.channel_post_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS cpc_likes_count_trg ON public.channel_post_comment_likes;
CREATE TRIGGER cpc_likes_count_trg
AFTER INSERT OR DELETE ON public.channel_post_comment_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_cpc_likes_count();

-- Reply notification: when someone comments on a channel post, notify the
-- post's author (skip self-replies and self-comments-on-own-post).
CREATE OR REPLACE FUNCTION public.tg_channel_comment_notify_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post RECORD;
  v_channel RECORD;
  v_actor_name TEXT;
BEGIN
  SELECT id, channel_id, author_id INTO v_post FROM public.channel_posts WHERE id = NEW.post_id;
  IF v_post.author_id IS NULL OR v_post.author_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT name, handle INTO v_channel FROM public.channels WHERE id = v_post.channel_id;
  IF v_channel.name IS NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, username, 'Someone') INTO v_actor_name
  FROM public.public_profiles WHERE user_id = NEW.user_id LIMIT 1;

  INSERT INTO public.notifications (
    user_id, channel, category, template, title, body, action_url, status, metadata
  ) VALUES (
    v_post.author_id,
    'in_app',
    'social',
    'channel_comment',
    v_channel.name,
    COALESCE(v_actor_name, 'Someone') || ' commented: ' || left(NEW.body, 80),
    '/c/' || v_channel.handle || '?post=' || NEW.post_id::text,
    'sent',
    jsonb_build_object('channel_id', v_post.channel_id, 'post_id', NEW.post_id, 'comment_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cpc_notify_author_trg ON public.channel_post_comments;
CREATE TRIGGER cpc_notify_author_trg
AFTER INSERT ON public.channel_post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_channel_comment_notify_author();;
