-- Risk & Fraud Center Tables

-- Table A: risk_flags - Track suspicious activity flags
CREATE TABLE public.risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('order', 'user', 'driver', 'merchant', 'payment')),
  entity_id text NOT NULL,
  severity text NOT NULL DEFAULT 'warn' CHECK (severity IN ('info', 'warn', 'critical')),
  reason_code text NOT NULL CHECK (reason_code IN ('high_value', 'repeat_cancels', 'many_cards', 'distance_mismatch', 'gps_spoof', 'chargeback', 'refund_abuse', 'manual')),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for risk_flags
CREATE INDEX idx_risk_flags_entity_status ON public.risk_flags(entity_type, status);
CREATE INDEX idx_risk_flags_severity ON public.risk_flags(severity);
CREATE INDEX idx_risk_flags_created_at ON public.risk_flags(created_at DESC);
CREATE INDEX idx_risk_flags_status ON public.risk_flags(status);

-- Table B: risk_holds - Block actions for entities
CREATE TABLE public.risk_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('user', 'driver', 'merchant')),
  entity_id text NOT NULL,
  hold_type text NOT NULL CHECK (hold_type IN ('block_orders', 'block_payouts', 'manual_review')),
  reason text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  lifted_by uuid REFERENCES auth.users(id),
  lifted_at timestamptz
);

-- Indexes for risk_holds
CREATE INDEX idx_risk_holds_entity_active ON public.risk_holds(entity_type, entity_id, is_active);
CREATE INDEX idx_risk_holds_active ON public.risk_holds(is_active) WHERE is_active = true;

-- Table C: payment_disputes - Track Stripe chargebacks
CREATE TABLE public.payment_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text DEFAULT 'stripe',
  dispute_id text UNIQUE NOT NULL,
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  amount_cents int,
  currency text DEFAULT 'usd',
  status text,
  reason text,
  evidence_due_by timestamptz,
  raw jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for payment_disputes
CREATE INDEX idx_payment_disputes_status ON public.payment_disputes(status);
CREATE INDEX idx_payment_disputes_evidence_due ON public.payment_disputes(evidence_due_by);
CREATE INDEX idx_payment_disputes_order ON public.payment_disputes(order_id);

-- Table D: watchlist - Suspicious identifiers
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('phone', 'email', 'card_fingerprint', 'ip', 'device')),
  value text NOT NULL,
  note text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Unique constraint for watchlist
CREATE UNIQUE INDEX idx_watchlist_type_value ON public.watchlist(type, value);
CREATE INDEX idx_watchlist_active ON public.watchlist(is_active) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin only for all risk tables
-- risk_flags policies
CREATE POLICY "Admin full access to risk_flags"
ON public.risk_flags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- risk_holds policies
CREATE POLICY "Admin full access to risk_holds"
ON public.risk_holds
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- payment_disputes policies
CREATE POLICY "Admin full access to payment_disputes"
ON public.payment_disputes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- watchlist policies
CREATE POLICY "Admin full access to watchlist"
ON public.watchlist
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_risk_flags_updated_at
  BEFORE UPDATE ON public.risk_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_disputes_updated_at
  BEFORE UPDATE ON public.payment_disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
