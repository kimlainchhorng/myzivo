-- Auto-dispatch push notifications on every new in_app notification.
--
-- Why: every place in the app that wants someone to get a push has to
-- separately call send-push-notification. This works for hand-rolled
-- flows (process-withdrawal does it), but every NEW notification I've
-- inserted (mention, channel post, channel comment, P2P, topup) has been
-- in_app-only — offline users never see it.
--
-- The trigger calls send-push-notification asynchronously via pg_net so
-- the parent INSERT never blocks. send-push-notification de-dupes per
-- device and silently no-ops for users without a registered device, so
-- this is safe to fire on every row.

CREATE OR REPLACE FUNCTION public.tg_dispatch_notification_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI';
  v_url  TEXT := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-push-notification';
BEGIN
  -- Only for in_app notifications targeted at a user. Skip drafts (queued).
  IF NEW.user_id IS NULL OR NEW.channel <> 'in_app' OR NEW.status = 'queued' THEN
    RETURN NEW;
  END IF;

  -- Fire and forget. pg_net handles retries; we don't want to block the
  -- parent transaction on the HTTP roundtrip.
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
  -- Never block the insert because of a dispatch failure. Log and move on.
  RAISE WARNING 'tg_dispatch_notification_push failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_push_dispatch ON public.notifications;
CREATE TRIGGER notifications_push_dispatch
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.tg_dispatch_notification_push();;
