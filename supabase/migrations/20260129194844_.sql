-- ============================================================
-- PHASE 9: COMPLETE SECURITY LOCKDOWN - FIX ALL VULNERABILITIES
-- ============================================================

-- 1. DRIVERS TABLE
DROP POLICY IF EXISTS "drivers_select_all" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Anyone can view drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_public_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_own_only" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;

CREATE POLICY "drivers_own_only" ON public.drivers
FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "drivers_update_own" ON public.drivers
FOR UPDATE USING (user_id = auth.uid());

-- 2. PROFILES TABLE
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_only" ON public.profiles;

CREATE POLICY "profiles_own_only" ON public.profiles
FOR SELECT USING (user_id = auth.uid() OR id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 3. EMERGENCY_CONTACTS TABLE
DROP POLICY IF EXISTS "emergency_contacts_select_all" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Anyone can view emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_own_only" ON public.emergency_contacts;

CREATE POLICY "emergency_contacts_own_only" ON public.emergency_contacts
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. CAR_RENTALS TABLE
DROP POLICY IF EXISTS "car_rentals_select_all" ON public.car_rentals;
DROP POLICY IF EXISTS "Anyone can view car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "car_rentals_participant_only" ON public.car_rentals;

CREATE POLICY "car_rentals_participant_only" ON public.car_rentals
FOR SELECT USING (
  customer_id = auth.uid()
  OR car_id IN (SELECT id FROM public.rental_cars WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 5. TRIPS TABLE
DROP POLICY IF EXISTS "trips_select_all" ON public.trips;
DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can view assigned trips" ON public.trips;
DROP POLICY IF EXISTS "trips_participant_only" ON public.trips;

CREATE POLICY "trips_participant_only" ON public.trips
FOR SELECT USING (
  rider_id = auth.uid()
  OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 6. HOTEL_BOOKINGS TABLE
DROP POLICY IF EXISTS "hotel_bookings_select_all" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Anyone can view hotel bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "hotel_bookings_participant_only" ON public.hotel_bookings;

CREATE POLICY "hotel_bookings_participant_only" ON public.hotel_bookings
FOR SELECT USING (
  customer_id = auth.uid()
  OR hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 7. CUSTOMER_FEEDBACK TABLE
DROP POLICY IF EXISTS "customer_feedback_select_all" ON public.customer_feedback;
DROP POLICY IF EXISTS "Anyone can view customer feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "customer_feedback_owner_only" ON public.customer_feedback;

CREATE POLICY "customer_feedback_owner_only" ON public.customer_feedback
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 8. RESERVATIONS TABLE
DROP POLICY IF EXISTS "reservations_select_all" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "reservations_owner_only" ON public.reservations;

CREATE POLICY "reservations_owner_only" ON public.reservations
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 9. CUSTOMER_ORDERS TABLE
DROP POLICY IF EXISTS "customer_orders_select_all" ON public.customer_orders;
DROP POLICY IF EXISTS "Anyone can view customer orders" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_owner_only" ON public.customer_orders;

CREATE POLICY "customer_orders_owner_only" ON public.customer_orders
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 10. STAFF_MEMBERS TABLE (has user_id)
DROP POLICY IF EXISTS "staff_members_select_all" ON public.staff_members;
DROP POLICY IF EXISTS "Anyone can view staff members" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_restricted" ON public.staff_members;

CREATE POLICY "staff_members_restricted" ON public.staff_members
FOR SELECT USING (
  user_id = auth.uid()
  OR restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 11. LOYALTY_MEMBERS TABLE (no user_id - restaurant owner only)
DROP POLICY IF EXISTS "loyalty_members_select_all" ON public.loyalty_members;
DROP POLICY IF EXISTS "Anyone can view loyalty members" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_members_owner_only" ON public.loyalty_members;

CREATE POLICY "loyalty_members_owner_only" ON public.loyalty_members
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 12. WAITLIST TABLE (restaurant owner only)
DROP POLICY IF EXISTS "waitlist_select_all" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_owner_only" ON public.waitlist;

CREATE POLICY "waitlist_owner_only" ON public.waitlist
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 13. VEHICLES TABLE
DROP POLICY IF EXISTS "vehicles_select_all" ON public.vehicles;
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_owner_only" ON public.vehicles;

CREATE POLICY "vehicles_owner_only" ON public.vehicles
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 14. TRUSTED_CONTACTS TABLE (uses driver_id, not user_id)
DROP POLICY IF EXISTS "trusted_contacts_select_all" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Anyone can view trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_own_only" ON public.trusted_contacts;

CREATE POLICY "trusted_contacts_own_only" ON public.trusted_contacts
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 15. GIFT_CARDS TABLE
DROP POLICY IF EXISTS "gift_cards_select_all" ON public.gift_cards;
DROP POLICY IF EXISTS "Anyone can view gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_owner_only" ON public.gift_cards;

CREATE POLICY "gift_cards_owner_only" ON public.gift_cards
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 16. DRIVER_EARNINGS TABLE
DROP POLICY IF EXISTS "driver_earnings_select_all" ON public.driver_earnings;
DROP POLICY IF EXISTS "Anyone can view driver earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "driver_earnings_own_only" ON public.driver_earnings;

CREATE POLICY "driver_earnings_own_only" ON public.driver_earnings
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 17. DRIVER_WITHDRAWALS TABLE
DROP POLICY IF EXISTS "driver_withdrawals_select_all" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Anyone can view driver withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_own_only" ON public.driver_withdrawals;

CREATE POLICY "driver_withdrawals_own_only" ON public.driver_withdrawals
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 18. TRANSACTIONS TABLE (has user_id)
DROP POLICY IF EXISTS "transactions_select_all" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_participant_only" ON public.transactions;

CREATE POLICY "transactions_participant_only" ON public.transactions
FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 19. LOGIN_SESSIONS TABLE
DROP POLICY IF EXISTS "login_sessions_select_all" ON public.login_sessions;
DROP POLICY IF EXISTS "Anyone can view login sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "login_sessions_own_only" ON public.login_sessions;

CREATE POLICY "login_sessions_own_only" ON public.login_sessions
FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 20. SECURITY_EVENTS TABLE
DROP POLICY IF EXISTS "security_events_select_all" ON public.security_events;
DROP POLICY IF EXISTS "Anyone can view security events" ON public.security_events;
DROP POLICY IF EXISTS "security_events_user_view" ON public.security_events;
DROP POLICY IF EXISTS "security_events_admin_only" ON public.security_events;

CREATE POLICY "security_events_admin_only" ON public.security_events
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 21. DRIVER_LOCATION_HISTORY TABLE
DROP POLICY IF EXISTS "driver_location_history_select_all" ON public.driver_location_history;
DROP POLICY IF EXISTS "Anyone can view driver location history" ON public.driver_location_history;
DROP POLICY IF EXISTS "driver_location_history_own_only" ON public.driver_location_history;

CREATE POLICY "driver_location_history_own_only" ON public.driver_location_history
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 22. SOS_ALERTS TABLE
DROP POLICY IF EXISTS "sos_alerts_select_all" ON public.sos_alerts;
DROP POLICY IF EXISTS "Anyone can view sos alerts" ON public.sos_alerts;
DROP POLICY IF EXISTS "sos_alerts_restricted" ON public.sos_alerts;

CREATE POLICY "sos_alerts_restricted" ON public.sos_alerts
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 23. FOOD_ORDERS TABLE
DROP POLICY IF EXISTS "food_orders_select_all" ON public.food_orders;
DROP POLICY IF EXISTS "Anyone can view food orders" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_available" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_participant_only" ON public.food_orders;

CREATE POLICY "food_orders_participant_only" ON public.food_orders
FOR SELECT USING (
  customer_id = auth.uid()
  OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 24. CHAT_MESSAGES TABLE
DROP POLICY IF EXISTS "chat_messages_select_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_participant_only" ON public.chat_messages;

CREATE POLICY "chat_messages_participant_only" ON public.chat_messages
FOR SELECT USING (
  sender_id = auth.uid()
  OR public.is_chat_participant(trip_id, order_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 25. AUDIT_LOGS TABLE
DROP POLICY IF EXISTS "audit_logs_insert_all" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_all" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;

CREATE POLICY "audit_logs_admin_insert" ON public.audit_logs
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 26. DRIVER_DOCUMENTS TABLE
DROP POLICY IF EXISTS "driver_documents_select_all" ON public.driver_documents;
DROP POLICY IF EXISTS "driver_documents_insert_all" ON public.driver_documents;
DROP POLICY IF EXISTS "driver_documents_policy" ON public.driver_documents;
DROP POLICY IF EXISTS "driver_documents_own_select" ON public.driver_documents;
DROP POLICY IF EXISTS "driver_documents_own_insert" ON public.driver_documents;
DROP POLICY IF EXISTS "driver_documents_admin_update" ON public.driver_documents;

CREATE POLICY "driver_documents_own_select" ON public.driver_documents
FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "driver_documents_own_insert" ON public.driver_documents
FOR INSERT WITH CHECK (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

CREATE POLICY "driver_documents_admin_update" ON public.driver_documents
FOR UPDATE USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 27. SYSTEM_SETTINGS TABLE
DROP POLICY IF EXISTS "system_settings_select_all" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_public_read" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_admin_write" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_admin_insert" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_admin_delete" ON public.system_settings;

CREATE POLICY "system_settings_public_read" ON public.system_settings
FOR SELECT USING (is_public = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "system_settings_admin_write" ON public.system_settings
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "system_settings_admin_insert" ON public.system_settings
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "system_settings_admin_delete" ON public.system_settings
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;;
