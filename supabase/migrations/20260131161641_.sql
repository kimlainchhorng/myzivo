-- =============================================
-- FINAL SECURITY CLEANUP - Consolidate and fix remaining
-- =============================================

-- Drop duplicate policies on audit_logs (keep only admin select)
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_del" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_update" ON public.audit_logs;

-- Drop duplicate policies on driver_earnings
DROP POLICY IF EXISTS "Admins can insert earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Admins can view all earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers can view their own earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers view own earnings only" ON public.driver_earnings;
DROP POLICY IF EXISTS "driver_earnings_own_only" ON public.driver_earnings;
DROP POLICY IF EXISTS "earnings_restricted" ON public.driver_earnings;
DROP POLICY IF EXISTS "driver_earnings_secure_select" ON public.driver_earnings;
DROP POLICY IF EXISTS "driver_earnings_secure_insert" ON public.driver_earnings;

CREATE POLICY "driver_earnings_owner_select" ON public.driver_earnings FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "driver_earnings_admin_insert" ON public.driver_earnings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop duplicate policies on driver_withdrawals
DROP POLICY IF EXISTS "Drivers can insert own withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers create own withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers request driver_withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers view own driver_withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers view own withdrawals only" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_own_only" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "withdrawals_restricted" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_secure_select" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_secure_insert" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_secure_update" ON public.driver_withdrawals;

CREATE POLICY "driver_withdrawals_owner_select" ON public.driver_withdrawals FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "driver_withdrawals_owner_insert" ON public.driver_withdrawals FOR INSERT TO authenticated
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));
CREATE POLICY "driver_withdrawals_owner_update" ON public.driver_withdrawals FOR UPDATE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Drop duplicate policies on security_events
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins view all security events" ON public.security_events;
DROP POLICY IF EXISTS "Authenticated users can log security events" ON public.security_events;
DROP POLICY IF EXISTS "Users insert own security events" ON public.security_events;
DROP POLICY IF EXISTS "Users view own security events" ON public.security_events;
DROP POLICY IF EXISTS "security_events_admin_only" ON public.security_events;
DROP POLICY IF EXISTS "security_events_restricted" ON public.security_events;
DROP POLICY IF EXISTS "security_events_secure_select" ON public.security_events;

CREATE POLICY "security_events_own_or_admin" ON public.security_events FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Drop duplicate policies on transactions
DROP POLICY IF EXISTS "Admins manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Participants can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_secure_select" ON public.transactions;

CREATE POLICY "transactions_participant_select" ON public.transactions FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
  OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Drop duplicate policies on trusted_contacts
DROP POLICY IF EXISTS "Drivers delete their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Drivers insert their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Drivers update their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Drivers view their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_driver_only" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_own_only" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_secure_select" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_secure_insert" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_secure_update" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_secure_delete" ON public.trusted_contacts;

CREATE POLICY "trusted_contacts_owner_select" ON public.trusted_contacts FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "trusted_contacts_owner_insert" ON public.trusted_contacts FOR INSERT TO authenticated
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));
CREATE POLICY "trusted_contacts_owner_update" ON public.trusted_contacts FOR UPDATE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "trusted_contacts_owner_delete" ON public.trusted_contacts FOR DELETE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Drop duplicate policies on vehicles
DROP POLICY IF EXISTS "Drivers can delete their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can insert their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers manage own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_owner_only" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_restricted" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_secure_select" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_secure_insert" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_secure_update" ON public.vehicles;

CREATE POLICY "vehicles_owner_select" ON public.vehicles FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vehicles_owner_insert" ON public.vehicles FOR INSERT TO authenticated
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));
CREATE POLICY "vehicles_owner_update" ON public.vehicles FOR UPDATE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vehicles_owner_delete" ON public.vehicles FOR DELETE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- ===================
-- Fix remaining tables with PII exposure
-- ===================

-- CAR_RENTALS
DROP POLICY IF EXISTS "car_rentals_participant_select" ON public.car_rentals;
DROP POLICY IF EXISTS "car_rentals_customer_insert" ON public.car_rentals;
DROP POLICY IF EXISTS "car_rentals_participant_update" ON public.car_rentals;
DROP POLICY IF EXISTS "Users can view their own rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "car_rentals_select_policy" ON public.car_rentals;

ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "car_rentals_owner_select" ON public.car_rentals FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR car_id IN (SELECT rc.id FROM rental_cars rc WHERE rc.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "car_rentals_owner_insert" ON public.car_rentals FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());
CREATE POLICY "car_rentals_owner_update" ON public.car_rentals FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR car_id IN (SELECT rc.id FROM rental_cars rc WHERE rc.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.car_rentals FROM anon, public;

-- HOTEL_BOOKINGS
DROP POLICY IF EXISTS "hotel_bookings_secure_select" ON public.hotel_bookings;
DROP POLICY IF EXISTS "hotel_bookings_secure_insert" ON public.hotel_bookings;
DROP POLICY IF EXISTS "hotel_bookings_secure_update" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Guests can view their bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "hotel_bookings_select_policy" ON public.hotel_bookings;

ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotel_bookings_owner_select" ON public.hotel_bookings FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR hotel_id IN (SELECT h.id FROM hotels h WHERE h.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "hotel_bookings_owner_insert" ON public.hotel_bookings FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());
CREATE POLICY "hotel_bookings_owner_update" ON public.hotel_bookings FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR hotel_id IN (SELECT h.id FROM hotels h WHERE h.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.hotel_bookings FROM anon, public;

-- FLIGHT_BOOKINGS
DROP POLICY IF EXISTS "flight_bookings_secure_select" ON public.flight_bookings;
DROP POLICY IF EXISTS "flight_bookings_secure_insert" ON public.flight_bookings;
DROP POLICY IF EXISTS "flight_bookings_secure_update" ON public.flight_bookings;
DROP POLICY IF EXISTS "flight_bookings_select_policy" ON public.flight_bookings;

ALTER TABLE public.flight_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flight_bookings_owner_select" ON public.flight_bookings FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "flight_bookings_owner_insert" ON public.flight_bookings FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());
CREATE POLICY "flight_bookings_owner_update" ON public.flight_bookings FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.flight_bookings FROM anon, public;

-- EMERGENCY_CONTACTS
DROP POLICY IF EXISTS "emergency_contacts_secure_select" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_secure_insert" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_secure_update" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_secure_delete" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Drivers can manage their emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_driver_only" ON public.emergency_contacts;

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_contacts_owner_select" ON public.emergency_contacts FOR SELECT TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emergency_contacts_owner_insert" ON public.emergency_contacts FOR INSERT TO authenticated
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));
CREATE POLICY "emergency_contacts_owner_update" ON public.emergency_contacts FOR UPDATE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emergency_contacts_owner_delete" ON public.emergency_contacts FOR DELETE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.emergency_contacts FROM anon, public;

-- Revoke anon/public from all sensitive tables
REVOKE ALL ON public.audit_logs FROM anon, public;
REVOKE ALL ON public.security_events FROM anon, public;
REVOKE ALL ON public.transactions FROM anon, public;
REVOKE ALL ON public.driver_earnings FROM anon, public;
REVOKE ALL ON public.driver_withdrawals FROM anon, public;
REVOKE ALL ON public.trusted_contacts FROM anon, public;
REVOKE ALL ON public.vehicles FROM anon, public;;
