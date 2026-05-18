
-- Fix 4 functions missing search_path (prevents search path injection attacks)
ALTER FUNCTION public.set_health_status_updated_at() SET search_path = public;
ALTER FUNCTION public.set_maintenance_updated_at() SET search_path = public;
ALTER FUNCTION public.update_business_account_timestamp() SET search_path = public;
ALTER FUNCTION public.update_kyc_submissions_updated_at() SET search_path = public;
;
