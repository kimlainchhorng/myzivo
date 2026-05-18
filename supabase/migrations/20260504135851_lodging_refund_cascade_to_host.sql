-- Symmetric to trg_lodging_host_paid_push (host gets the new-booking push):
-- when an async refund clears (PayPal/Square webhook flips payment_status to
-- 'refunded'), push the host that the booking is cancelled and flip the
-- reservation status so the calendar/admin views drop it from active.

CREATE OR REPLACE FUNCTION public.notify_lodging_host_refund() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner uuid;
  v_property text;
  v_url text;
  v_payload jsonb;
BEGIN
  IF NEW.payment_status IS NOT DISTINCT FROM OLD.payment_status THEN
    RETURN NEW;
  END IF;
  -- Only fire when entering refunded (final state). 'refund_pending' is
  -- in-flight and the customer-cancel path already notifies; the webhook is
  -- about the gateway-side completion of an asynchronous refund.
  IF NEW.payment_status <> 'refunded' THEN
    RETURN NEW;
  END IF;
  IF OLD.payment_status = 'refunded' THEN
    RETURN NEW;
  END IF;

  -- Flip reservation status to cancelled if it isn't already terminal. This
  -- removes the booking from the host's active calendar without the synchronous
  -- cancel-lodging-reservation path having had to do it.
  IF NEW.status NOT IN ('cancelled','checked_out','no_show') THEN
    UPDATE public.lodge_reservations
       SET status = 'cancelled'
     WHERE id = NEW.id;
  END IF;

  SELECT r.owner_id, r.name INTO v_owner, v_property
    FROM public.restaurants r WHERE r.id = NEW.store_id;
  IF v_owner IS NULL THEN
    RETURN NEW;
  END IF;

  v_url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-push-notification';
  v_payload := jsonb_build_object(
    'user_id', v_owner,
    'notification_type', 'lodging_refund_completed',
    'title', 'Booking refunded',
    'body', 'A guest''s refund cleared at ' || COALESCE(v_property, 'your property')
            || CASE WHEN NEW.number IS NOT NULL THEN ' (ref ' || NEW.number || ')' ELSE '' END
            || '. The reservation has been cancelled.',
    'data', jsonb_build_object(
      'type','lodging_refund_completed',
      'reservation_id', NEW.id,
      'reservation_number', NEW.number,
      'action_url','/hotel-admin?tab=lodge-reservations'
    )
  );

  BEGIN
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type','application/json'),
      body := v_payload
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[notify_lodging_host_refund] pg_net failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lodging_host_refund_push ON public.lodge_reservations;
CREATE TRIGGER trg_lodging_host_refund_push
  AFTER UPDATE OF payment_status ON public.lodge_reservations
  FOR EACH ROW EXECUTE FUNCTION public.notify_lodging_host_refund();;
