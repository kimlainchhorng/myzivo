-- Admin access to business cost centers
CREATE POLICY "admin_all_business_cost_centers"
  ON public.business_cost_centers FOR ALL
  USING (is_admin(auth.uid()));

-- Admin access to business departments
CREATE POLICY "admin_all_business_departments"
  ON public.business_departments FOR ALL
  USING (is_admin(auth.uid()));

-- Admin access to business trip expenses
CREATE POLICY "admin_all_business_trip_expenses"
  ON public.business_trip_expenses FOR ALL
  USING (is_admin(auth.uid()));;
