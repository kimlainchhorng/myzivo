-- Create is_admin() security definer function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Admin policies for admin_audit_logs (immutable - no update/delete)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin policies for restaurants
DROP POLICY IF EXISTS "Admins have full access to restaurants" ON public.restaurants;
CREATE POLICY "Admins have full access to restaurants"
  ON public.restaurants
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for drivers
DROP POLICY IF EXISTS "Admins have full access to drivers" ON public.drivers;
CREATE POLICY "Admins have full access to drivers"
  ON public.drivers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for food_orders
DROP POLICY IF EXISTS "Admins have full access to food_orders" ON public.food_orders;
CREATE POLICY "Admins have full access to food_orders"
  ON public.food_orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for refunds
DROP POLICY IF EXISTS "Admins have full access to refunds" ON public.refunds;
CREATE POLICY "Admins have full access to refunds"
  ON public.refunds
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for order_ratings
DROP POLICY IF EXISTS "Admins have full access to order_ratings" ON public.order_ratings;
CREATE POLICY "Admins have full access to order_ratings"
  ON public.order_ratings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for payouts
DROP POLICY IF EXISTS "Admins have full access to payouts" ON public.payouts;
CREATE POLICY "Admins have full access to payouts"
  ON public.payouts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for pricing_config
DROP POLICY IF EXISTS "Admins have full access to pricing_config" ON public.pricing_config;
CREATE POLICY "Admins have full access to pricing_config"
  ON public.pricing_config
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for user_roles (admins can manage roles)
DROP POLICY IF EXISTS "Admins can view user_roles" ON public.user_roles;
CREATE POLICY "Admins can view user_roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
CREATE POLICY "Admins can insert user_roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "Admins can delete user_roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());;
