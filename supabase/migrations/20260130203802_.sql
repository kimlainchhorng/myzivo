-- Fix transactions table RLS: Remove overlapping policies and create strict participant-only access

-- Drop existing SELECT policies that may overlap
DROP POLICY IF EXISTS "Drivers view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Drivers view trip transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_participant_only" ON public.transactions;
DROP POLICY IF EXISTS "transactions_restricted" ON public.transactions;

-- Create single, strict SELECT policy: only participants (user, driver, or admin) can view
CREATE POLICY "Participants can view their transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM drivers d 
    WHERE d.id = transactions.driver_id 
    AND d.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = transactions.restaurant_id 
    AND r.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure no anonymous access by verifying RLS is enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too (prevents bypassing)
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;;
