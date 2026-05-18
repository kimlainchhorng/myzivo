-- Fix the permissive WITH CHECK (true) policy on customer_feedback
DROP POLICY IF EXISTS "customer_feedback_public_insert" ON public.customer_feedback;
CREATE POLICY "customer_feedback_public_insert" ON public.customer_feedback FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.id IS NOT NULL));

-- Also secure PROFILES table (may have been dropped by earlier migration)
DROP POLICY IF EXISTS "profiles_owner_or_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_restricted" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_restricted" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_restricted" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_final_select" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_final_insert" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_final_update" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_final_delete" ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.profiles FROM anon, public;

-- Secure DRIVERS table
DROP POLICY IF EXISTS "drivers_owner_or_admin_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_owner_insert" ON public.drivers;
DROP POLICY IF EXISTS "drivers_owner_update" ON public.drivers;
DROP POLICY IF EXISTS "drivers_admin_delete" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_restricted" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_admin_only" ON public.drivers;

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drivers_final_select" ON public.drivers FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "drivers_final_insert" ON public.drivers FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
CREATE POLICY "drivers_final_update" ON public.drivers FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "drivers_final_delete" ON public.drivers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.drivers FROM anon, public;

-- Secure DRIVER_LOCATION_HISTORY
DROP POLICY IF EXISTS "location_history_select_restricted" ON public.driver_location_history;
DROP POLICY IF EXISTS "location_history_insert_own" ON public.driver_location_history;
DROP POLICY IF EXISTS "location_history_delete_admin" ON public.driver_location_history;

ALTER TABLE public.driver_location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "location_final_select" ON public.driver_location_history FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "location_final_insert" ON public.driver_location_history FOR INSERT TO authenticated
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));
CREATE POLICY "location_final_delete" ON public.driver_location_history FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.driver_location_history FROM anon, public;

-- CHAT_MESSAGES - Use the is_chat_participant function
DROP POLICY IF EXISTS "chat_messages_select_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants can send chat messages" ON public.chat_messages;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_final_select" ON public.chat_messages FOR SELECT TO authenticated
USING (public.is_chat_participant(trip_id, order_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "chat_messages_final_insert" ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_chat_participant(trip_id, order_id));

REVOKE ALL ON public.chat_messages FROM anon, public;;
