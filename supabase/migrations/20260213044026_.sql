
-- ==========================================
-- Zivo Business Invoicing & Billing System
-- ==========================================

-- Invoice status type
CREATE TYPE public.invoice_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');

-- Line item category type
CREATE TYPE public.invoice_line_item_type AS ENUM ('ride', 'delivery', 'eats', 'flight', 'hotel', 'rental', 'fee', 'tax', 'discount', 'credit');

-- Payment method type
CREATE TYPE public.payment_method_type AS ENUM ('card', 'bank');

-- ==========================================
-- 1. Business Invoices
-- ==========================================
CREATE TABLE public.business_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  fees_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms TEXT NOT NULL DEFAULT 'net30',
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_amount_cents INTEGER,
  payment_method_id UUID,
  notes TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_invoices ENABLE ROW LEVEL SECURITY;

-- Business owners can view their invoices
CREATE POLICY "Business owners can view their invoices"
ON public.business_invoices FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
  OR
  business_id IN (
    SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid()
  )
);

-- ==========================================
-- 2. Invoice Line Items
-- ==========================================
CREATE TABLE public.business_invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.business_invoices(id) ON DELETE CASCADE,
  line_type public.invoice_line_item_type NOT NULL DEFAULT 'ride',
  description TEXT NOT NULL,
  employee_name TEXT,
  employee_email TEXT,
  trip_date DATE,
  pickup_location TEXT,
  dropoff_location TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line items of their invoices"
ON public.business_invoice_line_items FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT bi.id FROM public.business_invoices bi
    WHERE bi.business_id IN (
      SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
    )
    OR bi.business_id IN (
      SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid()
    )
  )
);

-- ==========================================
-- 3. Payment Methods
-- ==========================================
CREATE TABLE public.business_payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  method_type public.payment_method_type NOT NULL DEFAULT 'card',
  label TEXT NOT NULL,
  last_four TEXT,
  brand TEXT,
  bank_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_autopay BOOLEAN NOT NULL DEFAULT false,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage payment methods"
ON public.business_payment_methods FOR ALL
TO authenticated
USING (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
);

-- ==========================================
-- 4. Billing Alerts / Notifications
-- ==========================================
CREATE TABLE public.business_billing_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.business_invoices(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_billing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business users can view their billing alerts"
ON public.business_billing_alerts FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
  OR
  business_id IN (
    SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid()
  )
);

CREATE POLICY "Business users can mark alerts as read"
ON public.business_billing_alerts FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
  )
);

-- ==========================================
-- 5. Invoice Audit Log (for admin adjustments)
-- ==========================================
CREATE TABLE public.business_invoice_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.business_invoices(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  admin_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_invoice_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.business_invoice_audit_log FOR SELECT
TO authenticated
USING (true);

-- ==========================================
-- 6. Update trigger for timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_business_invoices_updated_at
  BEFORE UPDATE ON public.business_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_payment_methods_updated_at
  BEFORE UPDATE ON public.business_payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 7. Indexes for performance
-- ==========================================
CREATE INDEX idx_business_invoices_business_id ON public.business_invoices(business_id);
CREATE INDEX idx_business_invoices_status ON public.business_invoices(status);
CREATE INDEX idx_business_invoices_due_date ON public.business_invoices(due_date);
CREATE INDEX idx_business_invoice_line_items_invoice_id ON public.business_invoice_line_items(invoice_id);
CREATE INDEX idx_business_payment_methods_business_id ON public.business_payment_methods(business_id);
CREATE INDEX idx_business_billing_alerts_business_id ON public.business_billing_alerts(business_id);
;
