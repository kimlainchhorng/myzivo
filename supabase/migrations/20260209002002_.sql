-- Fix overly permissive RLS policies with WITH CHECK (true)
-- These policies allow any user to insert any data without validation

-- 1. Fix points_ledger INSERT policy
-- Points should only be inserted by service_role (backend operations)
-- Current policy allows public to insert with no restrictions - major security issue
DROP POLICY IF EXISTS "Service can insert points ledger" ON public.points_ledger;
CREATE POLICY "Service role can insert points ledger"
ON public.points_ledger FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Fix ride_quotes INSERT policy
-- Users should only be able to insert quotes for themselves
DROP POLICY IF EXISTS "Users can insert ride_quotes" ON public.ride_quotes;
CREATE POLICY "Users can insert own ride_quotes"
ON public.ride_quotes FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL 
  OR user_id = auth.uid()
);

-- Also allow anonymous users to insert quotes (for non-logged-in price checks)
-- but only with null user_id
CREATE POLICY "Anonymous can insert ride_quotes without user_id"
ON public.ride_quotes FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);;
