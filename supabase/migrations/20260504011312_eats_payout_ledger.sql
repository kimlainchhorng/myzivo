-- Mirror lodge_payout_ledger for Eats. One row per (order_id, direction).
CREATE TABLE IF NOT EXISTS public.eats_payout_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL,
  stripe_account_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('transfer','reversal')),
  amount_cents bigint NOT NULL,
  commission_cents bigint NOT NULL DEFAULT 0,
  commission_rate numeric(5,4),
  stripe_transfer_id text,
  stripe_reversal_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','created','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, direction)
);
CREATE INDEX IF NOT EXISTS idx_eats_payout_ledger_order ON public.eats_payout_ledger (order_id);
CREATE INDEX IF NOT EXISTS idx_eats_payout_ledger_restaurant ON public.eats_payout_ledger (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_eats_payout_ledger_status ON public.eats_payout_ledger (status) WHERE status IN ('queued','failed');

ALTER TABLE public.eats_payout_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manages eats payout ledger" ON public.eats_payout_ledger;
CREATE POLICY "service role manages eats payout ledger"
  ON public.eats_payout_ledger AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "restaurant owner reads own eats payout ledger" ON public.eats_payout_ledger;
CREATE POLICY "restaurant owner reads own eats payout ledger"
  ON public.eats_payout_ledger AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
       WHERE r.id = eats_payout_ledger.restaurant_id
         AND r.owner_id = auth.uid()
    )
  );;
