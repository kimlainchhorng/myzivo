
-- Step 1: Drop and recreate drivers_public view with correct columns
DROP VIEW IF EXISTS public.drivers_public;
CREATE VIEW public.drivers_public
WITH (security_invoker = on) AS
SELECT
  id, user_id, full_name, avatar_url, vehicle_type, vehicle_model,
  status, rating, rating_count, total_trips, total_deliveries,
  is_online, current_lat, current_lng, last_heading, last_speed,
  region_id, zone_code, home_city, is_verified,
  rides_enabled, eats_enabled, move_enabled,
  level, streak_days, longest_streak,
  acceptance_rate, completion_rate, on_time_rate, performance_score,
  created_at, updated_at, last_active_at
FROM public.drivers;

-- Step 2: Create square_connections_safe view (excludes tokens)
CREATE VIEW public.square_connections_safe
WITH (security_invoker = on) AS
SELECT
  id, user_id, square_merchant_id, square_location_id, env,
  location_ids, token_type, scopes, last_sync_at, status,
  error_message, created_at, updated_at
FROM public.square_connections;

-- Step 3: Drop overly permissive drivers SELECT policies
DROP POLICY IF EXISTS "Authenticated users can read online driver locations" ON public.drivers;
DROP POLICY IF EXISTS "drivers_customer_tracking" ON public.drivers;
;
