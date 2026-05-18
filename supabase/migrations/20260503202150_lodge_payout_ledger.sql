-- Tracks every automatic Connect transfer (and reversal) created from a
-- Stripe-paid lodging booking. One row per reservation per direction.
CREATE TABLE IF NOT EXISTS public.lodge_payout_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.lodge_reservations(id) ON DELETE CASCADE,
  store_id uuid NOT NULL,
  stripe_account_id text NOT NULL,
  -- Direction: 'transfer' moves money to the hotel; 'reversal' claws back on refund.
  direction text NOT NULL CHECK (direction IN ('transfer','reversal')),
  amount_cents bigint NOT NULL,
  commission_cents bigint NOT NULL DEFAULT 0,
  commission_rate numeric(5,4),
  stripe_transfer_id text,
  stripe_reversal_id text,
  -- Status: 'queued' (pre-API), 'created' (API succeeded), 'failed' (will be retried by ops).
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','created','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- One transfer + one reversal per reservation max.
  UNIQUE (reservation_id, direction)
);
CREATE INDEX IF NOT EXISTS idx_lodge_payout_ledger_reservation ON public.lodge_payout_ledger (reservation_id);
CREATE INDEX IF NOT EXISTS idx_lodge_payout_ledger_store ON public.lodge_payout_ledger (store_id);
CREATE INDEX IF NOT EXISTS idx_lodge_payout_ledger_status ON public.lodge_payout_ledger (status) WHERE status IN ('queued','failed');

ALTER TABLE public.lodge_payout_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manages payout ledger" ON public.lodge_payout_ledger;
CREATE POLICY "service role manages payout ledger"
  ON public.lodge_payout_ledger
  AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "store owner reads own payout ledger" ON public.lodge_payout_ledger;
CREATE POLICY "store owner reads own payout ledger"
  ON public.lodge_payout_ledger
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
       WHERE r.id = lodge_payout_ledger.store_id
         AND r.owner_id = auth.uid()
    )
  );

-- Opt-out flag — defaults to true. Hotels that prefer the manual
-- request flow can set this to false from the admin dashboard.
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS auto_payout_enabled boolean NOT NULL DEFAULT true;;
