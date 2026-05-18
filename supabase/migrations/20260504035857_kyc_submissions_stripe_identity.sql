-- Tie kyc_submissions to Stripe Identity. status values:
--   draft | pending | requires_input | verified | rejected | canceled
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS stripe_verification_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_verification_status text,
  ADD COLUMN IF NOT EXISTS stripe_verified_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_kyc_stripe_session
  ON public.kyc_submissions (stripe_verification_session_id)
  WHERE stripe_verification_session_id IS NOT NULL;

-- Make submitted_at nullable + default-now so we can create draft rows before
-- the user actually submits (the original schema required submitted_at).
ALTER TABLE public.kyc_submissions ALTER COLUMN submitted_at DROP NOT NULL;
ALTER TABLE public.kyc_submissions ALTER COLUMN submitted_at SET DEFAULT now();;
