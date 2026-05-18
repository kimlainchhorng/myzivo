-- Function to calculate restaurant queue wait time
CREATE OR REPLACE FUNCTION get_restaurant_queue_wait(
  p_restaurant_id UUID,
  p_order_id UUID DEFAULT NULL
)
RETURNS TABLE(
  orders_ahead INTEGER,
  estimated_wait_minutes INTEGER,
  is_busy BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_orders_ahead INTEGER;
  v_avg_prep INTEGER;
  v_busy_mode BOOLEAN;
  v_busy_bonus INTEGER;
  v_parallel_capacity INTEGER := 4; -- Assume 4 orders in parallel
BEGIN
  -- Count orders ahead in queue
  SELECT COUNT(*)::INTEGER INTO v_orders_ahead
  FROM food_orders fo
  WHERE fo.restaurant_id = p_restaurant_id
    AND fo.status IN ('placed', 'confirmed', 'preparing')
    AND fo.driver_id IS NULL
    AND (p_order_id IS NULL OR fo.id != p_order_id);

  -- Get restaurant prep settings
  SELECT 
    COALESCE(r.avg_prep_time, 15),
    COALESCE(r.busy_mode, false),
    COALESCE(r.busy_prep_time_bonus_minutes, 0)
  INTO v_avg_prep, v_busy_mode, v_busy_bonus
  FROM restaurants r
  WHERE r.id = p_restaurant_id;

  -- Calculate estimated wait
  RETURN QUERY SELECT
    v_orders_ahead,
    CASE 
      WHEN v_orders_ahead = 0 THEN 0
      ELSE GREATEST(0, CEIL(v_orders_ahead::NUMERIC * v_avg_prep / v_parallel_capacity)::INTEGER + 
           CASE WHEN v_busy_mode THEN v_busy_bonus ELSE 0 END)
    END,
    v_busy_mode;
END;
$$;;
