-- Fix all functions missing search_path parameter
-- This prevents potential search_path injection attacks

-- 1. deduct_merchant_balance (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.deduct_merchant_balance(p_restaurant_id uuid, p_amount_cents integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT pending INTO current_balance
  FROM merchant_balances
  WHERE restaurant_id = p_restaurant_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    INSERT INTO merchant_balances (restaurant_id, pending, paid_out, currency)
    VALUES (p_restaurant_id, 0, 0, 'USD');
    RETURN FALSE;
  END IF;
  
  IF current_balance >= (p_amount_cents / 100.0) THEN
    UPDATE merchant_balances
    SET pending = pending - (p_amount_cents / 100.0),
        updated_at = now()
    WHERE restaurant_id = p_restaurant_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;

-- 2. find_nearest_drivers (double precision version - SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.find_nearest_drivers(p_lat double precision, p_lng double precision, p_radius double precision DEFAULT 8, p_limit integer DEFAULT 5, p_mode text DEFAULT 'RIDES'::text)
RETURNS TABLE(driver_id uuid, distance_miles numeric, priority_score integer, performance_score integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS driver_id,
    (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    )::numeric AS distance_miles,
    COALESCE(d.priority_score, 1) AS priority_score,
    COALESCE(d.performance_score, 50) AS performance_score
  FROM drivers d
  WHERE d.is_online = true
    AND d.current_mode = p_mode
    AND d.current_lat IS NOT NULL
    AND d.current_lng IS NOT NULL
    AND d.last_location_at > NOW() - INTERVAL '2 minutes'
    AND (
      3959 * acos(
        cos(radians(p_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(d.current_lat))
      )
    ) <= p_radius
  ORDER BY 
    (COALESCE(d.priority_score, 1) * 10 + COALESCE(d.performance_score, 50) / 10) DESC,
    distance_miles ASC,
    d.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$function$;

-- 3. generate_compliance_alerts (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.generate_compliance_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  days_warning INTEGER := 7;
BEGIN
  UPDATE driver_documents
  SET status = 'expired'
  WHERE status = 'approved'
  AND expires_at IS NOT NULL
  AND expires_at < CURRENT_DATE;
  
  UPDATE merchant_documents
  SET status = 'expired'
  WHERE status = 'approved'
  AND expires_at IS NOT NULL
  AND expires_at < CURRENT_DATE;
  
  UPDATE drivers d
  SET documents_verified = false
  WHERE documents_verified = true
  AND EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = d.id
    AND dd.status = 'expired'
  );
  
  UPDATE restaurants r
  SET documents_verified = false
  WHERE documents_verified = true
  AND EXISTS (
    SELECT 1 FROM merchant_documents md
    WHERE md.merchant_id = r.id
    AND md.status = 'expired'
  );
  
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'driver',
    driver_id,
    id,
    'expiring_soon',
    document_type || ' expires in ' || (expires_at - CURRENT_DATE) || ' days'
  FROM driver_documents
  WHERE status = 'approved'
  AND expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + days_warning
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = driver_documents.id
    AND ca.alert_type = 'expiring_soon'
    AND ca.is_resolved = false
  );
  
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'driver',
    driver_id,
    id,
    'expired',
    document_type || ' has expired'
  FROM driver_documents
  WHERE status = 'expired'
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = driver_documents.id
    AND ca.alert_type = 'expired'
    AND ca.is_resolved = false
  );
  
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'merchant',
    merchant_id,
    id,
    'expiring_soon',
    document_type || ' expires in ' || (expires_at - CURRENT_DATE) || ' days'
  FROM merchant_documents
  WHERE status = 'approved'
  AND expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + days_warning
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = merchant_documents.id
    AND ca.alert_type = 'expiring_soon'
    AND ca.is_resolved = false
  );
  
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'merchant',
    merchant_id,
    id,
    'expired',
    document_type || ' has expired'
  FROM merchant_documents
  WHERE status = 'expired'
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = merchant_documents.id
    AND ca.alert_type = 'expired'
    AND ca.is_resolved = false
  );
END;
$function$;

-- 4. generate_delivery_pin (trigger function)
CREATE OR REPLACE FUNCTION public.generate_delivery_pin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.status IN ('out_for_delivery', 'in_progress') 
     AND (OLD.status IS NULL OR OLD.status NOT IN ('out_for_delivery', 'in_progress'))
     AND NEW.delivery_pin IS NULL THEN
    NEW.delivery_pin := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    NEW.delivery_pin_verified := FALSE;
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. get_default_pricing_zone_id (STABLE)
CREATE OR REPLACE FUNCTION public.get_default_pricing_zone_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT id FROM public.pricing_zones WHERE name = 'Default US' LIMIT 1
$function$;

-- 6. get_tier_from_points (IMMUTABLE)
CREATE OR REPLACE FUNCTION public.get_tier_from_points(lifetime_pts integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  IF lifetime_pts >= 25000 THEN
    RETURN 'elite';
  ELSIF lifetime_pts >= 5000 THEN
    RETURN 'traveler';
  ELSE
    RETURN 'explorer';
  END IF;
END;
$function$;

-- 7. get_today_ad_spend (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_today_ad_spend(p_ad_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  today_spent NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount_cents) / 100.0, 0) INTO today_spent
  FROM ad_billing_events
  WHERE ad_id = p_ad_id
    AND event_type = 'click_charge'
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN today_spent;
END;
$function$;

-- 8. get_week_start (IMMUTABLE)
CREATE OR REPLACE FUNCTION public.get_week_start(d timestamp with time zone)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  RETURN date_trunc('week', d)::date;
END;
$function$;

-- 9. haversine_miles
CREATE OR REPLACE FUNCTION public.haversine_miles(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $function$
declare
  r numeric := 3958.7613;
  dlat numeric := radians(lat2 - lat1);
  dlon numeric := radians(lon2 - lon1);
  a numeric;
  c numeric;
begin
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  return r * c;
end;
$function$;

-- 10. log_order_status_change (SECURITY DEFINER trigger)
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_events (order_id, type, actor_role, data)
    VALUES (
      NEW.id,
      'status_' || NEW.status,
      COALESCE(current_setting('app.actor_role', true), 'system'),
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', now()
      )
    );
  END IF;
  
  IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
    INSERT INTO order_events (order_id, type, actor_role, data)
    VALUES (
      NEW.id,
      'driver_assigned',
      COALESCE(current_setting('app.actor_role', true), 'system'),
      jsonb_build_object(
        'driver_id', NEW.driver_id,
        'assigned_at', now()
      )
    );
  END IF;
  
  IF OLD.driver_id IS NOT NULL AND NEW.driver_id IS NULL THEN
    INSERT INTO order_events (order_id, type, actor_role, data)
    VALUES (
      NEW.id,
      'driver_unassigned',
      COALESCE(current_setting('app.actor_role', true), 'system'),
      jsonb_build_object(
        'previous_driver_id', OLD.driver_id,
        'unassigned_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 11. log_wrong_pin_attempt (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_wrong_pin_attempt(p_order_id uuid, p_driver_id uuid)
RETURNS TABLE(attempts integer, is_locked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_attempts int;
  v_customer_id uuid;
BEGIN
  UPDATE food_orders 
  SET pin_attempts = COALESCE(pin_attempts, 0) + 1,
      updated_at = NOW()
  WHERE id = p_order_id
  RETURNING pin_attempts, customer_id INTO v_attempts, v_customer_id;
  
  INSERT INTO order_events (order_id, type, data)
  VALUES (p_order_id, 'wrong_pin_attempt', jsonb_build_object(
    'driver_id', p_driver_id,
    'attempt_number', v_attempts
  ));
  
  IF v_attempts >= 3 THEN
    INSERT INTO risk_events (event_type, severity, score, user_id, details)
    VALUES (
      'wrong_pin_limit', 
      4, 
      30, 
      p_driver_id, 
      jsonb_build_object(
        'order_id', p_order_id,
        'attempts', v_attempts,
        'customer_id', v_customer_id
      )
    );
  END IF;
  
  RETURN QUERY SELECT v_attempts, (v_attempts >= 3);
END;
$function$;

-- 12. notify_order_status_change (SECURITY DEFINER trigger)
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      NEW.customer_id,
      'push',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Order Confirmed! 🎉'
        WHEN 'preparing' THEN 'Your order is being prepared 👨‍🍳'
        WHEN 'ready_for_pickup' THEN 'Order ready for pickup! 📦'
        WHEN 'out_for_delivery' THEN 'Your order is on the way! 🚗'
        WHEN 'delivered' THEN 'Order delivered! ✅'
        ELSE 'Order Update'
      END,
      'Order #' || NEW.order_number,
      jsonb_build_object('type', 'order_status', 'order_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 13. notify_ticket_reply (SECURITY DEFINER trigger)
CREATE OR REPLACE FUNCTION public.notify_ticket_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_ticket support_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
  
  IF NEW.is_admin AND v_ticket.user_id IS DISTINCT FROM NEW.user_id THEN
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      v_ticket.user_id,
      'push',
      'Support Reply 💬',
      LEFT(NEW.message, 100),
      jsonb_build_object('type', 'chat_message', 'ticket_id', NEW.ticket_id)
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 14. update_applications_updated_at (trigger)
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 15. update_driver_weekly_earnings_on_delivery (trigger)
CREATE OR REPLACE FUNCTION public.update_driver_weekly_earnings_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_week_start DATE;
  v_passenger_amount NUMERIC;
  v_external_fees NUMERIC;
  v_driver_earnings NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NEW.driver_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    v_week_start := get_week_start(COALESCE(NEW.delivered_at, NOW()));
    
    v_passenger_amount := COALESCE(NEW.total_amount, 0);
    v_external_fees := COALESCE(NEW.platform_fee, 0) + COALESCE(NEW.service_fee_cents, 0) / 100.0;
    v_driver_earnings := COALESCE(NEW.driver_earnings_cents, 0) / 100.0;
    
    INSERT INTO driver_weekly_earnings (
      driver_id, 
      week_start, 
      passenger_total, 
      external_fees_total, 
      driver_earnings_total,
      updated_at
    )
    VALUES (
      NEW.driver_id,
      v_week_start,
      v_passenger_amount,
      v_external_fees,
      v_driver_earnings,
      NOW()
    )
    ON CONFLICT (driver_id, week_start)
    DO UPDATE SET
      passenger_total = driver_weekly_earnings.passenger_total + v_passenger_amount,
      external_fees_total = driver_weekly_earnings.external_fees_total + v_external_fees,
      driver_earnings_total = driver_weekly_earnings.driver_earnings_total + v_driver_earnings,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 16. verify_delivery_pin (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.verify_delivery_pin(p_order_id uuid, p_driver_id uuid, p_pin text)
RETURNS TABLE(success boolean, error_message text, attempts_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_order RECORD;
BEGIN
  SELECT delivery_pin, pin_attempts, status, driver_id 
  INTO v_order
  FROM food_orders 
  WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN QUERY SELECT false, 'Order not found'::text, 0;
    RETURN;
  END IF;
  
  IF v_order.driver_id != p_driver_id THEN
    RETURN QUERY SELECT false, 'Not authorized for this order'::text, 0;
    RETURN;
  END IF;
  
  IF COALESCE(v_order.pin_attempts, 0) >= 3 THEN
    RETURN QUERY SELECT false, 'Too many attempts. Contact support.'::text, 0;
    RETURN;
  END IF;
  
  IF v_order.delivery_pin = p_pin THEN
    UPDATE food_orders 
    SET status = 'delivered',
        delivery_pin_verified = TRUE,
        delivered_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id;
    
    INSERT INTO order_events (order_id, type, data)
    VALUES (p_order_id, 'delivered', jsonb_build_object(
      'driver_id', p_driver_id,
      'pin_verified', true
    ));
    
    RETURN QUERY SELECT true, NULL::text, 3;
  ELSE
    PERFORM log_wrong_pin_attempt(p_order_id, p_driver_id);
    
    RETURN QUERY SELECT 
      false, 
      'Incorrect PIN. Please try again.'::text, 
      GREATEST(0, 3 - COALESCE(v_order.pin_attempts, 0) - 1);
  END IF;
END;
$function$;;
