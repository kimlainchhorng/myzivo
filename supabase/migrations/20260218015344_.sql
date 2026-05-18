
-- Create a function that calls the notify-signup edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_new_signup()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  edge_url text;
  service_key text;
BEGIN
  -- Build the webhook payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW)::jsonb
  );

  -- Get the Supabase URL for the edge function
  edge_url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/notify-signup';

  -- Use pg_net to call the edge function asynchronously
  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block the insert if notification fails
    RAISE WARNING 'notify_new_signup failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on drivers table
DROP TRIGGER IF EXISTS trg_notify_new_driver ON public.drivers;
CREATE TRIGGER trg_notify_new_driver
  AFTER INSERT ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_signup();

-- Trigger on restaurants table
DROP TRIGGER IF EXISTS trg_notify_new_restaurant ON public.restaurants;
CREATE TRIGGER trg_notify_new_restaurant
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_signup();
;
