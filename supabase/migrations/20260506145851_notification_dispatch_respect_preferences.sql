-- Make the central push-dispatch trigger respect three layers of user
-- preferences. Until now it pushed on every row regardless — which would
-- spam users who already turned everything off, and break Telegram-style
-- per-conversation mute.
--
-- Layer 1: notification_preferences.in_app_enabled — master push switch.
--          Transactional notifications (wallet, ride, order) bypass this
--          for safety so the user never misses a payment or ride state.
-- Layer 2: notification_preferences.marketing_enabled — gates category='marketing'.
-- Layer 3: muted_conversations — for DM template, the recipient may have
--          muted the sender (Telegram-style per-chat mute).
--          Group muting is handled via chat_group_members.muted_until.

CREATE OR REPLACE FUNCTION public.tg_dispatch_notification_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI';
  v_url  TEXT := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-push-notification';
  v_in_app_enabled boolean;
  v_marketing_enabled boolean;
  v_category text;
  v_template text;
  v_sender_id text;
  v_group_id  text;
  v_muted boolean;
BEGIN
  IF NEW.user_id IS NULL OR NEW.channel <> 'in_app' OR NEW.status = 'queued' THEN
    RETURN NEW;
  END IF;

  v_category := COALESCE(NEW.category, 'social');
  v_template := COALESCE(NEW.template, '');

  -- Pull the recipient's preferences (defaults to enabled if no row)
  SELECT in_app_enabled, marketing_enabled
    INTO v_in_app_enabled, v_marketing_enabled
    FROM public.notification_preferences
   WHERE user_id = NEW.user_id
   LIMIT 1;

  v_in_app_enabled    := COALESCE(v_in_app_enabled, true);
  v_marketing_enabled := COALESCE(v_marketing_enabled, true);

  -- Marketing always respects the marketing toggle.
  IF v_category = 'marketing' AND NOT v_marketing_enabled THEN RETURN NEW; END IF;

  -- Master switch — but transactional categories (wallet, payments, rides,
  -- orders) bypass it. The user can still turn off pushes per-OS at the
  -- device level if they really don't want any.
  IF NOT v_in_app_enabled AND v_category <> 'transactional' THEN
    RETURN NEW;
  END IF;

  -- Per-conversation mute for DMs (Telegram-style)
  IF v_template = 'direct_message' THEN
    v_sender_id := NEW.metadata ->> 'sender_id';
    IF v_sender_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.muted_conversations
         WHERE user_id = NEW.user_id
           AND conversation_id = v_sender_id
           AND (muted_until IS NULL OR muted_until > now())
      ) INTO v_muted;
      IF v_muted THEN RETURN NEW; END IF;
    END IF;
  END IF;

  -- Per-group mute (chat_group_members.muted_until)
  IF v_template = 'group_added' OR v_template = 'group_message' THEN
    v_group_id := NEW.metadata ->> 'group_id';
    IF v_group_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.chat_group_members
         WHERE user_id = NEW.user_id
           AND group_id::text = v_group_id
           AND muted_until IS NOT NULL
           AND muted_until > now()
      ) INTO v_muted;
      IF v_muted THEN RETURN NEW; END IF;
    END IF;
  END IF;

  -- Fire-and-forget push call
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'notification_type', COALESCE(NEW.template, NEW.category, 'in_app'),
      'title', NEW.title,
      'body', NEW.body,
      'data', jsonb_build_object(
        'notification_id', NEW.id,
        'template', NEW.template,
        'action_url', NEW.action_url,
        'metadata', COALESCE(NEW.metadata, '{}'::jsonb)
      )
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_dispatch_notification_push failed: %', SQLERRM;
  RETURN NEW;
END;
$$;;
