
-- 1. lost_item_requests cleanup
DROP POLICY IF EXISTS "Customers can delete own pending requests" ON public.lost_item_requests;
DROP POLICY IF EXISTS "Customers can update own requests" ON public.lost_item_requests;
DROP POLICY IF EXISTS "Users can view own lost item requests" ON public.lost_item_requests;
DROP POLICY IF EXISTS "Drivers can update own requests" ON public.lost_item_requests;

CREATE POLICY "Users can view own lost item requests"
  ON public.lost_item_requests FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR customer_id = auth.uid());

CREATE POLICY "Drivers can update assigned requests"
  ON public.lost_item_requests FOR UPDATE TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Customers can cancel own pending requests"
  ON public.lost_item_requests FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid() AND status = 'cancelled');

-- 2. admin_notifications fix
DROP POLICY IF EXISTS "System and admins can insert notifications"
  ON public.admin_notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.admin_notifications FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- 3. corp_expenses fix (admin-only table, no user_id column)
DROP POLICY IF EXISTS "Anyone can insert corp_expenses" ON public.corp_expenses;
DROP POLICY IF EXISTS "Anyone can update corp_expenses" ON public.corp_expenses;
CREATE POLICY "Admins can insert corp_expenses"
  ON public.corp_expenses FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update corp_expenses"
  ON public.corp_expenses FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
;
