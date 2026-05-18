
-- Pull the project URL + service-role key from a vault-like config table.
-- We don't want to hardcode them in trigger SQL because Supabase rotates
-- service keys and the project URL is environment-specific.
--
-- We rely on the `vault.secrets` schema that Supabase sets up by default; if
-- a row named 'project_url' / 'service_role_key' already exists this is a no-op.
-- (Customers without these populated should set them manually in the dashboard.)

CREATE OR REPLACE FUNCTION public.deliveries_dispatch_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  -- Read the URL/key from vault if present; otherwise just bail quietly so
  -- inserts still succeed even on dev environments without secrets configured.
  BEGIN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1;
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_url := NULL;
    v_key := NULL;
  END;

  IF v_url IS NULL OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_url || '/functions/v1/delivery-dispatch',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'delivery_id', NEW.id,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deliveries_dispatch ON public.deliveries;
CREATE TRIGGER trg_deliveries_dispatch
  AFTER INSERT ON public.deliveries
  FOR EACH ROW
  WHEN (NEW.driver_user_id IS NULL AND NEW.status IN ('requested','pending'))
  EXECUTE FUNCTION public.deliveries_dispatch_after_insert();
;
