-- Telegram-style verified channel badge. Set by platform admins via the
-- existing `is_admin()` predicate (no separate role here). Owners can read
-- the flag but cannot self-verify.
ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_channels_verified
  ON public.channels (is_verified) WHERE is_verified = true;

-- Admin-only RPC. Uses the existing `is_admin()` helper if present; otherwise
-- it bails. Toggling sets/clears the audit fields.
CREATE OR REPLACE FUNCTION public.set_channel_verified(p_channel_id uuid, p_verified boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;

  -- Resolve admin via is_admin() if it exists; otherwise check
  -- public.user_roles for role='admin'. Either pattern works.
  BEGIN
    EXECUTE 'SELECT public.is_admin(auth.uid())' INTO v_is_admin;
  EXCEPTION WHEN undefined_function THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO v_is_admin;
  END;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin only'; END IF;

  IF p_verified THEN
    UPDATE public.channels
       SET is_verified = true, verified_at = now(), verified_by = auth.uid()
     WHERE id = p_channel_id;
  ELSE
    UPDATE public.channels
       SET is_verified = false, verified_at = NULL, verified_by = NULL
     WHERE id = p_channel_id;
  END IF;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_channel_verified(uuid, boolean) TO authenticated;;
