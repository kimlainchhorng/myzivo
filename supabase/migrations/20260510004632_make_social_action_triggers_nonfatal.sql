-- Same defensive pattern as the post_like fix:
-- every social-action trigger now (a) casts UUID/TEXT joins and
-- (b) wraps the body in EXCEPTION WHEN OTHERS so a downstream side-effect
-- (notification, activity-feed, count-update) can never roll back the user's
-- primary action (comment, like, save). This kills the entire class of
-- "I tapped X and nothing happened" bugs caused by trigger errors.

-- ---- comment activity feed ----
CREATE OR REPLACE FUNCTION public.tg_activity_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner
    FROM public.user_posts
    WHERE id::text = NEW.post_id::text
    LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;

  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    v_owner, 'recipient', 'post_commented',
    jsonb_build_object(
      'actor_id', NEW.user_id,
      'post_id',  NEW.post_id,
      'comment_id', NEW.id,
      'preview', LEFT(NEW.content, 140)
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_activity_post_comment failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ---- comment @-mention notifications ----
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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_post_comment_mentions failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ---- comments-count maintenance trigger ----
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id TEXT;
  target_source  TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
    target_source  := OLD.post_source;
  ELSE
    target_post_id := NEW.post_id;
    target_source  := NEW.post_source;
  END IF;

  IF target_source = 'user' THEN
    UPDATE public.user_posts
       SET comments_count = (
         SELECT COUNT(*) FROM public.post_comments
         WHERE post_id::text = target_post_id AND post_source = 'user'
       )
     WHERE id::text = target_post_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'update_post_comments_count failed: % (%)', SQLERRM, SQLSTATE;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---- likes-count maintenance trigger (defensive parity with the comment one) ----
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
  ELSE
    target_post_id := NEW.post_id;
  END IF;

  UPDATE public.user_posts
     SET likes_count = (
       SELECT COUNT(*) FROM public.post_likes
       WHERE post_id::text = target_post_id
     )
   WHERE id::text = target_post_id;

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'update_post_likes_count failed: % (%)', SQLERRM, SQLSTATE;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---- shares: provide a stable RPC the client already calls so the
-- fallback path becomes the optimistic path. Wrapping it in plpgsql lets
-- us add EXCEPTION protection just like the trigger functions above. ----
CREATE OR REPLACE FUNCTION public.increment_post_shares(p_post_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_posts
     SET shares_count = COALESCE(shares_count, 0) + 1
   WHERE id::text = p_post_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_post_shares failed: % (%)', SQLERRM, SQLSTATE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_post_shares(text) TO authenticated, anon;;
