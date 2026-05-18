-- Add provider-agnostic payment columns so reservations can be paid via
-- Stripe, PayPal, Square, or cash on arrival. Backfill existing rows that
-- already have a stripe_payment_intent_id as 'stripe'.

ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS payment_provider text
    CHECK (payment_provider IN ('stripe','paypal','square','cash'));

ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS paypal_order_id text;

ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS square_checkout_id text;

ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS square_payment_id text;

CREATE INDEX IF NOT EXISTS idx_lodge_reservations_paypal_order
  ON public.lodge_reservations (paypal_order_id) WHERE paypal_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lodge_reservations_square_checkout
  ON public.lodge_reservations (square_checkout_id) WHERE square_checkout_id IS NOT NULL;

UPDATE public.lodge_reservations
   SET payment_provider = 'stripe'
 WHERE payment_provider IS NULL
   AND stripe_payment_intent_id IS NOT NULL;;
