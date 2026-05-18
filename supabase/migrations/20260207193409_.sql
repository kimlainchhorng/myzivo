-- Create platform_pricing table for global delivery pricing configuration
CREATE TABLE public.platform_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_delivery_fee_cents int NOT NULL DEFAULT 199,
  per_mile_fee_cents int NOT NULL DEFAULT 150,
  minimum_delivery_fee_cents int NOT NULL DEFAULT 299,
  maximum_delivery_fee_cents int NOT NULL DEFAULT 1999,
  service_fee_percent int NOT NULL DEFAULT 5,
  tax_percent int NOT NULL DEFAULT 0,
  surge_enabled boolean NOT NULL DEFAULT true,
  surge_multiplier numeric NOT NULL DEFAULT 1.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default pricing row
INSERT INTO public.platform_pricing (is_active) VALUES (true);

-- Enable RLS
ALTER TABLE public.platform_pricing ENABLE ROW LEVEL SECURITY;

-- Anyone can read active pricing
CREATE POLICY "Anyone can read active pricing" ON public.platform_pricing
  FOR SELECT USING (is_active = true);

-- Create driver_pay_rules table for driver compensation configuration
CREATE TABLE public.driver_pay_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_pay_cents int NOT NULL DEFAULT 300,
  per_mile_pay_cents int NOT NULL DEFAULT 100,
  min_pay_cents int NOT NULL DEFAULT 500,
  tip_to_driver_percent int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default driver pay rules
INSERT INTO public.driver_pay_rules (is_active) VALUES (true);

-- Enable RLS
ALTER TABLE public.driver_pay_rules ENABLE ROW LEVEL SECURITY;

-- Anyone can read active rules
CREATE POLICY "Anyone can read active driver pay rules" ON public.driver_pay_rules
  FOR SELECT USING (is_active = true);

-- Add busy_mode to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS busy_mode boolean DEFAULT false;

-- Add granular pricing fields to food_orders
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS delivery_fee_cents int DEFAULT 0,
ADD COLUMN IF NOT EXISTS surge_fee_cents int DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee_cents int DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_earnings_cents int DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_breakdown jsonb DEFAULT '{}';;
