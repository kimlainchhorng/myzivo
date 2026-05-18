-- Fix RLS infinite recursion by making has_role() bypass RLS
-- This allows it to check user_roles without triggering recursive policy checks

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- Bypasses RLS to prevent recursion
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;;
