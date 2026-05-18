-- Unify on customer_wallets (the table the UI reads). Two fixes:
--  1. Extend the type CHECK constraint so 'topup', 'withdrawal',
--     'transfer_in', 'transfer_out' are accepted. process-withdrawal has
--     been silently failing every withdrawal insert because of this.
--  2. Rewrite credit_user_wallet_topup, accept_p2p_transfer, and
--     decline_p2p_transfer to operate on customer_wallets +
--     customer_wallet_transactions instead of user_wallets +
--     user_wallet_transactions.

-- 1. Extend constraint
ALTER TABLE public.customer_wallet_transactions
  DROP CONSTRAINT IF EXISTS customer_wallet_transactions_type_check;
ALTER TABLE public.customer_wallet_transactions
  ADD CONSTRAINT customer_wallet_transactions_type_check
  CHECK (type = ANY (ARRAY[
    'referral_bonus','promo_credit','order_credit','redemption','adjustment',
    'topup','withdrawal','transfer_in','transfer_out','refund','reward','purchase'
  ]));

-- 2a. credit_user_wallet_topup → customer_wallets
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
  v_new_balance integer;
  v_amount integer;
  v_desc text;
BEGIN
  IF p_amount_cents <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  v_amount := p_amount_cents::integer;
  v_desc := COALESCE(p_description, 'Stripe topup ' || p_stripe_reference);

  -- Idempotency: dedupe on description containing the stripe ref.
  SELECT id INTO v_existing
  FROM public.customer_wallet_transactions
  WHERE user_id = p_user_id
    AND type = 'topup'
    AND description = v_desc
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    SELECT balance_cents INTO v_new_balance FROM public.customer_wallets WHERE user_id = p_user_id;
    RETURN jsonb_build_object('credited', false, 'reason', 'duplicate', 'balance_cents', COALESCE(v_new_balance, 0));
  END IF;

  -- Ensure wallet exists, then lock it
  INSERT INTO public.customer_wallets (user_id, balance_cents)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1 FROM public.customer_wallets WHERE user_id = p_user_id FOR UPDATE;

  UPDATE public.customer_wallets
     SET balance_cents = balance_cents + v_amount,
         updated_at = now()
   WHERE user_id = p_user_id
   RETURNING balance_cents INTO v_new_balance;

  INSERT INTO public.customer_wallet_transactions
    (user_id, amount_cents, balance_after_cents, type, description)
  VALUES
    (p_user_id, v_amount, v_new_balance, 'topup', v_desc);

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (p_user_id, 'in_app', 'transactional', 'wallet_topup',
     'Wallet topped up',
     '$' || ((v_amount::numeric) / 100)::text || ' added to your wallet',
     '/wallet', 'sent',
     jsonb_build_object('amount_cents', v_amount, 'stripe_ref', p_stripe_reference));

  RETURN jsonb_build_object('credited', true, 'balance_cents', v_new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.credit_user_wallet_topup(uuid, bigint, text, text, text) FROM PUBLIC;

-- 2b. accept_p2p_transfer → customer_wallets
CREATE OR REPLACE FUNCTION public.accept_p2p_transfer(p_transfer_id uuid)
RETURNS public.p2p_transfers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.p2p_transfers;
  v_sender_balance integer;
  v_new_sender_balance integer;
  v_new_receiver_balance integer;
  v_amount integer;
BEGIN
  SELECT * INTO v_t FROM public.p2p_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'transfer_not_found'; END IF;
  IF v_t.receiver_id <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF v_t.status <> 'pending' THEN RAISE EXCEPTION 'not_pending'; END IF;

  v_amount := v_t.amount_cents;

  -- Ensure both wallets exist
  INSERT INTO public.customer_wallets (user_id, balance_cents) VALUES (v_t.sender_id, 0)   ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.customer_wallets (user_id, balance_cents) VALUES (v_t.receiver_id, 0) ON CONFLICT (user_id) DO NOTHING;

  -- Lock in deterministic order to avoid deadlocks
  IF v_t.sender_id < v_t.receiver_id THEN
    PERFORM 1 FROM public.customer_wallets WHERE user_id = v_t.sender_id   FOR UPDATE;
    PERFORM 1 FROM public.customer_wallets WHERE user_id = v_t.receiver_id FOR UPDATE;
  ELSE
    PERFORM 1 FROM public.customer_wallets WHERE user_id = v_t.receiver_id FOR UPDATE;
    PERFORM 1 FROM public.customer_wallets WHERE user_id = v_t.sender_id   FOR UPDATE;
  END IF;

  SELECT balance_cents INTO v_sender_balance FROM public.customer_wallets WHERE user_id = v_t.sender_id;
  IF v_sender_balance < v_amount THEN RAISE EXCEPTION 'insufficient_funds'; END IF;

  UPDATE public.customer_wallets
     SET balance_cents = balance_cents - v_amount, updated_at = now()
   WHERE user_id = v_t.sender_id
   RETURNING balance_cents INTO v_new_sender_balance;

  UPDATE public.customer_wallets
     SET balance_cents = balance_cents + v_amount, updated_at = now()
   WHERE user_id = v_t.receiver_id
   RETURNING balance_cents INTO v_new_receiver_balance;

  INSERT INTO public.customer_wallet_transactions
    (user_id, amount_cents, balance_after_cents, type, description, reference_id)
  VALUES
    (v_t.sender_id,   -v_amount, v_new_sender_balance,   'transfer_out', 'P2P transfer sent',     v_t.id),
    (v_t.receiver_id,  v_amount, v_new_receiver_balance, 'transfer_in',  'P2P transfer received', v_t.id);

  UPDATE public.p2p_transfers
     SET status = 'completed', completed_at = now()
   WHERE id = v_t.id
   RETURNING * INTO v_t;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_t.sender_id, 'in_app', 'transactional', 'p2p_accepted',
     'Transfer completed',
     'Your transfer of $' || ((v_amount::numeric) / 100)::text || ' was accepted',
     '/wallet', 'sent',
     jsonb_build_object('transfer_id', v_t.id, 'amount_cents', v_amount));

  RETURN v_t;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_p2p_transfer(uuid) TO authenticated;;
