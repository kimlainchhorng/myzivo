-- ============================================
-- PRICING ENGINE + SAFE AUTO-ASSIGN MIGRATION
-- ============================================

-- 1. Create pricing_config table (admin-controlled, dollar values)
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT true,
  
  -- Fare calculation (in dollars)
  base_fare numeric NOT NULL DEFAULT 2.50,
  per_mile_rate numeric NOT NULL DEFAULT 1.50,
  per_minute_rate numeric NOT NULL DEFAULT 0.20,
  minimum_fare numeric NOT NULL DEFAULT 5.00,
  
  -- Fees
  service_fee_flat numeric NOT NULL DEFAULT 1.99,
  service_fee_percent numeric NOT NULL DEFAULT 0.05,
  
  -- Driver payout
  driver_payout_percent numeric NOT NULL DEFAULT 0.80,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed one active row with defaults
INSERT INTO public.pricing_config (is_active) VALUES (true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read active settings
CREATE POLICY "Anyone can read active pricing config" ON public.pricing_config
  FOR SELECT USING (is_active = true);

-- 2. Add new pricing fields to food_orders
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS base_fare numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS per_mile_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS per_minute_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_driver numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_version text DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS pricing_locked boolean DEFAULT false;

-- 3. Create calculate_order_price() RPC function
CREATE OR REPLACE FUNCTION public.calculate_order_price(
  p_distance_miles numeric,
  p_duration_minutes numeric,
  p_tip numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings record;
  v_subtotal numeric;
  v_service_fee numeric;
  v_tax numeric := 0;
  v_total_amount numeric;
  v_payout_driver numeric;
  v_platform_fee numeric;
  v_result jsonb;
BEGIN
  -- Load active pricing config
  SELECT * INTO v_settings 
  FROM pricing_config 
  WHERE is_active = true 
  LIMIT 1;
  
  -- Use defaults if no settings found
  IF NOT FOUND THEN
    v_settings.base_fare := 2.50;
    v_settings.per_mile_rate := 1.50;
    v_settings.per_minute_rate := 0.20;
    v_settings.minimum_fare := 5.00;
    v_settings.service_fee_flat := 1.99;
    v_settings.service_fee_percent := 0.05;
    v_settings.driver_payout_percent := 0.80;
  END IF;
  
  -- Calculate subtotal
  v_subtotal := v_settings.base_fare 
              + (v_settings.per_mile_rate * COALESCE(p_distance_miles, 0)) 
              + (v_settings.per_minute_rate * COALESCE(p_duration_minutes, 0));
  
  -- Apply minimum fare
  v_subtotal := GREATEST(v_subtotal, v_settings.minimum_fare);
  
  -- Calculate service fee (flat + percentage)
  v_service_fee := v_settings.service_fee_flat 
                 + (v_settings.service_fee_percent * v_subtotal);
  
  -- Calculate total
  v_total_amount := v_subtotal + v_service_fee + v_tax + COALESCE(p_tip, 0);
  
  -- Calculate driver payout (percent of subtotal only)
  v_payout_driver := v_subtotal * v_settings.driver_payout_percent;
  
  -- Platform fee = total - driver payout - tax - tip
  v_platform_fee := v_total_amount - v_payout_driver - v_tax - COALESCE(p_tip, 0);
  
  -- Build result
  v_result := jsonb_build_object(
    'base_fare', v_settings.base_fare,
    'per_mile_rate', v_settings.per_mile_rate,
    'per_minute_rate', v_settings.per_minute_rate,
    'minimum_fare', v_settings.minimum_fare,
    'distance_miles', COALESCE(p_distance_miles, 0),
    'duration_minutes', COALESCE(p_duration_minutes, 0),
    'subtotal', ROUND(v_subtotal::numeric, 2),
    'service_fee', ROUND(v_service_fee::numeric, 2),
    'tax', ROUND(v_tax::numeric, 2),
    'tip', ROUND(COALESCE(p_tip, 0)::numeric, 2),
    'total_amount', ROUND(v_total_amount::numeric, 2),
    'payout_driver', ROUND(v_payout_driver::numeric, 2),
    'platform_fee', ROUND(v_platform_fee::numeric, 2),
    'pricing_version', 'v1'
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_order_price(numeric, numeric, numeric) TO authenticated;

-- 4. Create auto_assign_order() RPC function with safe locking
CREATE OR REPLACE FUNCTION public.auto_assign_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_driver record;
  v_result jsonb;
BEGIN
  -- Lock the order row to prevent concurrent assignments
  SELECT * INTO v_order 
  FROM food_orders 
  WHERE id = p_order_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'order_not_found'
    );
  END IF;
  
  -- Check if already assigned
  IF v_order.driver_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_assigned',
      'driver_id', v_order.driver_id
    );
  END IF;
  
  -- Check status - only assign pending/new/confirmed orders
  IF v_order.status NOT IN ('pending', 'new', 'confirmed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'invalid_status',
      'status', v_order.status
    );
  END IF;
  
  -- Find best available driver
  -- Priority: online, verified, eats_enabled, fewest active orders, most recently active
  SELECT d.* INTO v_driver
  FROM drivers d
  LEFT JOIN (
    SELECT driver_id, COUNT(*) as active_count
    FROM food_orders
    WHERE driver_id IS NOT NULL
    AND status IN ('confirmed', 'in_progress', 'ready_for_pickup', 'assigned')
    GROUP BY driver_id
  ) active ON d.id = active.driver_id
  WHERE d.is_online = true
  AND d.status = 'verified'
  AND d.eats_enabled = true
  ORDER BY 
    COALESCE(active.active_count, 0) ASC,
    d.last_active_at DESC NULLS LAST
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_drivers_available'
    );
  END IF;
  
  -- Assign driver atomically
  UPDATE food_orders
  SET 
    driver_id = v_driver.id,
    assigned_at = now(),
    driver_response_status = 'pending',
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Insert status event
  INSERT INTO order_status_events (
    order_id,
    status,
    notes,
    created_by
  ) VALUES (
    p_order_id,
    'assigned',
    'Auto-assigned to driver: ' || v_driver.full_name,
    v_driver.user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'driver_id', v_driver.id,
    'driver_name', v_driver.full_name,
    'driver_phone', v_driver.phone,
    'driver_vehicle', v_driver.vehicle_type
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.auto_assign_order(uuid) TO authenticated;;
