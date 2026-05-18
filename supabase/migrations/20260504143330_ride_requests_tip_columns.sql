ALTER TABLE public.ride_requests
  ADD COLUMN IF NOT EXISTS tip_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tip_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS tip_charged_at timestamptz,
  ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS rating_feedback text,
  ADD COLUMN IF NOT EXISTS rated_at timestamptz;;
