-- The notification_category enum doesn't include 'social' — only
-- transactional, account, operational, marketing. DMs map to transactional.
CREATE OR REPLACE FUNCTION public.tg_direct_message_push_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_name text;
  v_preview text;
BEGIN
  IF NEW.receiver_id IS NULL OR NEW.sender_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.receiver_id = NEW.sender_id THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, username, 'Someone') INTO v_sender_name
    FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;

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

  -- Defensive: notifications insert is best-effort. If anything fails (enum
  -- mismatch, missing column, etc.), swallow it so the message still sends.
  BEGIN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.receiver_id, 'in_app', 'transactional', 'direct_message',
       COALESCE(v_sender_name, 'New message'),
       v_preview,
       '/chat?with=' || NEW.sender_id::text,
       'sent',
       jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id, 'message_type', NEW.message_type));
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'tg_direct_message_push_notify notifications insert failed: % %', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$function$;;
