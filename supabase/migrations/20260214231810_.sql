
-- risk_status: admin read + update
CREATE POLICY "admin_select_risk_status"
  ON public.risk_status FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "admin_update_risk_status"
  ON public.risk_status FOR UPDATE
  USING (is_admin(auth.uid()));

-- customer_profiles: admin read
CREATE POLICY "admin_select_customer_profiles"
  ON public.customer_profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- user_devices: admin read
CREATE POLICY "admin_select_user_devices"
  ON public.user_devices FOR SELECT
  USING (is_admin(auth.uid()));

-- drivers_status: admin read + update
CREATE POLICY "admin_select_drivers_status"
  ON public.drivers_status FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "admin_update_drivers_status"
  ON public.drivers_status FOR UPDATE
  USING (is_admin(auth.uid()));

-- driver_profiles: admin read
CREATE POLICY "admin_select_driver_profiles"
  ON public.driver_profiles FOR SELECT
  USING (is_admin(auth.uid()));
;
