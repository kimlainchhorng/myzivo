-- The ride dispatch pipeline (dispatch-ride + dispatch-escalate) writes
-- and reads job_offers.ride_request_id. The column has never existed
-- (only job_id does, which serves the unified `jobs` table for food/eats).
-- Result: every ride request that hits dispatch-ride creates ZERO driver
-- offers — the whole ride pipeline has been silently broken.
--
-- Fix: add the column with FK + index. Existing food-delivery offers
-- continue to use job_id and are unaffected. New ride offers populate
-- ride_request_id; dispatch-escalate's SELECT now succeeds.

ALTER TABLE public.job_offers
  ADD COLUMN IF NOT EXISTS ride_request_id UUID REFERENCES public.ride_requests(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_job_offers_ride_request
  ON public.job_offers (ride_request_id)
  WHERE ride_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_job_offers_ride_pending
  ON public.job_offers (ride_request_id, status)
  WHERE ride_request_id IS NOT NULL AND status = 'pending';;
