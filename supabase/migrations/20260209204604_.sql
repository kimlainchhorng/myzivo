
-- Create merchant_rewards table
CREATE TABLE public.merchant_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_rewards ENABLE ROW LEVEL SECURITY;

-- Merchants can read their own rewards
CREATE POLICY "Merchants can view own rewards"
  ON public.merchant_rewards
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Merchants can update (claim) their own rewards
CREATE POLICY "Merchants can claim own rewards"
  ON public.merchant_rewards
  FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_merchant_rewards_restaurant_id ON public.merchant_rewards(restaurant_id);
CREATE INDEX idx_merchant_rewards_status ON public.merchant_rewards(status);
;
