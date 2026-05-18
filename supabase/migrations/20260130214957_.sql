-- Fix profiles table RLS policies to ensure proper access control
-- Drop existing policies with public role access
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Recreate policies with proper role restrictions (authenticated only)
-- SELECT: Only profile owner or admin can view
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR auth.uid() = id 
  OR public.has_role(auth.uid(), 'admin')
);

-- INSERT: Only the user can create their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only profile owner can update their profile
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Only admins can delete profiles (security measure)
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can do all operations
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Revoke any public access to the table (belt and suspenders)
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;;
