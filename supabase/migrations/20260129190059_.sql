-- Phase 5: Fix remaining security issues

-- =============================================================================
-- 1. Fix "RLS Policy Always True" warnings
-- =============================================================================

-- Reservations: Require authentication for inserts (but any authenticated user can make a reservation)
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;

CREATE POLICY "Authenticated users can create reservations"
ON public.reservations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Audit logs: Keep insert open for logging (this is acceptable - logs need to be created)
-- But we can make it require authentication
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 2. Fix publicly accessible forum/community data - require authentication
-- =============================================================================

-- Forum posts: Require authentication to view
DROP POLICY IF EXISTS "Anyone can read forum posts" ON public.forum_posts;

CREATE POLICY "Authenticated users can view forum posts"
ON public.forum_posts FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Forum replies: Require authentication
DROP POLICY IF EXISTS "Anyone can read replies" ON public.forum_replies;

CREATE POLICY "Authenticated users can view forum replies"
ON public.forum_replies FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Forum post likes: Require authentication
DROP POLICY IF EXISTS "Anyone can read post likes" ON public.forum_post_likes;

CREATE POLICY "Authenticated users can view post likes"
ON public.forum_post_likes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Community tips: Require authentication
DROP POLICY IF EXISTS "Anyone can view community tips" ON public.community_tips;

CREATE POLICY "Authenticated users can view community tips"
ON public.community_tips FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Community tip likes: Require authentication
DROP POLICY IF EXISTS "Anyone can view tip likes" ON public.community_tip_likes;

CREATE POLICY "Authenticated users can view tip likes"
ON public.community_tip_likes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- 3. System settings: Require authentication or create a safe public view
-- =============================================================================

-- First, restrict the main table to admins
DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public can view system settings" ON public.system_settings;

CREATE POLICY "Only admins can view system settings"
ON public.system_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create a safe public view with only truly public settings
CREATE OR REPLACE VIEW public.system_settings_public
WITH (security_invoker = on) AS
SELECT 
  key, value
FROM public.system_settings
WHERE key IN ('app_version', 'terms_version', 'privacy_version');

-- =============================================================================
-- 4. Drop the problematic public views and recreate with proper RLS
-- Note: Views inherit RLS from underlying tables when using security_invoker
-- But we need to ensure the underlying tables have proper policies
-- =============================================================================

-- For drivers_public: The underlying drivers table has proper RLS
-- The view uses security_invoker which means it checks permissions
-- However, customers viewing drivers during active orders is a valid use case

-- For vehicles_public: Same situation - proper RLS on vehicles table
-- But the license_plate is visible - let's hide it for non-owners

DROP VIEW IF EXISTS public.vehicles_public;

CREATE OR REPLACE VIEW public.vehicles_public
WITH (security_invoker = on) AS
SELECT 
  id, driver_id, make, model, year, color,
  mileage, fuel_type, is_primary, health_score, approval_status, 
  created_at, updated_at
  -- Excludes: license_plate, vin for non-owners
FROM public.vehicles;

-- =============================================================================
-- 5. Customer order items: Restrict to restaurant owners
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can view order items" ON public.customer_order_items;

CREATE POLICY "Restaurant owners can view order items"
ON public.customer_order_items FOR SELECT
USING (
  order_id IN (
    SELECT co.id FROM customer_orders co 
    WHERE public.is_restaurant_owner(co.restaurant_id)
  )
);

-- =============================================================================
-- 6. Achievement definitions: Keep public read (static reference data)
-- This is acceptable - it's just the list of available achievements
-- =============================================================================

-- Training courses: Keep public read (educational content)
-- This is acceptable - it's reference data for training

-- =============================================================================
-- 7. Grant admin full access to key management tables
-- =============================================================================

-- Admins can view all security-related data for monitoring
CREATE POLICY "Admins view all security events"
ON public.security_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all login sessions"
ON public.login_sessions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all driver documents"
ON public.driver_documents FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));;
