-- ====================
-- REFERRAL SYSTEM ENHANCEMENTS
-- ====================

-- 1. Create referral_settings table for global configuration
CREATE TABLE IF NOT EXISTS public.referral_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_referrer_credit_cents int DEFAULT 1000,
  customer_referee_credit_cents int DEFAULT 1000,
  driver_referrer_credit_cents int DEFAULT 2500,
  driver_referee_credit_cents int DEFAULT 0,
  min_order_total_cents int DEFAULT 2000,
  max_credit_apply_percent int DEFAULT 50,
  credit_expiry_days int DEFAULT 90,
  enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO referral_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- RLS for referral_settings
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read referral settings" ON referral_settings;
CREATE POLICY "Public read referral settings" ON referral_settings 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update referral settings" ON referral_settings;
CREATE POLICY "Admins update referral settings" ON referral_settings 
  FOR UPDATE USING (is_any_admin(auth.uid()));

-- 2. Add credit tracking columns to food_orders
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS credit_applied_cents int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_transaction_id uuid;

-- 3. Add order_id tracking to customer_wallet_transactions
ALTER TABLE customer_wallet_transactions
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES food_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_redeemed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS redeemed_at timestamptz;

-- 4. Create trigger to auto-generate referral codes for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  v_code text;
  v_attempts int := 0;
BEGIN
  LOOP
    v_code := UPPER(SUBSTRING(MD5(NEW.id::text || random()::text) FROM 1 FOR 8));
    
    IF NOT EXISTS(SELECT 1 FROM zivo_referral_codes WHERE code = v_code) THEN
      INSERT INTO zivo_referral_codes (user_id, code, is_active)
      VALUES (NEW.id, v_code, true)
      ON CONFLICT (user_id) DO NOTHING;
      EXIT;
    END IF;
    
    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN EXIT; END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_create_referral_code ON auth.users;
CREATE TRIGGER trigger_create_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_code();

-- 5. Create RPC to apply wallet credits
CREATE OR REPLACE FUNCTION apply_wallet_credit(
  p_user_id uuid,
  p_order_id uuid,
  p_amount_cents int
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_wallet customer_wallets%ROWTYPE;
  v_txn_id uuid;
  v_new_balance int;
BEGIN
  -- Validate amount
  IF p_amount_cents <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  -- Get wallet with lock
  SELECT * INTO v_wallet FROM customer_wallets 
  WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  IF v_wallet.balance_cents < p_amount_cents THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_wallet.balance_cents - p_amount_cents;
  
  -- Deduct balance
  UPDATE customer_wallets SET
    balance_cents = v_new_balance,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Insert transaction
  INSERT INTO customer_wallet_transactions (
    user_id, 
    amount_cents, 
    balance_after_cents, 
    type, 
    description, 
    reference_id,
    order_id, 
    is_redeemed, 
    redeemed_at
  ) VALUES (
    p_user_id, 
    -p_amount_cents, 
    v_new_balance, 
    'redemption', 
    'Applied to order', 
    p_order_id::text,
    p_order_id, 
    true, 
    now()
  )
  RETURNING id INTO v_txn_id;
  
  -- Update order with transaction reference
  UPDATE food_orders SET
    wallet_transaction_id = v_txn_id,
    updated_at = now()
  WHERE id = p_order_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'transaction_id', v_txn_id,
    'new_balance_cents', v_new_balance
  );
END;
$$;

-- 6. Create RPC to get referral settings
CREATE OR REPLACE FUNCTION get_referral_settings()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_settings referral_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM referral_settings LIMIT 1;
  
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'customer_referrer_credit_cents', 1000,
      'customer_referee_credit_cents', 1000,
      'min_order_total_cents', 2000,
      'max_credit_apply_percent', 50,
      'enabled', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'customer_referrer_credit_cents', v_settings.customer_referrer_credit_cents,
    'customer_referee_credit_cents', v_settings.customer_referee_credit_cents,
    'driver_referrer_credit_cents', v_settings.driver_referrer_credit_cents,
    'driver_referee_credit_cents', v_settings.driver_referee_credit_cents,
    'min_order_total_cents', v_settings.min_order_total_cents,
    'max_credit_apply_percent', v_settings.max_credit_apply_percent,
    'credit_expiry_days', v_settings.credit_expiry_days,
    'enabled', v_settings.enabled
  );
END;
$$;

-- 7. Index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_customer_wallet_transactions_order 
  ON customer_wallet_transactions(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_food_orders_credit_applied 
  ON food_orders(credit_applied_cents) WHERE credit_applied_cents > 0;;
