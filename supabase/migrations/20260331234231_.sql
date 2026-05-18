
-- Add country parameter to calculate_quote RPC
CREATE OR REPLACE FUNCTION public.calculate_quote(
  p_service_type text,
  p_distance_miles numeric,
  p_duration_minutes numeric,
  p_vehicle_type text DEFAULT NULL,
  p_surge_multiplier numeric DEFAULT 1.0,
  p_country text DEFAULT 'US'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
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
  -- Get pricing rule filtered by country
  SELECT * INTO r
  FROM service_pricing
  WHERE service_type = p_service_type
    AND (vehicle_type = p_vehicle_type OR (vehicle_type IS NULL AND p_vehicle_type IS NULL))
    AND country = p_country
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF r IS NULL THEN
    -- Fallback: try without vehicle_type filter for the same country
    SELECT * INTO r
    FROM service_pricing
    WHERE service_type = p_service_type
      AND country = p_country
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF r IS NULL THEN
    -- Last resort fallback for rides: try economy in same country
    IF p_service_type = 'ride' THEN
      SELECT * INTO r
      FROM service_pricing
      WHERE service_type = 'ride'
        AND vehicle_type = 'economy'
        AND country = p_country
        AND is_active = true
      LIMIT 1;
    END IF;
  END IF;

  IF r IS NULL THEN
    RAISE EXCEPTION 'No active pricing rule for service_type=% country=%', p_service_type, p_country;
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
    'driver_payout', ROUND(driver_payout::numeric, 2),
    'country', p_country
  );
END;
$$;
;
