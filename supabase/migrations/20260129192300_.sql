-- =============================================================
-- PHASE 7: COMPREHENSIVE PII PROTECTION - CORRECT COLUMNS
-- =============================================================

-- 1. DRIVERS - Owner only
DROP POLICY IF EXISTS "Drivers can view own record" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view their own data" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_own_record_only" ON public.drivers;

CREATE POLICY "drivers_owner_access" ON public.drivers
FOR SELECT USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- 2. PROFILES - Owner only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_only" ON public.profiles;

CREATE POLICY "profiles_strict_owner" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id 
  OR auth.uid() = id
);

-- 3. EMERGENCY_CONTACTS - Driver only
DROP POLICY IF EXISTS "Drivers can manage their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_driver_only" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_owner" ON public.emergency_contacts;

CREATE POLICY "emergency_contacts_strict" ON public.emergency_contacts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.id = emergency_contacts.driver_id 
    AND d.user_id = auth.uid()
  )
);

-- 4. STAFF_MEMBERS - Masked view + restricted access
DROP VIEW IF EXISTS public.staff_members_masked CASCADE;
CREATE OR REPLACE VIEW public.staff_members_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, full_name, role, status, hire_date, created_at
FROM public.staff_members;

DROP POLICY IF EXISTS "Staff can view own record" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners can manage staff" ON public.staff_members;
DROP POLICY IF EXISTS "staff_access_control" ON public.staff_members;

CREATE POLICY "staff_restricted" ON public.staff_members
FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 5. RESERVATIONS - Owner only
DROP POLICY IF EXISTS "Restaurant owners can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "reservations_protected" ON public.reservations;

CREATE POLICY "reservations_restricted" ON public.reservations
FOR SELECT USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 6. CUSTOMER_ORDERS - Masked view
DROP VIEW IF EXISTS public.customer_orders_masked CASCADE;
CREATE OR REPLACE VIEW public.customer_orders_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, table_id, table_number, customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone,
  CASE WHEN customer_email IS NOT NULL THEN LEFT(customer_email, 2) || '***@' || SPLIT_PART(customer_email, '@', 2) ELSE NULL END as customer_email,
  status, priority, total_amount, notes, created_at, updated_at
FROM public.customer_orders;

DROP POLICY IF EXISTS "Restaurant owners can view orders" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_protected" ON public.customer_orders;

CREATE POLICY "customer_orders_restricted" ON public.customer_orders
FOR SELECT USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 7. LOYALTY_MEMBERS - Owner only
DROP POLICY IF EXISTS "Restaurant owners can view loyalty members" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_members_protected" ON public.loyalty_members;

CREATE POLICY "loyalty_restricted" ON public.loyalty_members
FOR SELECT USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 8. WAITLIST - Owner only
DROP POLICY IF EXISTS "Restaurant owners can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_protected" ON public.waitlist;

CREATE POLICY "waitlist_restricted" ON public.waitlist
FOR SELECT USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 9. CUSTOMER_FEEDBACK - Masked
DROP VIEW IF EXISTS public.customer_feedback_masked CASCADE;
CREATE OR REPLACE VIEW public.customer_feedback_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, rating, food_rating, service_rating, ambiance_rating,
  comment, sentiment, is_public, response, created_at
FROM public.customer_feedback;

DROP POLICY IF EXISTS "Restaurant owners can view feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Public feedback is viewable" ON public.customer_feedback;
DROP POLICY IF EXISTS "customer_feedback_protected" ON public.customer_feedback;

CREATE POLICY "feedback_restricted" ON public.customer_feedback
FOR SELECT USING (
  is_public = true
  OR public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 10. TRIPS - Masked
DROP VIEW IF EXISTS public.trips_masked CASCADE;
CREATE OR REPLACE VIEW public.trips_masked 
WITH (security_invoker = on) AS
SELECT 
  id, driver_id, pickup_address, dropoff_address, pickup_lat, pickup_lng,
  dropoff_lat, dropoff_lng, fare_amount, distance_km, duration_minutes,
  status, payment_status, rating, started_at, completed_at, created_at,
  CASE WHEN customer_name IS NOT NULL THEN LEFT(customer_name, 1) || '***' ELSE NULL END as customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone
FROM public.trips;

DROP POLICY IF EXISTS "Drivers can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Riders can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "trips_driver_access" ON public.trips;
DROP POLICY IF EXISTS "trips_participant_only" ON public.trips;

CREATE POLICY "trips_restricted" ON public.trips
FOR SELECT USING (
  rider_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = trips.driver_id AND d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 11. HOTELS - Public view (no contact)
DROP VIEW IF EXISTS public.hotels_public CASCADE;
CREATE OR REPLACE VIEW public.hotels_public 
WITH (security_invoker = on) AS
SELECT 
  id, name, address, city, country, star_rating, amenities, logo_url, description, status, rating
FROM public.hotels;

DROP POLICY IF EXISTS "Hotel owners can view hotels" ON public.hotels;
DROP POLICY IF EXISTS "Hotels are publicly viewable" ON public.hotels;
DROP POLICY IF EXISTS "hotels_owner_access" ON public.hotels;

CREATE POLICY "hotels_restricted" ON public.hotels
FOR SELECT USING (
  public.is_hotel_owner(id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 12. HOTEL_BOOKINGS
DROP POLICY IF EXISTS "Hotel owners can view bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Guests can view own bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "hotel_bookings_protected" ON public.hotel_bookings;

CREATE POLICY "hotel_bookings_restricted" ON public.hotel_bookings
FOR SELECT USING (
  customer_id = auth.uid()
  OR public.is_hotel_owner(hotel_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 13. FLIGHT_BOOKINGS
DROP POLICY IF EXISTS "Customers can view own flight bookings" ON public.flight_bookings;
DROP POLICY IF EXISTS "flight_bookings_owner_only" ON public.flight_bookings;

CREATE POLICY "flight_bookings_restricted" ON public.flight_bookings
FOR SELECT USING (
  customer_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 14. CAR_RENTALS
DROP POLICY IF EXISTS "Car rental access" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers can view own rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "car_rentals_protected" ON public.car_rentals;

CREATE POLICY "car_rentals_restricted" ON public.car_rentals
FOR SELECT USING (
  customer_id = auth.uid()
  OR public.is_rental_car_owner(car_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 15. RESTAURANTS - Public view (no contact)
DROP VIEW IF EXISTS public.restaurants_public CASCADE;
CREATE OR REPLACE VIEW public.restaurants_public 
WITH (security_invoker = on) AS
SELECT 
  id, name, address, cuisine_type, description, rating, is_open, logo_url, cover_image_url, opening_hours, status
FROM public.restaurants;

DROP POLICY IF EXISTS "Restaurants are publicly viewable" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can view own" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_owner_access" ON public.restaurants;

CREATE POLICY "restaurants_restricted" ON public.restaurants
FOR SELECT USING (
  owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 16. RENTAL_CARS - Public view (no license/VIN)
DROP VIEW IF EXISTS public.rental_cars_public CASCADE;
CREATE OR REPLACE VIEW public.rental_cars_public 
WITH (security_invoker = on) AS
SELECT 
  id, make, model, year, category, daily_rate, images, features, is_available, location_address, rating
FROM public.rental_cars;

DROP POLICY IF EXISTS "Rental cars are publicly viewable" ON public.rental_cars;
DROP POLICY IF EXISTS "rental_cars_owner_access" ON public.rental_cars;

CREATE POLICY "rental_cars_restricted" ON public.rental_cars
FOR SELECT USING (
  owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 17. FOOD_ORDERS - Masked
DROP VIEW IF EXISTS public.food_orders_masked CASCADE;
CREATE OR REPLACE VIEW public.food_orders_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, driver_id, customer_id, status, total_amount, delivery_fee,
  CASE WHEN delivery_address IS NOT NULL THEN SPLIT_PART(delivery_address, ',', 1) || ', ***' ELSE NULL END as delivery_address,
  estimated_delivery_time, delivered_at, created_at, updated_at
FROM public.food_orders;

DROP POLICY IF EXISTS "Food orders access" ON public.food_orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners can view orders" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_participant_only" ON public.food_orders;

CREATE POLICY "food_orders_restricted" ON public.food_orders
FOR SELECT USING (
  customer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = food_orders.driver_id AND d.user_id = auth.uid())
  OR public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 18. VEHICLES - Safe view (no license/VIN)
DROP VIEW IF EXISTS public.vehicles_safe CASCADE;
CREATE OR REPLACE VIEW public.vehicles_safe 
WITH (security_invoker = on) AS
SELECT 
  id, driver_id, make, model, year, color, fuel_type, is_primary, health_score, created_at
FROM public.vehicles;

DROP POLICY IF EXISTS "Drivers can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_owner_access" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_owner_only" ON public.vehicles;

CREATE POLICY "vehicles_restricted" ON public.vehicles
FOR SELECT USING (
  public.is_vehicle_owner(id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 19. DRIVER_LOCATION_HISTORY
DROP POLICY IF EXISTS "Drivers can view own location history" ON public.driver_location_history;
DROP POLICY IF EXISTS "location_history_owner_only" ON public.driver_location_history;

CREATE POLICY "location_history_restricted" ON public.driver_location_history
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_location_history.driver_id AND d.user_id = auth.uid())
);

-- 20. LOGIN_SESSIONS
DROP POLICY IF EXISTS "Users can view own sessions" ON public.login_sessions;
DROP POLICY IF EXISTS "login_sessions_owner_only" ON public.login_sessions;

CREATE POLICY "login_sessions_restricted" ON public.login_sessions
FOR SELECT USING (user_id = auth.uid());

-- 21. SECURITY_EVENTS
DROP POLICY IF EXISTS "Users can view own security events" ON public.security_events;
DROP POLICY IF EXISTS "security_events_user_access" ON public.security_events;
DROP POLICY IF EXISTS "security_events_protected" ON public.security_events;

CREATE POLICY "security_events_restricted" ON public.security_events
FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 22. DRIVER_EARNINGS
DROP POLICY IF EXISTS "Drivers can view own earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "earnings_owner_only" ON public.driver_earnings;

CREATE POLICY "earnings_restricted" ON public.driver_earnings
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_earnings.driver_id AND d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 23. TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_user_access" ON public.transactions;
DROP POLICY IF EXISTS "transactions_owner_only" ON public.transactions;

CREATE POLICY "transactions_restricted" ON public.transactions
FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = transactions.driver_id AND d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 24. DRIVER_WITHDRAWALS
DROP POLICY IF EXISTS "Drivers can view own withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "withdrawals_driver_access" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "withdrawals_owner_only" ON public.driver_withdrawals;

CREATE POLICY "withdrawals_restricted" ON public.driver_withdrawals
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_withdrawals.driver_id AND d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 25. SUPPORT_TICKETS
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_owner_only" ON public.support_tickets;

CREATE POLICY "support_tickets_restricted" ON public.support_tickets
FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- Grant access to safe views
GRANT SELECT ON public.staff_members_masked TO authenticated;
GRANT SELECT ON public.customer_orders_masked TO authenticated;
GRANT SELECT ON public.customer_feedback_masked TO authenticated;
GRANT SELECT ON public.trips_masked TO authenticated;
GRANT SELECT ON public.hotels_public TO authenticated;
GRANT SELECT ON public.restaurants_public TO authenticated;
GRANT SELECT ON public.rental_cars_public TO authenticated;
GRANT SELECT ON public.food_orders_masked TO authenticated;
GRANT SELECT ON public.vehicles_safe TO authenticated;;
