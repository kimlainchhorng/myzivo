-- Two fixes in one migration:
--   1. Repair earlier mention/comment notification triggers that joined
--      against public_profiles.username — that column doesn't exist
--      (username lives on `profiles`). Those triggers have been silently
--      raising and never firing.
--   2. Ship the post-engagement + follow notification triggers that were
--      blocked by the same column mismatch.

-- Helper: actor display name resolved from profiles (username) and
-- public_profiles (full_name) so we always get something useful.
CREATE OR REPLACE FUNCTION public.actor_display_name(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(
    (SELECT full_name FROM public.public_profiles WHERE user_id = _user_id LIMIT 1),
    (SELECT username  FROM public.profiles        WHERE user_id = _user_id LIMIT 1),
    'Someone'
  )
$$;

-- Fix mention fan-out helper to look up usernames from profiles, not public_profiles.
CREATE OR REPLACE FUNCTION public.notify_mentions_in_text(
  p_actor_id uuid,
  p_text text,
  p_template text,
  p_title text,
  p_action_url text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_match text;
  v_target_id uuid;
  v_seen uuid[] := ARRAY[]::uuid[];
  v_actor_name text;
BEGIN
  IF p_text IS NULL OR length(p_text) = 0 THEN RETURN; END IF;
  v_actor_name := public.actor_display_name(p_actor_id);

  FOR v_match IN
    SELECT DISTINCT (regexp_matches(p_text, '@([a-zA-Z0-9_.]{2,30})', 'g'))[1]
  LOOP
    SELECT user_id INTO v_target_id
      FROM public.profiles WHERE lower(username) = lower(v_match) LIMIT 1;

    IF v_target_id IS NULL THEN CONTINUE; END IF;
    IF v_target_id = p_actor_id THEN CONTINUE; END IF;
    IF v_target_id = ANY(v_seen) THEN CONTINUE; END IF;
    v_seen := array_append(v_seen, v_target_id);

    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (v_target_id, 'in_app', 'social', p_template, p_title,
       v_actor_name || ' mentioned you', p_action_url, 'sent',
       jsonb_build_object('actor_id', p_actor_id, 'mentioned_username', v_match));
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_mentions_in_text failed: %', SQLERRM;
END;
$$;

-- Now ship the engagement triggers --------------------------------------

CREATE OR REPLACE FUNCTION public.tg_post_like_notify_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.user_posts WHERE id::text = NEW.post_id::text LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'post_like',
     public.actor_display_name(NEW.user_id) || ' liked your post',
     '', '/feed?post=' || NEW.post_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS post_like_notify_trg ON public.post_likes;
CREATE TRIGGER post_like_notify_trg AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_post_like_notify_author();

CREATE OR REPLACE FUNCTION public.tg_post_comment_notify_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.user_posts WHERE id::text = NEW.post_id::text LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'post_comment',
     public.actor_display_name(NEW.user_id) || ' commented on your post',
     LEFT(COALESCE(NEW.content,''), 140),
     '/feed?post=' || NEW.post_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id, 'comment_id', NEW.id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS post_comment_notify_author_trg ON public.post_comments;
CREATE TRIGGER post_comment_notify_author_trg AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_post_comment_notify_author();

CREATE OR REPLACE FUNCTION public.tg_store_post_like_notify_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT sp.owner_id INTO v_owner
    FROM public.store_posts spx
    JOIN public.store_profiles sp ON sp.id = spx.store_id
   WHERE spx.id::text = NEW.post_id::text LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'store_post_like',
     public.actor_display_name(NEW.user_id) || ' liked your shop post',
     '', '/feed?post=' || NEW.post_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS store_post_like_notify_trg ON public.store_post_likes;
CREATE TRIGGER store_post_like_notify_trg AFTER INSERT ON public.store_post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_store_post_like_notify_owner();

CREATE OR REPLACE FUNCTION public.tg_store_post_comment_notify_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT sp.owner_id INTO v_owner
    FROM public.store_posts spx
    JOIN public.store_profiles sp ON sp.id = spx.store_id
   WHERE spx.id::text = NEW.post_id::text LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'store_post_comment',
     public.actor_display_name(NEW.user_id) || ' commented on your shop post',
     LEFT(COALESCE(NEW.content,''), 140),
     '/feed?post=' || NEW.post_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id, 'comment_id', NEW.id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS store_post_comment_notify_trg ON public.store_post_comments;
CREATE TRIGGER store_post_comment_notify_trg AFTER INSERT ON public.store_post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_store_post_comment_notify_owner();

CREATE OR REPLACE FUNCTION public.tg_user_follow_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.following_id IS NULL OR NEW.follower_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.following_id, 'in_app', 'social', 'new_follower',
     public.actor_display_name(NEW.follower_id) || ' followed you',
     '', '/u/' || NEW.follower_id::text, 'sent',
     jsonb_build_object('follower_id', NEW.follower_id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS user_followers_notify_trg ON public.user_followers;
CREATE TRIGGER user_followers_notify_trg AFTER INSERT ON public.user_followers
FOR EACH ROW EXECUTE FUNCTION public.tg_user_follow_notify();;
