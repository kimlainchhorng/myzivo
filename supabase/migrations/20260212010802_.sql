
-- Customer streaks table
CREATE TABLE public.customer_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  streak_type text NOT NULL DEFAULT 'orders',
  current_count integer NOT NULL DEFAULT 0,
  longest_count integer NOT NULL DEFAULT 0,
  last_activity_date date,
  reward_claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_customer_streaks_user_type ON public.customer_streaks (user_id, streak_type);

ALTER TABLE public.customer_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON public.customer_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own streaks"
  ON public.customer_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON public.customer_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all streaks"
  ON public.customer_streaks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
  );

-- Personalized offers table
CREATE TABLE public.personalized_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  offer_type text NOT NULL DEFAULT 'percentage_discount',
  discount_value numeric NOT NULL DEFAULT 0,
  target_restaurant_id uuid,
  description text NOT NULL DEFAULT '',
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  redeemed_at timestamptz,
  created_by uuid,
  segment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_personalized_offers_user ON public.personalized_offers (user_id);
CREATE INDEX idx_personalized_offers_code ON public.personalized_offers (code);

ALTER TABLE public.personalized_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own offers"
  ON public.personalized_offers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers"
  ON public.personalized_offers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all offers"
  ON public.personalized_offers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager'))
  );

-- Trigger for updated_at on customer_streaks
CREATE TRIGGER update_customer_streaks_updated_at
  BEFORE UPDATE ON public.customer_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
