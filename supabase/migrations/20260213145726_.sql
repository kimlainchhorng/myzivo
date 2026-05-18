-- Referral campaigns for admin-managed promotions
CREATE TABLE public.referral_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_role text NOT NULL DEFAULT 'customer', -- customer, driver, merchant
  target_city text,
  referrer_bonus_cents integer NOT NULL DEFAULT 500,
  referee_bonus_cents integer NOT NULL DEFAULT 500,
  max_referrals integer,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  total_conversions integer NOT NULL DEFAULT 0,
  total_cost_cents integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage referral campaigns" ON public.referral_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Anyone can read active campaigns" ON public.referral_campaigns
  FOR SELECT USING (is_active = true);

-- Fraud detection flags
CREATE TABLE public.referral_fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.zivo_referrals(id),
  referrer_id uuid,
  referee_id uuid,
  flag_type text NOT NULL, -- 'duplicate_account', 'self_referral', 'suspicious_pattern'
  details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending', -- pending, reviewed, dismissed, confirmed
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage fraud flags" ON public.referral_fraud_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add campaign_id to referrals for attribution
ALTER TABLE public.zivo_referrals ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.referral_campaigns(id);
ALTER TABLE public.zivo_referrals ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;;
