CREATE OR REPLACE FUNCTION public.tg_creator_subscription_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_creator_name text;
BEGIN
  IF NEW.status IS NULL OR NEW.status = COALESCE(OLD.status, '') THEN RETURN NEW; END IF;
  v_creator_name := public.actor_display_name(NEW.creator_id);

  IF NEW.subscriber_id IS NOT NULL THEN
    IF LOWER(NEW.status) = 'active' THEN
      INSERT INTO public.notifications
        (user_id, channel, category, template, title, body, action_url, status, metadata)
      VALUES
        (NEW.subscriber_id, 'in_app', 'transactional', 'creator_sub_active',
         'Subscription active',
         'You are now subscribed to ' || COALESCE(v_creator_name, 'a creator'),
         '/u/' || NEW.creator_id::text, 'sent',
         jsonb_build_object('subscription_id', NEW.id, 'creator_id', NEW.creator_id));
    ELSIF LOWER(NEW.status) IN ('cancelled','canceled') THEN
      INSERT INTO public.notifications
        (user_id, channel, category, template, title, body, action_url, status, metadata)
      VALUES
        (NEW.subscriber_id, 'in_app', 'transactional', 'creator_sub_cancelled',
         'Subscription cancelled',
         'Your subscription to ' || COALESCE(v_creator_name, 'a creator') || ' was cancelled. Access continues until ' ||
           COALESCE(to_char(NEW.expires_at AT TIME ZONE 'UTC', 'Mon DD'), 'period end') || '.',
         '/account/subscriptions', 'sent',
         jsonb_build_object('subscription_id', NEW.id, 'creator_id', NEW.creator_id));
    ELSIF LOWER(NEW.status) = 'expired' THEN
      INSERT INTO public.notifications
        (user_id, channel, category, template, title, body, action_url, status, metadata)
      VALUES
        (NEW.subscriber_id, 'in_app', 'transactional', 'creator_sub_expired',
         'Subscription ended',
         'Your subscription to ' || COALESCE(v_creator_name, 'a creator') || ' has ended.',
         '/u/' || NEW.creator_id::text, 'sent',
         jsonb_build_object('subscription_id', NEW.id, 'creator_id', NEW.creator_id));
    ELSIF LOWER(NEW.status) = 'past_due' THEN
      INSERT INTO public.notifications
        (user_id, channel, category, template, title, body, action_url, status, metadata)
      VALUES
        (NEW.subscriber_id, 'in_app', 'transactional', 'creator_sub_past_due',
         'Payment problem',
         'We could not bill your card for ' || COALESCE(v_creator_name, 'creator') || '. Update payment to keep access.',
         '/wallet?tab=cards', 'sent',
         jsonb_build_object('subscription_id', NEW.id, 'creator_id', NEW.creator_id));
    END IF;
  END IF;

  IF NEW.creator_id IS NOT NULL AND LOWER(NEW.status) = 'active' AND LOWER(COALESCE(OLD.status,'')) <> 'active' THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.creator_id, 'in_app', 'social', 'new_subscriber',
       public.actor_display_name(NEW.subscriber_id) || ' subscribed to you',
       'Open your creator dashboard to see them.',
       '/creator/dashboard', 'sent',
       jsonb_build_object('subscriber_id', NEW.subscriber_id, 'subscription_id', NEW.id));
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_creator_subscription_notify failed: %', SQLERRM;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS creator_subscription_notify_trg ON public.creator_subscriptions;
CREATE TRIGGER creator_subscription_notify_trg
AFTER INSERT OR UPDATE OF status ON public.creator_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.tg_creator_subscription_notify();

CREATE OR REPLACE FUNCTION public.tg_membership_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status = COALESCE(OLD.status, '') THEN RETURN NEW; END IF;
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  IF LOWER(NEW.status) = 'active' THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.user_id, 'in_app', 'transactional', 'membership_active',
       'Membership active',
       CASE WHEN NEW.current_period_end IS NOT NULL
            THEN 'Renews ' || to_char(NEW.current_period_end AT TIME ZONE 'UTC', 'Mon DD')
            ELSE 'Your membership is active' END,
       '/account/subscriptions', 'sent',
       jsonb_build_object('membership_id', NEW.id, 'plan_id', NEW.plan_id));
  ELSIF LOWER(NEW.status) IN ('cancelled','canceled') THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.user_id, 'in_app', 'transactional', 'membership_cancelled',
       'Membership cancelled',
       CASE WHEN NEW.current_period_end IS NOT NULL
            THEN 'Access continues until ' || to_char(NEW.current_period_end AT TIME ZONE 'UTC', 'Mon DD')
            ELSE 'Your membership is cancelled' END,
       '/account/subscriptions', 'sent',
       jsonb_build_object('membership_id', NEW.id, 'plan_id', NEW.plan_id, 'period_end', NEW.current_period_end));
  ELSIF LOWER(NEW.status) IN ('expired','ended') THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.user_id, 'in_app', 'transactional', 'membership_expired',
       'Membership expired',
       'Your membership has ended. Tap to renew.',
       '/account/subscriptions', 'sent',
       jsonb_build_object('membership_id', NEW.id));
  ELSIF LOWER(NEW.status) = 'past_due' THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (NEW.user_id, 'in_app', 'transactional', 'membership_past_due',
       'Payment problem',
       'We could not bill your card. Update payment to keep your membership.',
       '/wallet?tab=cards', 'sent',
       jsonb_build_object('membership_id', NEW.id));
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_membership_notify failed: %', SQLERRM;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS membership_notify_trg ON public.memberships;
CREATE TRIGGER membership_notify_trg
AFTER INSERT OR UPDATE OF status ON public.memberships
FOR EACH ROW EXECUTE FUNCTION public.tg_membership_notify();

CREATE OR REPLACE FUNCTION public.tg_zivo_sub_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_body text;
BEGIN
  IF NEW.status IS NULL OR NEW.status = COALESCE(OLD.status, '') THEN RETURN NEW; END IF;
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  v_body := CASE
    WHEN LOWER(NEW.status) = 'active' AND NEW.current_period_end IS NOT NULL
      THEN 'Renews ' || to_char(NEW.current_period_end AT TIME ZONE 'UTC', 'Mon DD')
    WHEN LOWER(NEW.status) = 'active' THEN 'Your ZIVO subscription is active'
    WHEN LOWER(NEW.status) IN ('cancelled','canceled') THEN 'Your ZIVO subscription was cancelled.'
    WHEN LOWER(NEW.status) IN ('expired','ended') THEN 'Your ZIVO subscription has ended.'
    WHEN LOWER(NEW.status) = 'past_due' THEN 'Payment failed. Update your card to keep ZIVO.'
    ELSE 'Status: ' || NEW.status
  END;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.user_id, 'in_app', 'transactional',
     'zivo_sub_' || LOWER(NEW.status),
     'ZIVO ' || initcap(NEW.status),
     v_body,
     '/account/subscriptions', 'sent',
     jsonb_build_object('subscription_id', NEW.id, 'plan_id', NEW.plan_id, 'status', NEW.status));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_zivo_sub_notify failed: %', SQLERRM;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS zivo_subscription_notify_trg ON public.zivo_subscriptions;
CREATE TRIGGER zivo_subscription_notify_trg
AFTER INSERT OR UPDATE OF status ON public.zivo_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.tg_zivo_sub_notify();;
