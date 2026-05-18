
-- =============================================
-- STEP 1: Fix Critical Driver PII Data Leak
-- =============================================
DROP POLICY IF EXISTS "drivers_select_authed" ON public.drivers;

-- =============================================
-- STEP 2: Lock Down Public INSERT Policies
-- =============================================

-- Fix admin_login_attempts: restrict to service_role only
DROP POLICY IF EXISTS "insert_login_attempts_constrained" ON public.admin_login_attempts;
CREATE POLICY "service_role_insert_login_attempts"
  ON public.admin_login_attempts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix automated_message_log: restrict to service_role only
DROP POLICY IF EXISTS "Service role can insert automated messages" ON public.automated_message_log;
CREATE POLICY "service_role_insert_automated_messages"
  ON public.automated_message_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix surge_notifications: restrict to service_role only
DROP POLICY IF EXISTS "Service role can insert surge notifications" ON public.surge_notifications;
CREATE POLICY "service_role_insert_surge_notifications"
  ON public.surge_notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =============================================
-- STEP 3: Add RLS Policies for User-Facing Tables
-- =============================================

-- user_addresses: users read/write their own
CREATE POLICY "Users can view own addresses"
  ON public.user_addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.user_addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.user_addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.user_addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- user_preferences: users read/write their own
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- reviews: public read, authenticated write own reviews
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reviewer_user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated USING (auth.uid() = reviewer_user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated USING (auth.uid() = reviewer_user_id);

-- disputes: users see own disputes, service_role for admin
CREATE POLICY "Users can view own disputes"
  ON public.disputes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disputes"
  ON public.disputes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disputes"
  ON public.disputes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- STEP 4: Split zivo_payment_methods Policy
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.zivo_payment_methods;

CREATE POLICY "Users can view own payment methods"
  ON public.zivo_payment_methods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON public.zivo_payment_methods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON public.zivo_payment_methods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
;
