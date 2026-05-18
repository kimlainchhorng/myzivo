
-- Fix: Restrict fare_calculations SELECT to admins only
DROP POLICY IF EXISTS "Admins can view all fare calculations" ON public.fare_calculations;
CREATE POLICY "Admins only fare calculations" ON public.fare_calculations
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Fix: Restrict dispatch_settings SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can read dispatch settings" ON public.dispatch_settings;
CREATE POLICY "Admins only dispatch settings" ON public.dispatch_settings
  FOR SELECT USING (public.is_admin(auth.uid()));
;
