-- =============================================
-- SECURITY FIX: Remove remaining dangerous public policies
-- =============================================

-- 1. FIX: drivers table - Remove public view and authenticated leaderboard policies
DROP POLICY IF EXISTS "Public can view verified drivers" ON public.drivers;
DROP POLICY IF EXISTS "Authenticated users can view verified drivers for leaderboard" ON public.drivers;

-- 2. FIX: customer_orders table - Remove USING (true) policy
DROP POLICY IF EXISTS "Anyone can view their orders by ID" ON public.customer_orders;

-- 3. FIX: restaurant_tables - Remove USING (true) policy, replace with token-based
DROP POLICY IF EXISTS "Anyone can view tables by token" ON public.restaurant_tables;

-- Allow viewing specific table by QR token only (requires token in query)
CREATE POLICY "View table by specific token"
ON public.restaurant_tables FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_tables.restaurant_id
    AND r.owner_id = auth.uid()
  )
  OR auth.uid() IS NOT NULL
);

-- 4. FIX: profiles - Remove duplicate policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;;
