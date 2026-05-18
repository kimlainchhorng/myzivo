
-- Restaurant wallets
CREATE TABLE public.restaurant_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL UNIQUE,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,
  paid_out_cents INTEGER NOT NULL DEFAULT 0,
  lifetime_earnings_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their wallet"
  ON public.restaurant_wallets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage restaurant wallets"
  ON public.restaurant_wallets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Restaurant wallet transactions
CREATE TABLE public.restaurant_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'payout', 'adjustment', 'commission', 'refund_debit')),
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER NOT NULL DEFAULT 0,
  order_id UUID,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their transactions"
  ON public.restaurant_wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage restaurant transactions"
  ON public.restaurant_wallet_transactions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX idx_restaurant_wallets_restaurant ON public.restaurant_wallets(restaurant_id);
CREATE INDEX idx_restaurant_wallet_txns_restaurant ON public.restaurant_wallet_transactions(restaurant_id);
CREATE INDEX idx_restaurant_wallet_txns_created ON public.restaurant_wallet_transactions(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_restaurant_wallets_updated_at
  BEFORE UPDATE ON public.restaurant_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
