-- Fix infinite recursion in drivers table policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Drivers can view own profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can insert own profile" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_own" ON public.drivers;

-- Create simple policies using auth.uid() directly (no subqueries to avoid recursion)
CREATE POLICY "drivers_select_policy"
ON public.drivers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "drivers_insert_policy"
ON public.drivers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "drivers_update_policy"
ON public.drivers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "drivers_delete_policy"
ON public.drivers
FOR DELETE
USING (auth.uid() = user_id);

-- Fix infinite recursion in food_orders table policies
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_driver_select" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_driver_update" ON public.food_orders;

-- Create simple policies for food_orders
-- Allow drivers to see orders assigned to them (using driver_id directly)
CREATE POLICY "food_orders_select_policy"
ON public.food_orders
FOR SELECT
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR driver_id IS NULL
);

CREATE POLICY "food_orders_update_policy"
ON public.food_orders
FOR UPDATE
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);;
