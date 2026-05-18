-- Stripe Connect onboarding state on drivers (Express accounts)
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS zivo_stripe_account_id   TEXT,
  ADD COLUMN IF NOT EXISTS zivo_stripe_onboarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zivo_stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zivo_stripe_charges_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zivo_stripe_disabled_reason TEXT,
  ADD COLUMN IF NOT EXISTS zivo_stripe_status_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_drivers_zivo_stripe ON public.drivers(zivo_stripe_account_id) WHERE zivo_stripe_account_id IS NOT NULL;

-- Per-trip payout ledger (transfer attempts to the driver's connect acct)
CREATE TABLE IF NOT EXISTS public.zivo_service_payouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  driver_id    UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  status       TEXT NOT NULL DEFAULT 'pending',   -- 'pending'|'paid'|'failed'|'skipped'
  stripe_transfer_id TEXT,
  failure_reason     TEXT,
  meta         JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at      TIMESTAMPTZ,
  UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_zivo_payouts_driver ON public.zivo_service_payouts(driver_id, status, created_at DESC);

ALTER TABLE public.zivo_service_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS zivo_payouts_driver_read ON public.zivo_service_payouts;
CREATE POLICY zivo_payouts_driver_read ON public.zivo_service_payouts FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS zivo_payouts_admin_read ON public.zivo_service_payouts;
CREATE POLICY zivo_payouts_admin_read ON public.zivo_service_payouts FOR SELECT USING (
  public.is_admin(auth.uid())
);;
