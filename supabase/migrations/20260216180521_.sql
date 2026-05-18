-- Fix get_merchant_orders: column food_orders.user_id does not exist, should be customer_id
CREATE OR REPLACE FUNCTION public.get_merchant_orders(
  p_restaurant_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  status TEXT,
  customer_name TEXT,
  items_count INT,
  total_amount NUMERIC,
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fo.id,
    fo.status,
    COALESCE(p.full_name, fo.customer_name, 'Guest')::TEXT as customer_name,
    COALESCE((SELECT COUNT(*)::INT FROM food_order_items foi WHERE foi.order_id = fo.id), 0) as items_count,
    fo.total_amount,
    fo.delivery_address,
    fo.special_instructions,
    fo.created_at,
    fo.updated_at
  FROM food_orders fo
  LEFT JOIN profiles p ON p.id = fo.customer_id
  WHERE fo.restaurant_id = p_restaurant_id
    AND (p_status IS NULL OR fo.status = p_status)
  ORDER BY 
    CASE fo.status 
      WHEN 'pending' THEN 1 
      WHEN 'confirmed' THEN 2 
      WHEN 'preparing' THEN 3 
      WHEN 'ready' THEN 4
      ELSE 5 
    END,
    fo.created_at DESC
  LIMIT p_limit;
END;
$$;;
