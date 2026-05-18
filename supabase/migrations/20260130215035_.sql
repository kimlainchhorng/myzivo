-- Clean up driver_location_history RLS policies
-- Remove all existing policies and create proper restrictive ones
DROP POLICY IF EXISTS "Drivers can insert location updates" ON public.driver_location_history;
DROP POLICY IF EXISTS "Drivers can insert their own location history" ON public.driver_location_history;
DROP POLICY IF EXISTS "Drivers can view their own location history" ON public.driver_location_history;
DROP POLICY IF EXISTS "driver_location_history_own_only" ON public.driver_location_history;
DROP POLICY IF EXISTS "location_history_restricted" ON public.driver_location_history;

-- SELECT: Only the driver themselves or admins can view location history
CREATE POLICY "location_history_select_restricted" ON public.driver_location_history
FOR SELECT
TO authenticated
USING (
  driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- INSERT: Only the driver can insert their own location records
CREATE POLICY "location_history_insert_own" ON public.driver_location_history
FOR INSERT
TO authenticated
WITH CHECK (
  driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
);

-- DELETE: Only admins can delete (for data cleanup/GDPR requests)
CREATE POLICY "location_history_delete_admin" ON public.driver_location_history
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke public/anon access
REVOKE ALL ON public.driver_location_history FROM anon;
REVOKE ALL ON public.driver_location_history FROM public;;
