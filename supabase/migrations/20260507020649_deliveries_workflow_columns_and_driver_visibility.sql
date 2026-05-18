
-- Workflow timestamps (set as the delivery progresses through statuses)
ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS accepted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at  timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at  timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at  timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz NOT NULL DEFAULT now();

-- Optional package metadata + recipient SMS opt-in
ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS package_size    text,
  ADD COLUMN IF NOT EXISTS notes           text,
  ADD COLUMN IF NOT EXISTS notify_recipient boolean NOT NULL DEFAULT false;

-- Keep updated_at fresh on every row update
CREATE OR REPLACE FUNCTION public.deliveries_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deliveries_set_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_set_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.deliveries_set_updated_at();

-- Make pending unassigned deliveries visible to verified drivers so they can claim them.
-- Existing zivo_deliveries_select policy stays for customers/assigned drivers.
DROP POLICY IF EXISTS zivo_deliveries_select_pending_for_drivers ON public.deliveries;
CREATE POLICY zivo_deliveries_select_pending_for_drivers
  ON public.deliveries
  FOR SELECT
  USING (
    status IN ('requested','pending')
    AND driver_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.user_id = (SELECT auth.uid())
    )
  );

-- Allow a verified driver to claim an unassigned pending delivery (set themselves as driver_user_id).
-- Existing zivo_deliveries_update policy already covers the driver-after-assignment case.
DROP POLICY IF EXISTS zivo_deliveries_claim_by_driver ON public.deliveries;
CREATE POLICY zivo_deliveries_claim_by_driver
  ON public.deliveries
  FOR UPDATE
  USING (
    driver_user_id IS NULL
    AND status IN ('requested','pending')
    AND EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    driver_user_id = (SELECT auth.uid())
    AND status IN ('accepted','requested','pending')
  );

-- Useful indexes for the driver feed and customer tracking
CREATE INDEX IF NOT EXISTS idx_deliveries_pending_unassigned
  ON public.deliveries (created_at DESC)
  WHERE driver_user_id IS NULL AND status IN ('requested','pending');

CREATE INDEX IF NOT EXISTS idx_deliveries_customer_recent
  ON public.deliveries (customer_user_id, created_at DESC);
;
