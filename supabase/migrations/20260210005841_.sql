CREATE OR REPLACE FUNCTION public.auto_assign_order(
  p_order_id uuid,
  p_restaurant_lat double precision DEFAULT NULL,
  p_restaurant_lng double precision DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
  -- When restaurant coordinates provided: nearest first (within 10 mi), then fewest active orders
  -- Without coordinates: fewest active orders, most recently active (backward compatible)
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
  AND (
    -- When lat/lng provided, cap to 10 miles
    p_restaurant_lat IS NULL
    OR p_restaurant_lng IS NULL
    OR d.current_lat IS NULL
    OR d.current_lng IS NULL
    OR (
      3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_restaurant_lat)) * cos(radians(d.current_lat))
          * cos(radians(d.current_lng) - radians(p_restaurant_lng))
          + sin(radians(p_restaurant_lat)) * sin(radians(d.current_lat))
        ))
      ) <= 10
    )
  )
  ORDER BY 
    -- Drivers with location + restaurant coords: sort by distance first
    CASE 
      WHEN p_restaurant_lat IS NOT NULL AND p_restaurant_lng IS NOT NULL 
           AND d.current_lat IS NOT NULL AND d.current_lng IS NOT NULL 
      THEN 3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_restaurant_lat)) * cos(radians(d.current_lat))
          * cos(radians(d.current_lng) - radians(p_restaurant_lng))
          + sin(radians(p_restaurant_lat)) * sin(radians(d.current_lat))
        ))
      )
      ELSE 999999
    END ASC,
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
$function$;;
