-- The push notify trigger queried public_profiles for `username`, but that
-- column lives on `profiles`, not `public_profiles`. Every DM insert was
-- failing with "column username does not exist" -> 400. Switch the lookup
-- to profiles which has both full_name + username.
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
$function$;;
