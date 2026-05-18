
-- Create a function to check if login is rate-limited (server-side)
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_failures int;
BEGIN
  SELECT count(*) INTO recent_failures
  FROM public.admin_login_attempts
  WHERE email = lower(trim(_email))
    AND success = false
    AND created_at > now() - interval '5 minutes';

  -- Block if 5+ failures in last 5 minutes
  RETURN recent_failures < 5;
END;
$$;
;
