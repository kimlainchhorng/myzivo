-- Add subscription period tracking columns
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Create index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_stripe_customer
  ON public.restaurants(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;;
