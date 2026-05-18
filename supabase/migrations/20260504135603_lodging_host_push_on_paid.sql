-- Push the property owner when a lodging reservation payment confirms.
-- Symmetric to trg_food_orders_notify_merchant. The guest is already notified
-- by the existing notifyLodgingBookingConfirmed helper; the host wasn't.

CREATE OR REPLACE FUNCTION public.notify_lodging_host_new_paid_booking() RETURNS trigger
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
  -- Fire on first move to a settled state. authorized counts because the host
  -- needs to know to expect the guest even before final capture.
  IF NEW.payment_status NOT IN ('paid', 'captured', 'authorized') THEN
    RETURN NEW;
  END IF;
  -- Don't double-fire if it was already in a settled state.
  IF OLD.payment_status IN ('paid', 'captured', 'authorized') THEN
    RETURN NEW;
  END IF;

  SELECT r.owner_id, r.name INTO v_owner, v_property
    FROM public.restaurants r WHERE r.id = NEW.store_id;
  IF v_owner IS NULL THEN
    RETURN NEW;
  END IF;

  v_url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-push-notification';
  v_payload := jsonb_build_object(
    'user_id', v_owner,
    'notification_type', 'new_paid_booking',
    'title', 'New booking 🏨',
    'body', 'A guest just confirmed a stay at ' || COALESCE(v_property, 'your property') ||
            CASE WHEN NEW.check_in IS NOT NULL
                 THEN ' for ' || to_char(NEW.check_in, 'Mon DD')
                 ELSE '' END || '.',
    'data', jsonb_build_object(
      'type','new_paid_booking',
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
    RAISE WARNING '[notify_lodging_host_new_paid_booking] pg_net call failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lodging_host_paid_push ON public.lodge_reservations;
CREATE TRIGGER trg_lodging_host_paid_push
  AFTER UPDATE OF payment_status ON public.lodge_reservations
  FOR EACH ROW EXECUTE FUNCTION public.notify_lodging_host_new_paid_booking();;
