-- RLS Policies for Driver System Security

-- =============================================
-- DRIVERS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "drivers_read_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view own profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;

-- Drivers can read only their own row
CREATE POLICY "drivers_read_own"
ON public.drivers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Drivers can update only their own row
CREATE POLICY "drivers_update_own"
ON public.drivers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =============================================
-- TRIPS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "drivers_read_assigned_trips" ON public.trips;
DROP POLICY IF EXISTS "drivers_update_assigned_trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can view assigned trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can update assigned trips" ON public.trips;

-- Drivers can read trips assigned to them
CREATE POLICY "drivers_read_assigned_trips"
ON public.trips FOR SELECT
TO authenticated
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR rider_id = auth.uid()
);

-- Drivers can update trips assigned to them
CREATE POLICY "drivers_update_assigned_trips"
ON public.trips FOR UPDATE
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- =============================================
-- FOOD_ORDERS TABLE POLICIES  
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "drivers_read_assigned_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "drivers_update_assigned_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view assigned food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can update assigned food orders" ON public.food_orders;

-- Drivers can read food orders assigned to them
CREATE POLICY "drivers_read_assigned_food_orders"
ON public.food_orders FOR SELECT
TO authenticated
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR customer_id = auth.uid()
);

-- Drivers can update food orders assigned to them
CREATE POLICY "drivers_update_assigned_food_orders"
ON public.food_orders FOR UPDATE
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- =============================================
-- DRIVER_EARNINGS TABLE POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "drivers_read_own_earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers can view own earnings" ON public.driver_earnings;

-- Drivers can read only their own earnings
CREATE POLICY "drivers_read_own_earnings"
ON public.driver_earnings FOR SELECT
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Note: No INSERT policy for authenticated users
-- Only edge functions (service role) can insert earnings records
-- This prevents drivers from manipulating their own earnings;
