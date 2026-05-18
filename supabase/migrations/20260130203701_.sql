-- Fix profiles table RLS: Remove overly permissive policies and create strict owner-only access

-- Drop existing SELECT policies that may overlap
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_strict_owner" ON public.profiles;

-- Create single, strict SELECT policy: users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure no anonymous access by verifying RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too (prevents bypassing)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;;
