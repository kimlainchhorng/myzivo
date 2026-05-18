
-- Corporate expenses table for employee reimbursements
CREATE TABLE public.corp_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_initials TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('ride', 'meals', 'travel', 'other')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'clarification')),
  has_receipt BOOLEAN NOT NULL DEFAULT false,
  receipt_url TEXT,
  approved_by TEXT,
  reimbursed_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corp_expenses ENABLE ROW LEVEL SECURITY;

-- Public read for dashboard (no auth yet)
CREATE POLICY "Anyone can read corp_expenses" ON public.corp_expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert corp_expenses" ON public.corp_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update corp_expenses" ON public.corp_expenses FOR UPDATE USING (true);

-- Updated_at trigger
CREATE TRIGGER update_corp_expenses_updated_at
  BEFORE UPDATE ON public.corp_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_corp_expenses_status ON public.corp_expenses(status);
CREATE INDEX idx_corp_expenses_category ON public.corp_expenses(category);
CREATE INDEX idx_corp_expenses_date ON public.corp_expenses(expense_date DESC);

-- Seed data
INSERT INTO public.corp_expenses (employee_name, employee_initials, category, description, amount, expense_date, department, status, has_receipt, approved_by, reimbursed_date, note) VALUES
  ('Alice Johnson', 'AJ', 'travel', 'Flight to Chicago — client meeting', 485.00, '2026-02-12', 'Sales', 'pending', true, NULL, NULL, NULL),
  ('Bob Smith', 'BS', 'meals', 'Team lunch — Q1 planning', 142.50, '2026-02-11', 'Engineering', 'approved', true, 'Sarah Chen', NULL, NULL),
  ('Carol White', 'CW', 'ride', 'Ride to airport — SFO', 68.00, '2026-02-11', 'Sales', 'reimbursed', true, 'James Rivera', '2026-02-13', NULL),
  ('David Lee', 'DL', 'other', 'Office supplies — standing desk converter', 320.00, '2026-02-10', 'Engineering', 'rejected', true, 'Sarah Chen', NULL, 'Exceeds $200 limit for office supplies'),
  ('Eva Martinez', 'EM', 'meals', 'Client dinner — Pinnacle Finance', 215.00, '2026-02-10', 'Finance', 'clarification', false, NULL, NULL, 'Please upload receipt'),
  ('Frank Brown', 'FB', 'travel', 'Hotel — 2 nights Austin conference', 890.00, '2026-02-09', 'Operations', 'approved', true, 'Mike Torres', NULL, NULL),
  ('Alice Johnson', 'AJ', 'ride', 'Ride from hotel to venue', 24.50, '2026-02-09', 'Sales', 'reimbursed', true, 'James Rivera', '2026-02-12', NULL),
  ('Bob Smith', 'BS', 'other', 'Software license — design tools', 49.99, '2026-02-08', 'Engineering', 'pending', true, NULL, NULL, NULL);
;
