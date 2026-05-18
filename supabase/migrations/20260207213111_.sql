-- Phase 1: Add promotion columns to food_orders
ALTER TABLE public.food_orders 
  ADD COLUMN IF NOT EXISTS promotion_id uuid REFERENCES public.promotions(id),
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type text,
  ADD COLUMN IF NOT EXISTS promo_code text;

-- Phase 2: Add indexes for promotion lookups
CREATE INDEX IF NOT EXISTS idx_promotions_code ON public.promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_food_orders_promotion ON public.food_orders(promotion_id) WHERE promotion_id IS NOT NULL;

-- Phase 3: Create customer_wallets table
CREATE TABLE IF NOT EXISTS public.customer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents int DEFAULT 0,
  lifetime_credits_cents int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Phase 4: Create customer_wallet_transactions table
CREATE TABLE IF NOT EXISTS public.customer_wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents int NOT NULL,
  balance_after_cents int NOT NULL,
  type text NOT NULL CHECK (type IN ('referral_bonus', 'promo_credit', 'order_credit', 'redemption', 'adjustment')),
  description text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_wallet_txn_user ON public.customer_wallet_transactions(user_id, created_at DESC);

-- Phase 5: Enable RLS on customer wallets
ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Phase 6: RLS policies for customer_wallets
CREATE POLICY "Users read own wallet" ON public.customer_wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage wallets" ON public.customer_wallets
  FOR ALL USING (true);

-- Phase 7: RLS policies for customer_wallet_transactions
CREATE POLICY "Users read own transactions" ON public.customer_wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can insert transactions" ON public.customer_wallet_transactions
  FOR INSERT WITH CHECK (true);

-- Phase 8: Create validate_promo_code RPC
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  p_code text,
  p_order_subtotal_cents int,
  p_customer_id uuid,
  p_restaurant_id uuid DEFAULT NULL,
  p_delivery_fee_cents int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo public.promotions%ROWTYPE;
  v_discount_cents int := 0;
  v_user_usage_count int := 0;
BEGIN
  -- Find active promotion by code
  SELECT * INTO v_promo
  FROM public.promotions
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  LIMIT 1;
  
  IF v_promo IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;
  
  -- Check merchant restriction
  IF v_promo.merchant_id IS NOT NULL AND v_promo.merchant_id != p_restaurant_id THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This code is not valid for this restaurant'
    );
  END IF;
  
  -- Check minimum order amount (min_order_amount is in dollars)
  IF v_promo.min_order_amount IS NOT NULL AND p_order_subtotal_cents < (v_promo.min_order_amount * 100) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('Minimum order of $%.2f required', v_promo.min_order_amount)
    );
  END IF;
  
  -- Check global usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This promotion has reached its usage limit'
    );
  END IF;
  
  -- Check per-user limit
  IF v_promo.per_user_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM public.promotion_usage
    WHERE promotion_id = v_promo.id AND user_id = p_customer_id;
    
    IF v_user_usage_count >= v_promo.per_user_limit THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'You have already used this promotion'
      );
    END IF;
  END IF;
  
  -- Calculate discount based on type
  CASE v_promo.discount_type
    WHEN 'percent' THEN
      v_discount_cents := ROUND(p_order_subtotal_cents * (v_promo.discount_value / 100));
      -- Apply max discount cap
      IF v_promo.max_discount IS NOT NULL THEN
        v_discount_cents := LEAST(v_discount_cents, v_promo.max_discount * 100);
      END IF;
    WHEN 'fixed' THEN
      v_discount_cents := v_promo.discount_value * 100;
    WHEN 'free_delivery' THEN
      v_discount_cents := p_delivery_fee_cents;
    ELSE
      v_discount_cents := 0;
  END CASE;
  
  -- Ensure discount doesn't exceed order total
  v_discount_cents := LEAST(v_discount_cents, p_order_subtotal_cents + p_delivery_fee_cents);
  
  RETURN jsonb_build_object(
    'valid', true,
    'promotion_id', v_promo.id,
    'code', v_promo.code,
    'name', v_promo.name,
    'discount_type', v_promo.discount_type,
    'discount_cents', v_discount_cents,
    'discount_value', v_promo.discount_value,
    'description', v_promo.description
  );
END;
$$;

-- Phase 9: Create credit_customer_wallet RPC
CREATE OR REPLACE FUNCTION public.credit_customer_wallet(
  p_user_id uuid,
  p_amount_cents int,
  p_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.customer_wallets%ROWTYPE;
  v_new_balance int;
BEGIN
  -- Get or create wallet
  INSERT INTO public.customer_wallets (user_id, balance_cents, lifetime_credits_cents)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_wallet
  FROM public.customer_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Calculate new balance
  v_new_balance := v_wallet.balance_cents + p_amount_cents;
  
  -- Update wallet
  UPDATE public.customer_wallets
  SET 
    balance_cents = v_new_balance,
    lifetime_credits_cents = CASE WHEN p_amount_cents > 0 
      THEN lifetime_credits_cents + p_amount_cents 
      ELSE lifetime_credits_cents 
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.customer_wallet_transactions (
    user_id, amount_cents, balance_after_cents, type, description, reference_id
  ) VALUES (
    p_user_id, p_amount_cents, v_new_balance, p_type, p_description, p_reference_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance_cents', v_new_balance
  );
END;
$$;;
