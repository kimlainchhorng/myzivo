-- ============================================
-- WALLET SYSTEM: Complete Tables Setup
-- ============================================

-- 1. Wallet Ledger - Single source of truth for all money movements
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  order_id UUID,
  order_type TEXT CHECK (order_type IS NULL OR order_type IN ('trip', 'food_order')),
  
  type TEXT NOT NULL CHECK (type IN (
    'earning',
    'tip',
    'bonus',
    'adjustment',
    'cancel_comp',
    'payout'
  )),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'available',
    'paid_out',
    'void'
  )),
  
  amount NUMERIC NOT NULL,
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  available_at TIMESTAMPTZ
);

-- 2. Wallet Balances - Fast dashboard summary
CREATE TABLE IF NOT EXISTS wallet_balances (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  pending NUMERIC DEFAULT 0,
  available NUMERIC DEFAULT 0,
  paid_out NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_driver_status ON wallet_ledger(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_driver_created ON wallet_ledger(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_pending_release ON wallet_ledger(status, available_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;

-- Drivers can SELECT their own wallet_ledger
CREATE POLICY "wallet_ledger_select_own"
ON wallet_ledger FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- Drivers can SELECT their own wallet_balances
CREATE POLICY "wallet_balances_select_own"
ON wallet_balances FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- Function to refresh wallet balance
CREATE OR REPLACE FUNCTION refresh_wallet_balance(p_driver_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending NUMERIC;
  v_available NUMERIC;
  v_paid_out NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_pending
  FROM wallet_ledger
  WHERE driver_id = p_driver_id AND status = 'pending';

  SELECT COALESCE(SUM(amount), 0) INTO v_available
  FROM wallet_ledger
  WHERE driver_id = p_driver_id AND status = 'available';

  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_paid_out
  FROM wallet_ledger
  WHERE driver_id = p_driver_id AND status = 'paid_out';

  INSERT INTO wallet_balances(driver_id, pending, available, paid_out, updated_at)
  VALUES (p_driver_id, v_pending, v_available, v_paid_out, NOW())
  ON CONFLICT (driver_id)
  DO UPDATE SET 
    pending = EXCLUDED.pending,
    available = EXCLUDED.available,
    paid_out = EXCLUDED.paid_out,
    updated_at = NOW();
END;
$$;

-- Schedule cron job for wallet release (every 5 minutes)
SELECT cron.schedule(
  'wallet-release-pending',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/wallet-release-pending',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);;
