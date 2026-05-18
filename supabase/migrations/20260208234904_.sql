-- Fix Security Definer Views by adding security_invoker=on
-- These views were missing the security_invoker option, causing them to use SECURITY DEFINER behavior

-- 1. Recreate customer_orders_view with security_invoker=on
DROP VIEW IF EXISTS public.customer_orders_view;
CREATE VIEW public.customer_orders_view
WITH (security_invoker=on) AS
SELECT 
    id,
    customer_id AS user_id,
    restaurant_id,
    CASE status::text
        WHEN 'pending'::text THEN 'placed'::text
        WHEN 'in_progress'::text THEN 'preparing'::text
        WHEN 'ready_for_pickup'::text THEN 'ready'::text
        WHEN 'completed'::text THEN 'delivered'::text
        ELSE status::text
    END AS status,
    subtotal,
    delivery_fee,
    tax,
    0::numeric AS discount,
    total_amount AS total,
    delivery_address,
    delivery_lat,
    delivery_lng,
    items,
    special_instructions,
    created_at,
    updated_at
FROM food_orders;

-- 2. Recreate user_credit_balances with security_invoker=on
DROP VIEW IF EXISTS public.user_credit_balances;
CREATE VIEW public.user_credit_balances
WITH (security_invoker=on) AS
SELECT 
    user_id,
    sum(
        CASE
            WHEN expires_at IS NULL OR expires_at > now() THEN amount
            ELSE 0::numeric
        END) AS available_balance,
    sum(
        CASE
            WHEN amount > 0::numeric THEN amount
            ELSE 0::numeric
        END) AS total_earned,
    sum(
        CASE
            WHEN amount < 0::numeric THEN abs(amount)
            ELSE 0::numeric
        END) AS total_spent,
    count(*) AS transaction_count
FROM credit_ledger
GROUP BY user_id;

-- 3. Recreate v_my_restaurant_rank with security_invoker=on
DROP VIEW IF EXISTS public.v_my_restaurant_rank;
CREATE VIEW public.v_my_restaurant_rank
WITH (security_invoker=on) AS
SELECT 
    r.id,
    r.name,
    r.address,
    r.lat,
    r.lng,
    r.is_open,
    r.cuisine_type,
    r.description,
    r.logo_url,
    r.cover_image_url,
    r.rating,
    r.rating_count,
    r.avg_prep_time,
    r.cancel_rate,
    r.plan_code,
    r.status,
    r.phone,
    r.opening_hours,
    COALESCE(mp.placement_boost, 1.0) AS placement_boost
FROM restaurants r
LEFT JOIN merchant_plans mp ON mp.code = r.plan_code
WHERE r.status = 'active'::partner_status 
  AND r.lat IS NOT NULL 
  AND r.lng IS NOT NULL 
  AND r.owner_id = auth.uid();

-- 4. Recreate v_restaurant_rank with security_invoker=on
DROP VIEW IF EXISTS public.v_restaurant_rank;
CREATE VIEW public.v_restaurant_rank
WITH (security_invoker=on) AS
SELECT 
    r.id,
    r.name,
    r.address,
    r.lat,
    r.lng,
    r.is_open,
    r.cuisine_type,
    r.description,
    r.logo_url,
    r.cover_image_url,
    r.rating,
    r.rating_count,
    r.avg_prep_time,
    r.cancel_rate,
    r.plan_code,
    r.status,
    r.phone,
    r.opening_hours,
    COALESCE(mp.placement_boost, 1.0) AS placement_boost
FROM restaurants r
LEFT JOIN merchant_plans mp ON mp.code = r.plan_code
WHERE r.status = 'active'::partner_status 
  AND r.lat IS NOT NULL 
  AND r.lng IS NOT NULL;;
