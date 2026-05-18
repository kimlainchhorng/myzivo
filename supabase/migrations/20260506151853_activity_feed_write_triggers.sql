-- Populate `activity_feed` from existing engagement tables. The feed is
-- read by the activity-feed UI but had no write side; these triggers fix
-- that without changing existing call sites.
-- Each row records who SHOULD see the activity (i.e. the post owner or
-- followed user) — not the actor — so a user reading their own feed sees
-- "X liked your post", "Y commented on your post", "Z started following you".

CREATE OR REPLACE FUNCTION public.tg_activity_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.user_posts WHERE id = NEW.post_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    v_owner, 'recipient', 'post_liked',
    jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_likes_activity_trg ON public.post_likes;
CREATE TRIGGER post_likes_activity_trg
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_post_like();

CREATE OR REPLACE FUNCTION public.tg_activity_store_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
  v_owner uuid;
BEGIN
  SELECT store_id INTO v_store_id FROM public.store_posts WHERE id = NEW.post_id;
  IF v_store_id IS NULL THEN RETURN NEW; END IF;
  SELECT owner_id INTO v_owner FROM public.store_profiles WHERE id = v_store_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    v_owner, 'recipient', 'store_post_liked',
    jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id, 'store_id', v_store_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS store_post_likes_activity_trg ON public.store_post_likes;
CREATE TRIGGER store_post_likes_activity_trg
AFTER INSERT ON public.store_post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_store_post_like();

CREATE OR REPLACE FUNCTION public.tg_activity_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  -- post_comments.post_id is text — try to resolve via user_posts UUID first
  SELECT user_id INTO v_owner FROM public.user_posts WHERE id::text = NEW.post_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    v_owner, 'recipient', 'post_commented',
    jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id, 'comment_id', NEW.id, 'preview', LEFT(NEW.content, 140))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_comments_activity_trg ON public.post_comments;
CREATE TRIGGER post_comments_activity_trg
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_post_comment();

CREATE OR REPLACE FUNCTION public.tg_activity_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.followed_id = NEW.follower_id THEN RETURN NEW; END IF;
  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    NEW.followed_id, 'recipient', 'new_follower',
    jsonb_build_object('actor_id', NEW.follower_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_followers_activity_trg ON public.user_followers;
CREATE TRIGGER user_followers_activity_trg
AFTER INSERT ON public.user_followers
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_follow();

-- Helpful index for "my feed" reads.
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_recent
  ON public.activity_feed (user_id, created_at DESC);;
