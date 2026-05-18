-- Fix register_trusted_device — the original function referenced columns that
-- don't exist on the live trusted_devices table:
--   * last_used_at  → real column is `last_used`
--   * ip_address    → no such column on this table (lives on login_sessions instead)
-- Result: every call from VerifyNewDevice has been silently failing, which is
-- why the trusted_devices table is empty in production and users keep getting
-- the OTP prompt even after ticking "trust this device".
--
-- Also: set is_active=true on every (re)trust so the AccountSessions
-- "Trusted devices" UI (which filters is_active=true) actually shows the row.
-- Also: pass through device_type so we can label rows nicely in the UI.

CREATE OR REPLACE FUNCTION public.register_trusted_device(
  _user_id UUID,
  _device_fingerprint TEXT,
  _device_name TEXT DEFAULT NULL,
  _device_type TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL  -- accepted for backwards-compat; ignored
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trusted_devices (
    user_id, device_fingerprint, device_name, device_type, last_used, is_active
  )
  VALUES (
    _user_id, _device_fingerprint, _device_name, _device_type, now(), true
  )
  ON CONFLICT (user_id, device_fingerprint)
  DO UPDATE SET
    last_used   = now(),
    is_active   = true,
    device_name = COALESCE(EXCLUDED.device_name, public.trusted_devices.device_name),
    device_type = COALESCE(EXCLUDED.device_type, public.trusted_devices.device_type);
END;
$$;

REVOKE ALL ON FUNCTION public.register_trusted_device(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_trusted_device(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;;
