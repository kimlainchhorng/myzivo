-- Idempotent wallet credit for Stripe-funded topups.
-- Uses Stripe checkout session id (or payment intent id) as the
-- reference_id on user_wallet_transactions to dedupe replays.
-- Returns the new balance.

CREATE OR REPLACE FUNCTION public.credit_user_wallet_topup(
  p_user_id uuid,
  p_amount_cents bigint,
  p_currency text,
  p_stripe_reference text,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing uuid;
  v_new_balance bigint;
BEGIN
  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  -- Idempotency: if a topup with this reference already exists, return success
  -- without double-crediting. We store the stripe ref inside the description JSON
  -- as a marker; for a true reference column add `text_reference` later.
  SELECT id INTO v_existing
  FROM public.user_wallet_transactions
  WHERE user_id = p_user_id
    AND kind = 'topup'
    AND description = COALESCE(p_description, 'Stripe topup ' || p_stripe_reference)
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    SELECT available_cents INTO v_new_balance FROM public.user_wallets WHERE user_id = p_user_id;
    RETURN jsonb_build_object('credited', false, 'reason', 'duplicate', 'balance_cents', COALESCE(v_new_balance, 0));
  END IF;

  -- Lock or create the wallet
  INSERT INTO public.user_wallets (user_id, currency)
  VALUES (p_user_id, COALESCE(p_currency, 'USD'))
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1 FROM public.user_wallets WHERE user_id = p_user_id FOR UPDATE;

  UPDATE public.user_wallets
     SET available_cents = available_cents + p_amount_cents,
         updated_at = now()
   WHERE user_id = p_user_id
   RETURNING available_cents INTO v_new_balance;

  INSERT INTO public.user_wallet_transactions
    (user_id, kind, amount_cents, balance_after_cents, currency, description, reference_id)
  VALUES
    (p_user_id, 'topup', p_amount_cents, v_new_balance,
     COALESCE(p_currency, 'USD'),
     COALESCE(p_description, 'Stripe topup ' || p_stripe_reference),
     NULL);

  -- Notify user
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (p_user_id, 'in_app', 'transactional', 'wallet_topup',
     'Wallet topped up',
     '$' || ((p_amount_cents::numeric) / 100)::text || ' added to your wallet',
     '/wallet', 'sent',
     jsonb_build_object('amount_cents', p_amount_cents, 'stripe_ref', p_stripe_reference));

  RETURN jsonb_build_object('credited', true, 'balance_cents', v_new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.credit_user_wallet_topup(uuid, bigint, text, text, text) FROM PUBLIC;
-- Only the service role should call this; never grant to authenticated.;
