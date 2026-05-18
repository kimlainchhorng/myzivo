-- Push customer through every meaningful ride state change.
-- Until now ride_requests had zero customer-facing notification triggers,
-- so riders had no idea when a driver accepted, was on the way, arrived,
-- or finished — unless they had the app open in the foreground.
--
-- The notifications row is dropped via the central `notifications` table,
-- which means our existing dispatch trigger automatically fans it out as
-- a push to the rider's registered devices.

CREATE OR REPLACE FUNCTION public.tg_ride_status_notify_rider()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_body  text;
  v_template text;
  v_driver_name text;
BEGIN
  -- Only on actual status transitions
  IF NEW.status IS NULL OR NEW.status = COALESCE(OLD.status, '') THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  -- Best-effort driver name (skip if profile lookup fails)
  IF NEW.assigned_driver_id IS NOT NULL THEN
    BEGIN
      SELECT COALESCE(full_name, username, 'your driver')
        INTO v_driver_name
        FROM public.public_profiles
       WHERE user_id = NEW.assigned_driver_id
       LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_driver_name := 'your driver';
    END;
  END IF;
  v_driver_name := COALESCE(v_driver_name, 'your driver');

  -- Map status → human copy. Anything we don't recognize is silently ignored.
  CASE LOWER(NEW.status)
    WHEN 'searching' THEN
      v_template := 'ride_searching';
      v_title := 'Finding a driver';
      v_body  := 'We are matching you with the closest driver.';
    WHEN 'assigned', 'accepted', 'driver_assigned' THEN
      v_template := 'ride_assigned';
      v_title := v_driver_name || ' accepted your ride';
      v_body  := 'They are heading to your pickup now.';
    WHEN 'en_route_to_pickup', 'en_route', 'on_the_way' THEN
      v_template := 'ride_en_route';
      v_title := v_driver_name || ' is on the way';
      v_body  := COALESCE(NEW.pickup_address, 'Heading to pickup');
    WHEN 'arrived', 'arrived_at_pickup' THEN
      v_template := 'ride_arrived';
      v_title := v_driver_name || ' has arrived';
      v_body  := 'Your driver is at the pickup spot.';
    WHEN 'in_progress', 'picked_up', 'on_trip' THEN
      v_template := 'ride_in_progress';
      v_title := 'Trip started';
      v_body  := COALESCE('Heading to ' || NEW.dropoff_address, 'On your way');
    WHEN 'completed' THEN
      v_template := 'ride_completed';
      v_title := 'Trip completed';
      v_body  := 'Thanks for riding with ZIVO. Tap to rate and tip.';
    WHEN 'cancelled' THEN
      v_template := 'ride_cancelled';
      v_title := 'Ride cancelled';
      v_body  := 'Your ride was cancelled.';
    WHEN 'no_drivers' THEN
      v_template := 'ride_no_drivers';
      v_title := 'No drivers nearby';
      v_body  := 'We could not find a driver. Try again or schedule for later.';
    ELSE
      RETURN NEW;
  END CASE;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.user_id, 'in_app', 'transactional', v_template,
     v_title, v_body,
     '/rides/' || NEW.id::text,
     'sent',
     jsonb_build_object(
       'ride_id', NEW.id,
       'status', NEW.status,
       'driver_id', NEW.assigned_driver_id
     ));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ride_status_notify_rider_trg ON public.ride_requests;
CREATE TRIGGER ride_status_notify_rider_trg
AFTER UPDATE OF status ON public.ride_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_ride_status_notify_rider();;
