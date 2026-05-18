
-- 1. Fix credit_customer_wallet: restrict to service_role or admin only
CREATE OR REPLACE FUNCTION public.credit_customer_wallet(
  p_user_id uuid,
  p_amount_cents integer,
  p_reason text DEFAULT 'credit',
  p_reference_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_new_balance integer;
BEGIN
  -- SECURITY: Only allow service_role or admin users to credit wallets
  IF current_setting('request.jwt.claim.role', true) != 'service_role' 
     AND NOT EXISTS (
       SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
     ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: only admins or service role can credit wallets');
  END IF;

  IF p_amount_cents <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Get or create wallet
  SELECT id INTO v_wallet_id FROM customer_wallets WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO customer_wallets (user_id, balance_cents)
    VALUES (p_user_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  -- Credit the wallet
  UPDATE customer_wallets
  SET balance_cents = balance_cents + p_amount_cents,
      updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance_cents INTO v_new_balance;

  -- Log the transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, amount_cents, type, reason, reference_id)
  VALUES (v_wallet_id, p_user_id, p_amount_cents, 'credit', p_reason, p_reference_id);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance_cents', v_new_balance,
    'credited_amount_cents', p_amount_cents
  );
END;
$$;

-- 2. Make delivery-proofs bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'delivery-proofs';

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public read for delivery proofs" ON storage.objects;

-- Create scoped read policy: only drivers, restaurant owners, and admins can view
CREATE POLICY "Authorized read for delivery proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'delivery-proofs' AND (
    -- Admin users
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR
    -- Driver who uploaded (files stored as order_id/filename)
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.drivers d ON d.id = fo.driver_id
      WHERE d.user_id = auth.uid()
      AND fo.id::text = (storage.foldername(name))[1]
    )
    OR
    -- Restaurant owner for the order
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.restaurants r ON r.id = fo.restaurant_id
      WHERE r.owner_id = auth.uid()
      AND fo.id::text = (storage.foldername(name))[1]
    )
  )
);
;
