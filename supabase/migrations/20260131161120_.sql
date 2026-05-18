-- Fix: Drop existing policies that weren't caught, then secure drivers table

-- Drop remaining profiles policies
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_restricted" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_restricted" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_restricted" ON public.profiles;

-- Recreate profiles policies
CREATE POLICY "profiles_select_restricted" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_insert_restricted" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_restricted" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_admin_only" ON public.profiles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing drivers policies
DROP POLICY IF EXISTS "drivers_select_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_admin_only" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can read their own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON public.drivers;

-- Ensure RLS is enabled
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Recreate strict drivers policies
CREATE POLICY "drivers_select_restricted" ON public.drivers
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "drivers_insert_restricted" ON public.drivers
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "drivers_update_restricted" ON public.drivers
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "drivers_delete_admin_only" ON public.drivers
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke public access
REVOKE ALL ON public.drivers FROM anon;
REVOKE ALL ON public.drivers FROM public;

-- Create public view for customers needing driver info during active orders
DROP VIEW IF EXISTS public.drivers_public;
CREATE VIEW public.drivers_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  SPLIT_PART(full_name, ' ', 1) AS first_name,
  vehicle_type,
  rating,
  is_online,
  avatar_url,
  created_at
FROM public.drivers;

GRANT SELECT ON public.drivers_public TO authenticated;;
