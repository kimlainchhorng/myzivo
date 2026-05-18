-- Step 1: Create SECURITY DEFINER function to check customer visibility
-- This bypasses RLS on trips/food_orders, breaking the recursion cycle
CREATE OR REPLACE FUNCTION public.customer_can_view_driver(_driver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.driver_id = _driver_id
      AND trips.rider_id = auth.uid()
      AND trips.status IN ('accepted', 'en_route', 'arrived', 'in_progress')
  )
  OR EXISTS (
    SELECT 1 FROM public.food_orders
    WHERE food_orders.driver_id = _driver_id
      AND food_orders.customer_id = auth.uid()
      AND food_orders.status IN ('confirmed', 'in_progress', 'ready_for_pickup')
  )
$$;

-- Step 2: Drop the recursive policy
DROP POLICY IF EXISTS "drivers_customer_tracking" ON public.drivers;

-- Step 3: Recreate with the SECURITY DEFINER function call
CREATE POLICY "drivers_customer_tracking"
ON public.drivers FOR SELECT
TO authenticated
USING (public.customer_can_view_driver(id));;
