-- =============================================
-- PHASE 2: Fix remaining security vulnerabilities
-- =============================================

-- 1. FIX: chat_messages - Sensitive communication exposed
DROP POLICY IF EXISTS "Drivers can view trip chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Drivers can send trip messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Customers can view order chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Customers can send order messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat participants can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat participants can send messages" ON public.chat_messages;

-- Create helper function to check if user is participant in chat
CREATE OR REPLACE FUNCTION public.is_chat_participant(p_trip_id uuid, p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trips t
    JOIN drivers d ON d.id = t.driver_id
    WHERE t.id = p_trip_id AND (t.rider_id = auth.uid() OR d.user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM food_orders fo
    JOIN drivers d ON d.id = fo.driver_id
    WHERE fo.id = p_order_id AND (fo.customer_id = auth.uid() OR d.user_id = auth.uid())
  )
$$;

-- Restrictive chat policies (sender_id is UUID)
CREATE POLICY "Chat participants can view messages"
ON public.chat_messages FOR SELECT
USING (public.is_chat_participant(trip_id, order_id));

CREATE POLICY "Chat participants can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (public.is_chat_participant(trip_id, order_id) AND sender_id = auth.uid());

-- 2. FIX: driver_earnings - Financial data exposed
DROP POLICY IF EXISTS "Drivers can view their earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers can view own earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers view own earnings only" ON public.driver_earnings;

CREATE POLICY "Drivers view own earnings only"
ON public.driver_earnings FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 3. FIX: driver_expenses - Financial data exposed  
DROP POLICY IF EXISTS "Drivers can view own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers can create expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers can update own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers can delete own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers view own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers create own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers update own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers delete own expenses" ON public.driver_expenses;

CREATE POLICY "Drivers view own expenses"
ON public.driver_expenses FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers create own expenses"
ON public.driver_expenses FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update own expenses"
ON public.driver_expenses FOR UPDATE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers delete own expenses"
ON public.driver_expenses FOR DELETE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 4. FIX: driver_documents - Sensitive documents exposed
DROP POLICY IF EXISTS "Drivers can view own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can upload documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can update own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can delete own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers view own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers upload own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers update own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers delete own documents" ON public.driver_documents;

CREATE POLICY "Drivers view own documents"
ON public.driver_documents FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers upload own documents"
ON public.driver_documents FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update own documents"
ON public.driver_documents FOR UPDATE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers delete own documents"
ON public.driver_documents FOR DELETE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 5. FIX: driver_notifications - Private notifications exposed
DROP POLICY IF EXISTS "Drivers can view own notifications" ON public.driver_notifications;
DROP POLICY IF EXISTS "Drivers can update own notifications" ON public.driver_notifications;
DROP POLICY IF EXISTS "Drivers view own notifications" ON public.driver_notifications;
DROP POLICY IF EXISTS "Drivers update own notifications" ON public.driver_notifications;

CREATE POLICY "Drivers view own notifications"
ON public.driver_notifications FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update own notifications"
ON public.driver_notifications FOR UPDATE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 6. FIX: driver_shifts - Schedule data exposed
DROP POLICY IF EXISTS "Drivers can view own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers can create shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers can update own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers can delete own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers view own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers create own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers update own shifts" ON public.driver_shifts;
DROP POLICY IF EXISTS "Drivers delete own shifts" ON public.driver_shifts;

CREATE POLICY "Drivers view own shifts"
ON public.driver_shifts FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers create own shifts"
ON public.driver_shifts FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update own shifts"
ON public.driver_shifts FOR UPDATE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers delete own shifts"
ON public.driver_shifts FOR DELETE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 7. FIX: withdrawals - Financial withdrawal data exposed
DROP POLICY IF EXISTS "Drivers can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Drivers can request withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Drivers view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Drivers request own withdrawals" ON public.withdrawals;

CREATE POLICY "Drivers view own withdrawals"
ON public.withdrawals FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers request own withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 8. FIX: driver_withdrawals - Duplicate withdrawal table exposed
DROP POLICY IF EXISTS "Drivers can view own withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers can request withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers view own driver_withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers request driver_withdrawals" ON public.driver_withdrawals;

CREATE POLICY "Drivers view own driver_withdrawals"
ON public.driver_withdrawals FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers request driver_withdrawals"
ON public.driver_withdrawals FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 9. FIX: security_events - Security audit logs exposed
DROP POLICY IF EXISTS "Users can view own security events" ON public.security_events;
DROP POLICY IF EXISTS "Users can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Users view own security events" ON public.security_events;
DROP POLICY IF EXISTS "Users insert own security events" ON public.security_events;

CREATE POLICY "Users view own security events"
ON public.security_events FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users insert own security events"
ON public.security_events FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 10. FIX: login_sessions - Session data exposed
DROP POLICY IF EXISTS "Users can view own sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "Users view own login sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "Users manage own login sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "Users create own login sessions" ON public.login_sessions;

CREATE POLICY "Users view own login sessions"
ON public.login_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage own login sessions"
ON public.login_sessions FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users create own login sessions"
ON public.login_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 11. FIX: driver_settings - Private settings exposed
DROP POLICY IF EXISTS "Drivers can view own settings" ON public.driver_settings;
DROP POLICY IF EXISTS "Drivers can update own settings" ON public.driver_settings;
DROP POLICY IF EXISTS "Drivers can insert own settings" ON public.driver_settings;
DROP POLICY IF EXISTS "Drivers view own settings" ON public.driver_settings;
DROP POLICY IF EXISTS "Drivers update own settings" ON public.driver_settings;
DROP POLICY IF EXISTS "Drivers insert own settings" ON public.driver_settings;

CREATE POLICY "Drivers view own settings"
ON public.driver_settings FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update own settings"
ON public.driver_settings FOR UPDATE
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers insert own settings"
ON public.driver_settings FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));;
