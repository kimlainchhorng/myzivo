-- Drop all conflicting/duplicate SELECT policies on drivers
DROP POLICY IF EXISTS "Admins can manage all drivers" ON public.drivers;
DROP POLICY IF EXISTS "customer_view_assigned_driver_location" ON public.drivers;
DROP POLICY IF EXISTS "drivers_final_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_own_only" ON public.drivers;
DROP POLICY IF EXISTS "drivers_owner_access" ON public.drivers;
DROP POLICY IF EXISTS "drivers_read_authed" ON public.drivers;
DROP POLICY IF EXISTS "drivers_read_own" ON public.drivers;

-- Drop duplicate UPDATE policies
DROP POLICY IF EXISTS "Drivers can update their own record" ON public.drivers;
DROP POLICY IF EXISTS "drivers_final_update" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_self" ON public.drivers;

-- Drop duplicate INSERT policies
DROP POLICY IF EXISTS "drivers_final_insert" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_self" ON public.drivers;
DROP POLICY IF EXISTS "drivers_self_registration" ON public.drivers;

-- Drop duplicate DELETE policies
DROP POLICY IF EXISTS "drivers_final_delete" ON public.drivers;

-- Create clean, non-recursive policies

-- SELECT: Driver can see own record, admin can see all
CREATE POLICY "drivers_select_policy" ON public.drivers
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow customers to see limited driver info for active orders (without recursion)
CREATE POLICY "drivers_customer_tracking" ON public.drivers
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT driver_id FROM trips 
      WHERE rider_id = auth.uid() 
        AND status IN ('accepted', 'en_route', 'arrived', 'in_progress')
    )
    OR id IN (
      SELECT driver_id FROM food_orders 
      WHERE customer_id = auth.uid() 
        AND status IN ('confirmed', 'in_progress', 'ready_for_pickup')
    )
  );

-- INSERT: Users can register themselves as drivers
CREATE POLICY "drivers_insert_policy" ON public.drivers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Drivers update own record
CREATE POLICY "drivers_update_policy" ON public.drivers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Only admins can delete
CREATE POLICY "drivers_delete_policy" ON public.drivers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));;
