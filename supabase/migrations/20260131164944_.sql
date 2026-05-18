-- =============================================
-- FIX 1: Tighten profiles table RLS
-- Remove overlapping/duplicate policies, keep only strict owner+admin access
-- =============================================

-- Drop all existing SELECT policies on profiles (they overlap and create confusion)
DROP POLICY IF EXISTS "profiles_select_owner_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_final_select" ON public.profiles;

-- Create single strict SELECT policy - users can ONLY see their own profile
CREATE POLICY "profiles_owner_only_select" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Revoke direct access from anon to ensure no unauthenticated access
REVOKE ALL ON public.profiles FROM anon;

-- Create a masked public view that excludes PII for any cross-user lookups
-- (e.g., showing a user's display name without exposing email/phone)
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  status,
  created_at
  -- EXCLUDED: email, phone (PII)
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;

-- =============================================
-- FIX 2: Add masked view for driver_earnings
-- Financial data should have additional protection layer
-- =============================================

-- The existing policy is already correct (owner + admin), but add a masked view
-- for any future aggregated/summary access patterns

DROP VIEW IF EXISTS public.driver_earnings_summary;
CREATE VIEW public.driver_earnings_summary
WITH (security_invoker = true)
AS
SELECT 
  id,
  driver_id,
  earning_type,
  net_amount,
  created_at
  -- EXCLUDED from summary: base_amount, tip_amount, bonus_amount, platform_fee, payment_method, is_cash_collected
FROM public.driver_earnings;

-- Only grant to authenticated users - RLS on base table still enforces owner-only access
GRANT SELECT ON public.driver_earnings_summary TO authenticated;

-- Revoke anon access to base table
REVOKE ALL ON public.driver_earnings FROM anon;;
