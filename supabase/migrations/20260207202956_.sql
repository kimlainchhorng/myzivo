-- Table 1: driver_wallets - Running balance ledger for each driver
CREATE TABLE public.driver_wallets (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  balance_cents int NOT NULL DEFAULT 0,
  pending_cents int NOT NULL DEFAULT 0,
  total_earnings_cents int NOT NULL DEFAULT 0,
  total_payouts_cents int NOT NULL DEFAULT 0,
  last_payout_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table 2: wallet_transactions - Detailed transaction log with idempotency
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES food_orders(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount_cents int NOT NULL,
  balance_after_cents int NOT NULL,
  description text,
  stripe_transfer_id text,
  idempotency_key text UNIQUE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for wallet_transactions
CREATE INDEX idx_wallet_tx_driver ON wallet_transactions(driver_id, created_at DESC);
CREATE INDEX idx_wallet_tx_order ON wallet_transactions(order_id);
CREATE INDEX idx_wallet_tx_idempotency ON wallet_transactions(idempotency_key);

-- Enable RLS on driver_wallets
ALTER TABLE driver_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can read own wallet" ON driver_wallets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM drivers d WHERE d.id = driver_wallets.driver_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all wallets" ON driver_wallets
  FOR ALL USING (true);

-- Enable RLS on wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can read own transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM drivers d WHERE d.id = wallet_transactions.driver_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all transactions" ON wallet_transactions
  FOR ALL USING (true);

-- RPC Function: credit_driver_earnings - Atomic function with idempotency
CREATE OR REPLACE FUNCTION credit_driver_earnings(
  p_driver_id uuid,
  p_order_id uuid,
  p_amount_cents int,
  p_description text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_idempotency_key text;
  v_existing_tx uuid;
  v_wallet driver_wallets%ROWTYPE;
  v_new_balance int;
  v_tx_id uuid;
BEGIN
  -- Generate idempotency key from order
  v_idempotency_key := 'earning-' || p_order_id::text;
  
  -- Check for existing transaction (idempotency)
  SELECT id INTO v_existing_tx FROM wallet_transactions WHERE idempotency_key = v_idempotency_key;
  IF v_existing_tx IS NOT NULL THEN
    RETURN json_build_object('success', true, 'already_credited', true, 'transaction_id', v_existing_tx);
  END IF;
  
  -- Upsert wallet (create if not exists)
  INSERT INTO driver_wallets (driver_id, balance_cents, total_earnings_cents)
  VALUES (p_driver_id, 0, 0)
  ON CONFLICT (driver_id) DO NOTHING;
  
  -- Lock and update wallet
  SELECT * INTO v_wallet FROM driver_wallets WHERE driver_id = p_driver_id FOR UPDATE;
  v_new_balance := COALESCE(v_wallet.balance_cents, 0) + p_amount_cents;
  
  UPDATE driver_wallets SET
    balance_cents = v_new_balance,
    total_earnings_cents = COALESCE(total_earnings_cents, 0) + p_amount_cents,
    updated_at = now()
  WHERE driver_id = p_driver_id;
  
  -- Insert transaction
  INSERT INTO wallet_transactions (
    driver_id, order_id, type, amount_cents, balance_after_cents, description, idempotency_key
  ) VALUES (
    p_driver_id, p_order_id, 'earning', p_amount_cents, v_new_balance, p_description, v_idempotency_key
  ) RETURNING id INTO v_tx_id;
  
  RETURN json_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance_cents', v_new_balance);
END;
$$;;
