
-- ==========================================
-- Zivo Departments, Cost Centers & Expense Codes
-- ==========================================

-- 1. Departments
CREATE TABLE public.business_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manager_name TEXT,
  manager_email TEXT,
  budget_cents INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view departments"
ON public.business_departments FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can manage departments"
ON public.business_departments FOR ALL TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 2. Cost Centers / Expense Codes
CREATE TABLE public.business_cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.business_departments(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view cost centers"
ON public.business_cost_centers FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can manage cost centers"
ON public.business_cost_centers FOR ALL TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 3. Employee-Department Assignments
CREATE TABLE public.business_employee_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  department_id UUID NOT NULL REFERENCES public.business_departments(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.business_employee_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view assignments"
ON public.business_employee_departments FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can manage assignments"
ON public.business_employee_departments FOR ALL TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 4. Booking expense metadata (links trips to departments/cost centers)
CREATE TABLE public.business_trip_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.business_departments(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.business_cost_centers(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL,
  trip_type TEXT NOT NULL,
  trip_purpose TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_trip_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view trip expenses"
ON public.business_trip_expenses FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business members can create trip expenses"
ON public.business_trip_expenses FOR INSERT TO authenticated
WITH CHECK (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

-- 5. Department expense settings
CREATE TABLE public.business_expense_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  require_expense_code BOOLEAN NOT NULL DEFAULT false,
  require_trip_purpose BOOLEAN NOT NULL DEFAULT false,
  require_department BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

ALTER TABLE public.business_expense_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view expense settings"
ON public.business_expense_settings FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can manage expense settings"
ON public.business_expense_settings FOR ALL TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 6. Triggers
CREATE TRIGGER update_business_departments_updated_at
  BEFORE UPDATE ON public.business_departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_cost_centers_updated_at
  BEFORE UPDATE ON public.business_cost_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_expense_settings_updated_at
  BEFORE UPDATE ON public.business_expense_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Indexes
CREATE INDEX idx_business_departments_business_id ON public.business_departments(business_id);
CREATE INDEX idx_business_cost_centers_business_id ON public.business_cost_centers(business_id);
CREATE INDEX idx_business_cost_centers_department_id ON public.business_cost_centers(department_id);
CREATE INDEX idx_business_employee_departments_business_id ON public.business_employee_departments(business_id);
CREATE INDEX idx_business_employee_departments_department_id ON public.business_employee_departments(department_id);
CREATE INDEX idx_business_trip_expenses_business_id ON public.business_trip_expenses(business_id);
CREATE INDEX idx_business_trip_expenses_department_id ON public.business_trip_expenses(department_id);
CREATE INDEX idx_business_trip_expenses_trip_date ON public.business_trip_expenses(trip_date);
;
