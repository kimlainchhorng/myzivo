
-- Driver payments to ZIVO company (fees, commissions, etc.)
CREATE TABLE public.driver_company_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'commission' CHECK (type IN ('commission', 'platform_fee', 'penalty', 'adjustment', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  period_start DATE,
  period_end DATE,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_company_payments ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own payments
CREATE POLICY "Drivers can view own company payments"
  ON public.driver_company_payments
  FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_driver_company_payments_driver ON public.driver_company_payments(driver_id);
CREATE INDEX idx_driver_company_payments_status ON public.driver_company_payments(status);
;
