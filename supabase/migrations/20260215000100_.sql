
CREATE OR REPLACE FUNCTION public.get_order_by_tracking_code(
  _tracking_code text,
  _tenant_slug text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  _tenant_id uuid;
BEGIN
  -- Resolve tenant if slug provided
  IF _tenant_slug IS NOT NULL THEN
    SELECT id INTO _tenant_id 
    FROM tenants 
    WHERE slug = _tenant_slug AND active = true;
  END IF;

  -- Find order (only return safe driver fields, no PII)
  SELECT json_build_object(
    'order', row_to_json(o),
    'driver', CASE WHEN o.driver_id IS NOT NULL THEN (
      SELECT json_build_object(
        'id', d.id,
        'name', d.name,
        'car_model', d.car_model,
        'rating', d.rating,
        'last_lat', d.last_lat,
        'last_lng', d.last_lng
      ) FROM drivers d WHERE d.id = o.driver_id
    ) ELSE NULL END,
    'events', (
      SELECT COALESCE(json_agg(row_to_json(e) ORDER BY e.created_at ASC), '[]'::json)
      FROM order_events e WHERE e.order_id = o.id
    ),
    'tenant', (
      SELECT json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      ) FROM tenants t WHERE t.id = o.tenant_id
    )
  ) INTO result
  FROM orders o
  WHERE o.tracking_code = _tracking_code
    AND (_tenant_id IS NULL OR o.tenant_id = _tenant_id);
  
  IF result IS NULL THEN
    RETURN json_build_object('error', 'Order not found');
  END IF;
  
  RETURN result;
END;
$$;
;
