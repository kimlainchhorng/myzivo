CREATE TABLE IF NOT EXISTS public.eats_payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  rail text NOT NULL,
  payout_method_id uuid,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reference text,
  note text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_eats_payout_requests_restaurant ON public.eats_payout_requests (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_eats_payout_requests_status ON public.eats_payout_requests (status) WHERE status IN ('pending','approved');

ALTER TABLE public.eats_payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manages eats payout requests" ON public.eats_payout_requests;
CREATE POLICY "service role manages eats payout requests"
  ON public.eats_payout_requests AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "restaurant owner reads own eats payout requests" ON public.eats_payout_requests;
CREATE POLICY "restaurant owner reads own eats payout requests"
  ON public.eats_payout_requests AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = eats_payout_requests.restaurant_id AND r.owner_id = auth.uid())
  );;
