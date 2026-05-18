-- Create finance_ledger table for normalized money events
CREATE TABLE public.finance_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('order_paid', 'driver_payout', 'restaurant_payout', 'refund', 'adjustment', 'chargeback')),
  order_id UUID NULL REFERENCES public.food_orders(id) ON DELETE SET NULL,
  restaurant_id UUID NULL REFERENCES public.restaurants(id) ON DELETE SET NULL,
  driver_id UUID NULL REFERENCES public.drivers(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  meta JSONB NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_finance_ledger_occurred_at ON public.finance_ledger(occurred_at);
CREATE INDEX idx_finance_ledger_event_type ON public.finance_ledger(event_type);
CREATE INDEX idx_finance_ledger_restaurant_id ON public.finance_ledger(restaurant_id);
CREATE INDEX idx_finance_ledger_driver_id ON public.finance_ledger(driver_id);
CREATE INDEX idx_finance_ledger_order_id ON public.finance_ledger(order_id);

-- Enable RLS
ALTER TABLE public.finance_ledger ENABLE ROW LEVEL SECURITY;

-- Admin-only read access policy
CREATE POLICY "Admin users can read finance ledger"
ON public.finance_ledger
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Admin-only insert access policy
CREATE POLICY "Admin users can insert finance ledger"
ON public.finance_ledger
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create monthly_reports table for generated snapshots
CREATE TABLE public.monthly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  gross_cents INTEGER NOT NULL DEFAULT 0,
  tips_cents INTEGER NOT NULL DEFAULT 0,
  delivery_fees_cents INTEGER NOT NULL DEFAULT 0,
  service_fees_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  driver_paid_cents INTEGER NOT NULL DEFAULT 0,
  restaurant_paid_cents INTEGER NOT NULL DEFAULT 0,
  refunds_cents INTEGER NOT NULL DEFAULT 0,
  net_cents INTEGER NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  generated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on month
CREATE UNIQUE INDEX idx_monthly_reports_month ON public.monthly_reports(month);

-- Enable RLS
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin users can read monthly reports"
ON public.monthly_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admin users can insert monthly reports"
ON public.monthly_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admin users can update monthly reports"
ON public.monthly_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);;
