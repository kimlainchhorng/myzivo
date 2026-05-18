
-- Recreate v_admin_driver_compliance without auth.users
-- Previously used auth.users for id and email; now uses drivers table
DROP VIEW IF EXISTS public.v_admin_driver_compliance;

CREATE VIEW public.v_admin_driver_compliance
WITH (security_invoker = true)
AS
SELECT 
  d.id AS driver_id,
  d.email,
  COALESCE(sa.payouts_enabled, false) AS payouts_enabled,
  COALESCE(sa.charges_enabled, false) AS charges_enabled,
  COALESCE(sa.details_submitted, false) AS details_submitted,
  sa.stripe_account_id,
  COALESCE(ds.is_online, false) AS is_online,
  COALESCE(ds.is_busy, false) AS is_busy,
  ds.driver_state,
  ds.paused_until,
  ds.last_seen,
  ds.lat,
  ds.lng
FROM drivers d
LEFT JOIN driver_stripe_accounts sa ON sa.driver_id = d.id
LEFT JOIN drivers_status ds ON ds.driver_id = d.id;

-- Recreate v_driver_phone_status without auth.users
-- Previously used auth.users for phone/phone_confirmed_at; now uses profiles table
DROP VIEW IF EXISTS public.v_driver_phone_status;

CREATE VIEW public.v_driver_phone_status
WITH (security_invoker = true)
AS
SELECT
  p.user_id AS driver_id,
  p.phone,
  p.phone_verified_at AS phone_confirmed_at,
  (p.phone_verified_at IS NOT NULL) AS is_verified
FROM profiles p;
;
