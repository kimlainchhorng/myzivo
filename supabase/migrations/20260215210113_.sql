
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = COALESCE(user_uuid, auth.uid())
      AND role = 'admin'
  );
$$;
;
