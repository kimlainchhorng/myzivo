-- P2P transfer settlement: accept / decline / cancel + insert notification.
-- Wallets balance is enforced via FOR UPDATE row locks so concurrent
-- accepts on the same wallet stay consistent. Each settlement writes two
-- user_wallet_transactions rows (transfer_out for sender, transfer_in for
-- receiver) so reconciliation works downstream.

CREATE OR REPLACE FUNCTION public.accept_p2p_transfer(p_transfer_id uuid)
RETURNS public.p2p_transfers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.p2p_transfers;
  v_sender_balance bigint;
  v_new_sender_balance bigint;
  v_new_receiver_balance bigint;
BEGIN
  -- Caller must be the receiver
  SELECT * INTO v_t FROM public.p2p_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'transfer_not_found'; END IF;
  IF v_t.receiver_id <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF v_t.status <> 'pending' THEN RAISE EXCEPTION 'not_pending'; END IF;

  -- Lock both wallets (insert if missing) — order by user_id to avoid deadlocks
  INSERT INTO public.user_wallets (user_id) VALUES (v_t.sender_id)   ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_wallets (user_id) VALUES (v_t.receiver_id) ON CONFLICT (user_id) DO NOTHING;

  IF v_t.sender_id < v_t.receiver_id THEN
    PERFORM 1 FROM public.user_wallets WHERE user_id = v_t.sender_id   FOR UPDATE;
    PERFORM 1 FROM public.user_wallets WHERE user_id = v_t.receiver_id FOR UPDATE;
  ELSE
    PERFORM 1 FROM public.user_wallets WHERE user_id = v_t.receiver_id FOR UPDATE;
    PERFORM 1 FROM public.user_wallets WHERE user_id = v_t.sender_id   FOR UPDATE;
  END IF;

  SELECT available_cents INTO v_sender_balance FROM public.user_wallets WHERE user_id = v_t.sender_id;
  IF v_sender_balance < v_t.amount_cents THEN
    RAISE EXCEPTION 'insufficient_funds';
  END IF;

  -- Debit sender, credit receiver
  UPDATE public.user_wallets
     SET available_cents = available_cents - v_t.amount_cents,
         updated_at = now()
   WHERE user_id = v_t.sender_id
   RETURNING available_cents INTO v_new_sender_balance;

  UPDATE public.user_wallets
     SET available_cents = available_cents + v_t.amount_cents,
         updated_at = now()
   WHERE user_id = v_t.receiver_id
   RETURNING available_cents INTO v_new_receiver_balance;

  -- Ledger rows
  INSERT INTO public.user_wallet_transactions
    (user_id, kind, amount_cents, balance_after_cents, currency, description, reference_id)
  VALUES
    (v_t.sender_id, 'transfer_out', -v_t.amount_cents, v_new_sender_balance,
     v_t.currency, 'P2P transfer to receiver', v_t.id),
    (v_t.receiver_id, 'transfer_in', v_t.amount_cents, v_new_receiver_balance,
     v_t.currency, 'P2P transfer from sender', v_t.id);

  -- Mark transfer completed
  UPDATE public.p2p_transfers
     SET status = 'completed', completed_at = now()
   WHERE id = v_t.id
   RETURNING * INTO v_t;

  -- Notify sender that their transfer was accepted
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_t.sender_id, 'in_app', 'transactional', 'p2p_accepted',
     'Transfer completed',
     'Your transfer of $' || ((v_t.amount_cents::numeric) / 100)::text || ' was accepted',
     '/wallet', 'sent',
     jsonb_build_object('transfer_id', v_t.id, 'amount_cents', v_t.amount_cents));

  RETURN v_t;
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_p2p_transfer(p_transfer_id uuid)
RETURNS public.p2p_transfers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.p2p_transfers;
BEGIN
  SELECT * INTO v_t FROM public.p2p_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'transfer_not_found'; END IF;
  IF v_t.receiver_id <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF v_t.status <> 'pending' THEN RAISE EXCEPTION 'not_pending'; END IF;

  UPDATE public.p2p_transfers
     SET status = 'declined'
   WHERE id = v_t.id
   RETURNING * INTO v_t;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (v_t.sender_id, 'in_app', 'transactional', 'p2p_declined',
     'Transfer declined',
     'Your transfer of $' || ((v_t.amount_cents::numeric) / 100)::text || ' was declined',
     '/wallet', 'sent',
     jsonb_build_object('transfer_id', v_t.id));
  RETURN v_t;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_p2p_transfer(p_transfer_id uuid)
RETURNS public.p2p_transfers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.p2p_transfers;
BEGIN
  SELECT * INTO v_t FROM public.p2p_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'transfer_not_found'; END IF;
  IF v_t.sender_id <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF v_t.status <> 'pending' THEN RAISE EXCEPTION 'not_pending'; END IF;

  UPDATE public.p2p_transfers
     SET status = 'cancelled'
   WHERE id = v_t.id
   RETURNING * INTO v_t;
  RETURN v_t;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_p2p_transfer(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_p2p_transfer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_p2p_transfer(uuid)  TO authenticated;

-- Notification on new pending transfer (so receiver knows immediately)
CREATE OR REPLACE FUNCTION public.tg_p2p_notify_receiver()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  IF NEW.status <> 'pending' THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, username, 'Someone') INTO v_sender_name
  FROM public.public_profiles WHERE user_id = NEW.sender_id LIMIT 1;

  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (NEW.receiver_id, 'in_app', 'transactional', 'p2p_pending',
     COALESCE(v_sender_name, 'Someone') || ' sent you money',
     '$' || ((NEW.amount_cents::numeric) / 100)::text ||
       CASE WHEN NEW.note IS NOT NULL AND NEW.note <> '' THEN ' — "' || left(NEW.note, 60) || '"' ELSE '' END,
     '/wallet?transfer=' || NEW.id::text,
     'sent',
     jsonb_build_object('transfer_id', NEW.id, 'amount_cents', NEW.amount_cents, 'sender_id', NEW.sender_id));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS p2p_notify_receiver_trg ON public.p2p_transfers;
CREATE TRIGGER p2p_notify_receiver_trg
AFTER INSERT ON public.p2p_transfers
FOR EACH ROW EXECUTE FUNCTION public.tg_p2p_notify_receiver();;
