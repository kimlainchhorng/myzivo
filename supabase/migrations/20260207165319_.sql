-- Create merchant_plans table
CREATE TABLE IF NOT EXISTS public.merchant_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  monthly_price numeric NOT NULL DEFAULT 0,
  platform_fee_percent numeric NOT NULL DEFAULT 0.20,
  placement_boost numeric NOT NULL DEFAULT 1.0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO public.merchant_plans (code, name, monthly_price, platform_fee_percent, placement_boost)
VALUES
  ('basic', 'Basic', 0, 0.20, 1.0),
  ('pro', 'Pro', 49, 0.15, 1.15),
  ('premium', 'Premium', 99, 0.10, 1.30)
ON CONFLICT (code) DO NOTHING;

-- Add subscription columns to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS plan_code text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS plan_updated_at timestamptz;

-- Enable RLS on merchant_plans
ALTER TABLE public.merchant_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read merchant plans (public info)
CREATE POLICY "Anyone can view merchant plans"
  ON public.merchant_plans FOR SELECT
  USING (true);

-- Create fee lookup function
CREATE OR REPLACE FUNCTION public.merchant_fee_percent(p_restaurant_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(mp.platform_fee_percent, 0.20)
  FROM restaurants r
  LEFT JOIN merchant_plans mp ON mp.code = r.plan_code
  WHERE r.id = p_restaurant_id
  LIMIT 1;
$$;;
