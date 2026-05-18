-- Two more functions with the same channel='push'/'data' column bug. Both
-- have been silently raising on every fire and dropping the notification.

-- 1. notify_order_status_change (triggers on food_orders.status)
-- This one duplicates notify_customer_on_status_change (which I already
-- fixed). Rather than push twice per status change, drop this trigger
-- entirely. Keep the function definition fixed in case something else
-- references it, but unhook the trigger so we don't double-notify.
DROP TRIGGER IF EXISTS trg_notify_order_status ON public.food_orders;

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Kept as a no-op so any external caller doesn't see the function go
  -- missing. The real status push comes from notify_customer_on_status_change.
  RETURN NEW;
END;
$$;

-- 2. notify_ticket_reply (triggers on ticket_replies INSERT)
-- This one has no duplicate, so fix it in place. Bug: channel='push'
-- isn't a valid enum value; data column is metadata; missing required
-- template/category/status NOT NULL fields.
CREATE OR REPLACE FUNCTION public.notify_ticket_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ticket support_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Only push when an admin replies to a non-admin user's ticket.
  IF NEW.is_admin AND v_ticket.user_id IS DISTINCT FROM NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id, channel, category, template, title, body, action_url, status, metadata
    ) VALUES (
      v_ticket.user_id,
      'in_app',
      'transactional',
      'support_reply',
      'Support replied 💬',
      LEFT(COALESCE(NEW.message, ''), 140),
      '/support/tickets/' || NEW.ticket_id::text,
      'sent',
      jsonb_build_object('ticket_id', NEW.ticket_id, 'reply_id', NEW.id)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_ticket_reply failed: %', SQLERRM;
  RETURN NEW;
END;
$$;;
