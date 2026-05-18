-- @mention notification fan-out
-- Parses @username from new user_posts.caption, post_comments.content,
-- and store_post_comments.content. For each mention, resolves the target
-- user_id via public_profiles.username and inserts an in_app notification.
-- Skips self-mentions and dedupes within a single insert.

CREATE OR REPLACE FUNCTION public.notify_mentions_in_text(
  p_actor_id uuid,
  p_text text,
  p_template text,
  p_title text,
  p_action_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match text;
  v_username text;
  v_target_id uuid;
  v_seen uuid[] := ARRAY[]::uuid[];
  v_actor_name text;
BEGIN
  IF p_text IS NULL OR length(p_text) = 0 THEN RETURN; END IF;

  -- Best-effort actor display name
  SELECT COALESCE(full_name, username, 'Someone') INTO v_actor_name
  FROM public.public_profiles
  WHERE user_id = p_actor_id
  LIMIT 1;

  FOR v_match IN
    SELECT DISTINCT (regexp_matches(p_text, '@([a-zA-Z0-9_.]{2,30})', 'g'))[1]
  LOOP
    v_username := v_match;
    SELECT user_id INTO v_target_id
    FROM public.public_profiles
    WHERE lower(username) = lower(v_username)
    LIMIT 1;

    IF v_target_id IS NULL THEN CONTINUE; END IF;
    IF v_target_id = p_actor_id THEN CONTINUE; END IF;
    IF v_target_id = ANY(v_seen) THEN CONTINUE; END IF;
    v_seen := array_append(v_seen, v_target_id);

    INSERT INTO public.notifications (
      user_id, channel, category, template, title, body, action_url, status, metadata
    ) VALUES (
      v_target_id,
      'in_app',
      'social',
      p_template,
      p_title,
      COALESCE(v_actor_name, 'Someone') || ' mentioned you',
      p_action_url,
      'sent',
      jsonb_build_object('actor_id', p_actor_id, 'mentioned_username', v_username)
    );
  END LOOP;
END;
$$;

-- ---------- user_posts caption mentions ----------
CREATE OR REPLACE FUNCTION public.tg_user_post_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.caption IS DISTINCT FROM OLD.caption) THEN
    PERFORM public.notify_mentions_in_text(
      NEW.user_id,
      NEW.caption,
      'post_mention',
      'You were mentioned in a post',
      '/feed?post=' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_posts_mention_notify ON public.user_posts;
CREATE TRIGGER user_posts_mention_notify
AFTER INSERT OR UPDATE OF caption ON public.user_posts
FOR EACH ROW EXECUTE FUNCTION public.tg_user_post_mentions();

-- ---------- post_comments mentions ----------
CREATE OR REPLACE FUNCTION public.tg_post_comment_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_mentions_in_text(
    NEW.user_id,
    NEW.content,
    'comment_mention',
    'You were mentioned in a comment',
    '/feed?post=' || NEW.post_id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_comments_mention_notify ON public.post_comments;
CREATE TRIGGER post_comments_mention_notify
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_post_comment_mentions();

-- ---------- store_post_comments mentions (if table exists) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='store_post_comments') THEN
    EXECUTE $tg$
      CREATE OR REPLACE FUNCTION public.tg_store_post_comment_mentions()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $body$
      BEGIN
        PERFORM public.notify_mentions_in_text(
          NEW.user_id,
          NEW.content,
          'comment_mention',
          'You were mentioned in a comment',
          '/feed?post=' || NEW.post_id::text
        );
        RETURN NEW;
      END;
      $body$;
    $tg$;
    EXECUTE 'DROP TRIGGER IF EXISTS store_post_comments_mention_notify ON public.store_post_comments';
    EXECUTE 'CREATE TRIGGER store_post_comments_mention_notify AFTER INSERT ON public.store_post_comments FOR EACH ROW EXECUTE FUNCTION public.tg_store_post_comment_mentions()';
  END IF;
END;
$$;;
