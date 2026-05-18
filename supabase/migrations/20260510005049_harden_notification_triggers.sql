-- Same defensive pattern as the post-action triggers: wrap every
-- notification-side trigger body in EXCEPTION WHEN OTHERS so a downstream
-- failure (push-fanout error, alerts insert FK violation, hardcoded JWT
-- expiring on bot-dispatch, etc.) can never roll back the user's primary
-- action (DM a bot, send a chat message, send a friend request).
--
-- Without this guard, any of these three actions could silently fail with
-- the user seeing nothing happen — exactly like the Like bug.

-- ---- Bot DM dispatch ----
CREATE OR REPLACE FUNCTION public.notify_bot_on_dm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_bot record;
BEGIN
  SELECT b.id, b.webhook_url, b.is_active
    INTO v_bot
    FROM public.bots b
   WHERE b.bot_user_id = new.receiver_id;

  IF v_bot.id IS NULL THEN RETURN NEW; END IF;
  IF v_bot.is_active IS NOT TRUE OR v_bot.webhook_url IS NULL OR v_bot.webhook_url = '' THEN
    RETURN NEW;
  END IF;
  IF new.sender_id = new.receiver_id THEN RETURN NEW; END IF;

  PERFORM net.http_post(
    url     := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/bot-dispatch',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'
               ),
    body    := jsonb_build_object('message_id', new.id, 'bot_id', v_bot.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Bot dispatch is best-effort; never block the actual DM from being saved.
  RAISE WARNING 'notify_bot_on_dm failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ---- Order/Trip chat alerts ----
CREATE OR REPLACE FUNCTION public.notify_chat_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
  v_order RECORD;
  v_sender_name TEXT;
BEGIN
  IF NEW.chat_id IS NULL THEN RETURN NEW; END IF;

  SELECT fo.id, fo.customer_name
    INTO v_order
    FROM public.food_orders fo
    JOIN public.order_chats oc ON oc.order_id = fo.id
   WHERE oc.id = NEW.chat_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT
    CASE NEW.sender_type
      WHEN 'customer' THEN COALESCE(v_order.customer_name, 'Customer')
      WHEN 'driver'   THEN COALESCE((SELECT full_name FROM public.drivers WHERE user_id = NEW.sender_id), 'Driver')
      WHEN 'merchant' THEN COALESCE((SELECT name FROM public.restaurants WHERE owner_id = NEW.sender_id LIMIT 1), 'Restaurant')
      ELSE 'Someone'
    END
    INTO v_sender_name;

  FOR v_member IN
    SELECT user_id, role FROM public.chat_members
     WHERE chat_id = NEW.chat_id AND user_id <> NEW.sender_id
  LOOP
    INSERT INTO public.alerts (user_id, title, body, order_id)
    VALUES (
      v_member.user_id,
      'New message from ' || v_sender_name,
      LEFT(NEW.message, 100),
      v_order.id
    );
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_chat_participants failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ---- Friend request notifications ----
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  IF NEW.status <> 'pending' THEN RETURN NEW; END IF;

  -- Use user_id (the auth-user FK), not id (profile row id), to find the sender.
  -- The earlier OR clause was a code-smell for schema confusion.
  SELECT COALESCE(full_name, 'Someone') INTO sender_name
    FROM public.profiles
   WHERE user_id = NEW.user_id
   LIMIT 1;

  INSERT INTO public.notifications (
    user_id, title, body, category, channel, status, template, event_type, action_url, metadata
  ) VALUES (
    NEW.friend_id,
    'New Friend Request',
    COALESCE(sender_name, 'Someone') || ' sent you a friend request',
    'account', 'in_app', 'queued', 'friend_request', 'friend_request_received',
    '/user/' || NEW.user_id,
    jsonb_build_object('sender_id', NEW.user_id, 'sender_name', COALESCE(sender_name, 'Someone'))
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_friend_request failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;;
