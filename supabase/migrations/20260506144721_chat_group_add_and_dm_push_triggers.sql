-- Two missing notification triggers:
--   1. chat_group_members AFTER INSERT — push the user a "You were added to
--      {group_name}" notification when someone adds them to a group chat.
--   2. direct_messages AFTER INSERT — push the recipient when a new DM
--      arrives so offline users see it. Skip self-chat (Saved Messages)
--      and the sender's own row.

-- 1. Group-add notification
CREATE OR REPLACE FUNCTION public.tg_chat_group_member_added_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_name text;
  v_creator_id uuid;
  v_actor_name text;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  SELECT name, created_by INTO v_group_name, v_creator_id
  FROM public.chat_groups WHERE id = NEW.group_id LIMIT 1;
  IF v_group_name IS NULL THEN RETURN NEW; END IF;

  -- Don't notify the creator about being in their own group.
  IF NEW.user_id = v_creator_id THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, username, 'Someone') INTO v_actor_name
    FROM public.public_profiles WHERE user_id = v_creator_id LIMIT 1;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.user_id, 'in_app', 'social', 'group_added',
     'Added to ' || v_group_name,
     COALESCE(v_actor_name, 'Someone') || ' added you to the group',
     '/chat?group=' || NEW.group_id::text,
     'sent',
     jsonb_build_object('group_id', NEW.group_id, 'role', NEW.role));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_group_member_added_notify_trg ON public.chat_group_members;
CREATE TRIGGER chat_group_member_added_notify_trg
AFTER INSERT ON public.chat_group_members
FOR EACH ROW EXECUTE FUNCTION public.tg_chat_group_member_added_notify();

-- 2. DM push notification
CREATE OR REPLACE FUNCTION public.tg_direct_message_push_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name text;
  v_preview text;
BEGIN
  IF NEW.receiver_id IS NULL OR NEW.sender_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.receiver_id = NEW.sender_id THEN RETURN NEW; END IF; -- Saved Messages

  SELECT COALESCE(full_name, username, 'Someone') INTO v_sender_name
    FROM public.public_profiles WHERE user_id = NEW.sender_id LIMIT 1;

  -- Build a friendly preview line based on message_type.
  v_preview := CASE LOWER(COALESCE(NEW.message_type, 'text'))
    WHEN 'voice'         THEN '🎤 Voice message'
    WHEN 'image'         THEN '📷 Photo'
    WHEN 'video'         THEN '🎬 Video'
    WHEN 'file'          THEN '📎 File'
    WHEN 'location'      THEN '📍 Location'
    WHEN 'p2p_transfer'  THEN '💸 Money transfer'
    WHEN 'coin_transfer' THEN '🪙 Coin transfer'
    WHEN 'gift'          THEN '🎁 Gift'
    WHEN 'sticker'       THEN '🌟 Sticker'
    ELSE LEFT(COALESCE(NEW.message, ''), 140)
  END;
  IF COALESCE(v_preview, '') = '' THEN v_preview := 'New message'; END IF;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.receiver_id, 'in_app', 'social', 'direct_message',
     COALESCE(v_sender_name, 'New message'),
     v_preview,
     '/chat?with=' || NEW.sender_id::text,
     'sent',
     jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id, 'message_type', NEW.message_type));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS direct_message_push_notify_trg ON public.direct_messages;
CREATE TRIGGER direct_message_push_notify_trg
AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.tg_direct_message_push_notify();;
