-- Four more silent flows wired up:
--   1. story_reactions  → push the story's author "Sara reacted ❤️ to your story"
--   2. story_comments   → push the story's author with a preview
--   3. message_reactions→ push the original DM sender "Sara reacted 👍 to your message"
--   4. live_streams     → when a stream flips to 'live', push every follower of the host
--
-- All drop into public.notifications and ride the central push dispatcher.

-- 1. Story reaction
CREATE OR REPLACE FUNCTION public.tg_story_reaction_notify_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.stories WHERE id = NEW.story_id LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'story_reaction',
     public.actor_display_name(NEW.user_id) || ' reacted ' || COALESCE(NEW.emoji,'') || ' to your story',
     '', '/stories/' || NEW.story_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'story_id', NEW.story_id, 'emoji', NEW.emoji));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS story_reaction_notify_trg ON public.story_reactions;
CREATE TRIGGER story_reaction_notify_trg AFTER INSERT ON public.story_reactions
FOR EACH ROW EXECUTE FUNCTION public.tg_story_reaction_notify_author();

-- 2. Story comment / reply
CREATE OR REPLACE FUNCTION public.tg_story_comment_notify_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.stories WHERE id = NEW.story_id LIMIT 1;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_owner, 'in_app', 'social', 'story_comment',
     public.actor_display_name(NEW.user_id) || ' replied to your story',
     LEFT(COALESCE(NEW.content,''), 140),
     '/stories/' || NEW.story_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'story_id', NEW.story_id, 'comment_id', NEW.id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS story_comment_notify_trg ON public.story_comments;
CREATE TRIGGER story_comment_notify_trg AFTER INSERT ON public.story_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_story_comment_notify_author();

-- 3. DM reaction
CREATE OR REPLACE FUNCTION public.tg_message_reaction_notify_sender()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_orig_sender uuid; v_preview text;
BEGIN
  SELECT sender_id, message INTO v_orig_sender, v_preview
    FROM public.direct_messages WHERE id = NEW.message_id LIMIT 1;
  IF v_orig_sender IS NULL OR v_orig_sender = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_orig_sender, 'in_app', 'social', 'message_reaction',
     public.actor_display_name(NEW.user_id) || ' reacted ' || COALESCE(NEW.emoji,'') || ' to your message',
     LEFT(COALESCE(v_preview,''), 100),
     '/chat?with=' || NEW.user_id::text, 'sent',
     jsonb_build_object('actor_id', NEW.user_id, 'message_id', NEW.message_id, 'emoji', NEW.emoji));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS message_reaction_notify_trg ON public.message_reactions;
CREATE TRIGGER message_reaction_notify_trg AFTER INSERT ON public.message_reactions
FOR EACH ROW EXECUTE FUNCTION public.tg_message_reaction_notify_sender();

-- 4. Live stream went live → notify every follower
CREATE OR REPLACE FUNCTION public.tg_live_stream_started_notify_followers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_actor text; v_title text;
BEGIN
  -- Only fire on transitions into 'live' (or equivalent)
  IF LOWER(COALESCE(NEW.status,'')) NOT IN ('live','active','online','started') THEN RETURN NEW; END IF;
  IF LOWER(COALESCE(OLD.status,'')) IN ('live','active','online','started') THEN RETURN NEW; END IF;
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  v_actor := public.actor_display_name(NEW.user_id);
  v_title := COALESCE(v_actor, 'Someone') || ' is live now';

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  SELECT f.follower_id, 'in_app', 'social', 'live_started',
         v_title, COALESCE(NEW.title, 'Tap to watch'),
         '/live/' || NEW.user_id::text, 'sent',
         jsonb_build_object('host_id', NEW.user_id, 'stream_id', NEW.id)
    FROM public.user_followers f
   WHERE f.following_id = NEW.user_id
     AND f.follower_id  <> NEW.user_id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS live_stream_started_notify_trg ON public.live_streams;
CREATE TRIGGER live_stream_started_notify_trg
AFTER INSERT OR UPDATE OF status ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.tg_live_stream_started_notify_followers();;
