-- Create service_pricing table for unified pricing rules
CREATE TABLE IF NOT EXISTS public.service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('ride', 'eats', 'delivery')),
  vehicle_type text DEFAULT NULL,
  base_fare numeric NOT NULL DEFAULT 0,
  per_mile numeric NOT NULL DEFAULT 0,
  per_minute numeric NOT NULL DEFAULT 0,
  minimum_fare numeric NOT NULL DEFAULT 0,
  platform_fee_flat numeric NOT NULL DEFAULT 0.99,
  platform_fee_percent numeric NOT NULL DEFAULT 0.08,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint per service_type + vehicle_type combo
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_pricing_unique 
ON public.service_pricing(service_type, COALESCE(vehicle_type, ''));

-- Enable RLS
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Anyone can view active pricing
CREATE POLICY "Anyone can view active pricing" ON public.service_pricing
  FOR SELECT USING (is_active = true);

-- Seed default pricing rules
INSERT INTO public.service_pricing (service_type, vehicle_type, base_fare, per_mile, per_minute, minimum_fare, platform_fee_flat, platform_fee_percent)
VALUES
  ('ride', 'economy', 2.50, 1.60, 0.25, 6.00, 0.99, 0.08),
  ('ride', 'comfort', 3.50, 2.00, 0.30, 8.00, 0.99, 0.08),
  ('ride', 'premium', 5.00, 2.80, 0.45, 12.00, 0.99, 0.08),
  ('ride', 'xl', 4.00, 2.20, 0.35, 10.00, 0.99, 0.08),
  ('delivery', NULL, 2.00, 1.25, 0.10, 5.00, 0.99, 0.08),
  ('eats', NULL, 1.50, 1.10, 0.08, 4.50, 0.99, 0.08)
ON CONFLICT DO NOTHING;

-- Add platform fee columns to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS surge_multiplier numeric DEFAULT 1.0;

-- Add platform fee columns to food_orders table
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS surge_multiplier numeric DEFAULT 1.0;

-- Create calculate_quote RPC function
CREATE OR REPLACE FUNCTION public.calculate_quote(
  p_service_type text,
  p_distance_miles numeric,
  p_duration_minutes numeric,
  p_vehicle_type text DEFAULT NULL,
  p_surge_multiplier numeric DEFAULT 1.0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  fare numeric;
  surge_fare numeric;
  platform_fee numeric;
  customer_total numeric;
  driver_payout numeric;
BEGIN
  -- Get pricing rule
  SELECT * INTO r
  FROM service_pricing
  WHERE service_type = p_service_type
    AND (vehicle_type = p_vehicle_type OR (vehicle_type IS NULL AND p_vehicle_type IS NULL))
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF r IS NULL THEN
    -- Fallback for rides: try economy
    IF p_service_type = 'ride' THEN
      SELECT * INTO r
      FROM service_pricing
      WHERE service_type = 'ride'
        AND vehicle_type = 'economy'
        AND is_active = true
      LIMIT 1;
    END IF;
  END IF;

  IF r IS NULL THEN
    RAISE EXCEPTION 'No active pricing rule for service_type=%', p_service_type;
  END IF;

  -- Calculate base fare
  fare := r.base_fare 
        + (r.per_mile * p_distance_miles) 
        + (r.per_minute * p_duration_minutes);

  -- Apply minimum fare
  IF fare < r.minimum_fare THEN
    fare := r.minimum_fare;
  END IF;

  -- Apply surge multiplier
  surge_fare := fare * COALESCE(p_surge_multiplier, 1.0);

  -- Calculate platform fee
  platform_fee := r.platform_fee_flat + (surge_fare * r.platform_fee_percent);

  -- Customer total
  customer_total := surge_fare + platform_fee;

  -- Driver payout (fare after surge, before platform fee)
  driver_payout := surge_fare;

  RETURN jsonb_build_object(
    'service_type', p_service_type,
    'vehicle_type', p_vehicle_type,
    'distance_miles', p_distance_miles,
    'duration_minutes', p_duration_minutes,
    'base_fare', r.base_fare,
    'per_mile', r.per_mile,
    'per_minute', r.per_minute,
    'minimum_fare', r.minimum_fare,
    'surge_multiplier', COALESCE(p_surge_multiplier, 1.0),
    'subtotal', ROUND(surge_fare::numeric, 2),
    'platform_fee', ROUND(platform_fee::numeric, 2),
    'customer_total', ROUND(customer_total::numeric, 2),
    'driver_payout', ROUND(driver_payout::numeric, 2)
  );
END;
$$;;
