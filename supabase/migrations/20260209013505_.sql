-- Track restaurant-to-restaurant referrals
CREATE TABLE merchant_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  referee_restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL,
  referee_user_id uuid NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'credited', 'cancelled'
  reward_type text DEFAULT 'credit', -- 'credit' or 'commission_discount'
  referrer_reward_cents integer,
  referee_reward_cents integer,
  commission_discount_percent numeric(5,2),
  commission_discount_months integer DEFAULT 1,
  commission_discount_expires_at timestamptz,
  credited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referee_restaurant_id)
);

-- Add referral tracking to restaurants
ALTER TABLE restaurants 
ADD COLUMN referred_by_restaurant_id uuid REFERENCES restaurants(id);

-- Indexes for performance
CREATE INDEX idx_merchant_referrals_referrer ON merchant_referrals(referrer_restaurant_id);
CREATE INDEX idx_merchant_referrals_referee ON merchant_referrals(referee_restaurant_id);
CREATE INDEX idx_merchant_referrals_status ON merchant_referrals(status);
CREATE INDEX idx_restaurants_referred_by ON restaurants(referred_by_restaurant_id);

-- RLS Policies
ALTER TABLE merchant_referrals ENABLE ROW LEVEL SECURITY;

-- Restaurant owners can see their own referrals (as referrer or referee)
CREATE POLICY "Referrers can see their referrals"
ON merchant_referrals FOR SELECT
USING (
  referrer_user_id = auth.uid() OR referee_user_id = auth.uid()
);;
