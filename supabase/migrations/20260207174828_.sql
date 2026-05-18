-- Add payout tracking columns to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS driver_payout_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS payout_idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS payout_error TEXT,
ADD COLUMN IF NOT EXISTS payout_at TIMESTAMPTZ;

-- Add unique constraint for idempotency key on trips
ALTER TABLE public.trips ADD CONSTRAINT trips_payout_idempotency_key_unique UNIQUE (payout_idempotency_key);

-- Add payout tracking columns to food_orders table
ALTER TABLE public.food_orders 
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS driver_payout_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS payout_idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS payout_error TEXT,
ADD COLUMN IF NOT EXISTS payout_at TIMESTAMPTZ;

-- Add unique constraint for idempotency key on food_orders
ALTER TABLE public.food_orders ADD CONSTRAINT food_orders_payout_idempotency_key_unique UNIQUE (payout_idempotency_key);

-- Create platform_settings table for configurable values
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read platform settings
CREATE POLICY "Admins can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('driver_commission_percent', '"20"', 'Default platform commission percentage (taken from driver earnings)'),
  ('min_payout_cents', '"0"', 'Minimum payout threshold in cents')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster payout queries
CREATE INDEX IF NOT EXISTS idx_trips_payout_status ON public.trips(payout_status);
CREATE INDEX IF NOT EXISTS idx_food_orders_payout_status ON public.food_orders(payout_status);;
