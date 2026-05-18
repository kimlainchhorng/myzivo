-- Phase 4: Critical Data Protection
-- Focus on the most critical security hardening policies

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_hotel_owner(_hotel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM hotels h WHERE h.id = _hotel_id AND h.owner_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_rental_car_owner(_car_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM rental_cars rc WHERE rc.id = _car_id AND rc.owner_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_driver_details(_driver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM drivers d WHERE d.id = _driver_id AND d.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
$$;

-- =============================================================================
-- 1. PROFILES - User-only access
-- =============================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile only"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile only"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- =============================================================================
-- 2. DRIVERS - Safe public view (no license/contact info)
-- =============================================================================

CREATE OR REPLACE VIEW public.drivers_public
WITH (security_invoker = on) AS
SELECT 
  id, full_name, avatar_url, vehicle_type, vehicle_model,
  rating, total_trips, is_online, status, created_at
FROM public.drivers;

DROP POLICY IF EXISTS "Customers can view their order driver" ON public.drivers;

-- =============================================================================
-- 3. CAR RENTALS - Strict access
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners can view their car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers view own rentals only" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners view their vehicle rentals" ON public.car_rentals;

CREATE POLICY "Customers view own rentals only"
ON public.car_rentals FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Car owners view their vehicle rentals"
ON public.car_rentals FOR SELECT
USING (public.is_rental_car_owner(car_id));

-- =============================================================================
-- 4. HOTEL BOOKINGS - Strict access
-- =============================================================================

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Hotel owners can view bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Customers view own hotel bookings only" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Hotel owners view property bookings" ON public.hotel_bookings;

CREATE POLICY "Customers view own hotel bookings only"
ON public.hotel_bookings FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Hotel owners view property bookings"
ON public.hotel_bookings FOR SELECT
USING (public.is_hotel_owner(hotel_id));

-- =============================================================================
-- 5. FLIGHT BOOKINGS - Customer + admin only
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON public.flight_bookings;
DROP POLICY IF EXISTS "Customers view own flight bookings only" ON public.flight_bookings;
DROP POLICY IF EXISTS "Admins view all flight bookings" ON public.flight_bookings;

CREATE POLICY "Customers view own flight bookings only"
ON public.flight_bookings FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Admins view all flight bookings"
ON public.flight_bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- 6. TRIPS - Rider + driver only
-- =============================================================================

DROP POLICY IF EXISTS "Riders can view their trips" ON public.trips;
DROP POLICY IF EXISTS "Assigned drivers can view trips" ON public.trips;
DROP POLICY IF EXISTS "Riders view own trips only" ON public.trips;
DROP POLICY IF EXISTS "Drivers view assigned trips only" ON public.trips;

CREATE POLICY "Riders view own trips only"
ON public.trips FOR SELECT
USING (rider_id = auth.uid());

CREATE POLICY "Drivers view assigned trips only"
ON public.trips FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 7. FOOD ORDERS - Customer + driver + restaurant only
-- =============================================================================

DROP POLICY IF EXISTS "Customers view own orders" ON public.food_orders;
DROP POLICY IF EXISTS "Assigned drivers view orders" ON public.food_orders;
DROP POLICY IF EXISTS "Customers view own food orders only" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers view assigned food orders only" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners view their orders" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners view their food orders" ON public.food_orders;

CREATE POLICY "Customers view own food orders only"
ON public.food_orders FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Drivers view assigned food orders only"
ON public.food_orders FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Restaurant owners view their food orders"
ON public.food_orders FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

-- =============================================================================
-- 8. CUSTOMER ORDERS - Restaurant owners only
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners can manage orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners view their orders only" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners manage their orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners view their customer orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners manage customer orders" ON public.customer_orders;

CREATE POLICY "Restaurant owners view customer orders"
ON public.customer_orders FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Restaurant owners manage customer orders"
ON public.customer_orders FOR ALL
USING (public.is_restaurant_owner(restaurant_id));

-- =============================================================================
-- 9. RESERVATIONS - Restaurant owners + public insert
-- =============================================================================

DROP POLICY IF EXISTS "Restaurant owners manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Restaurant owners view reservations only" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
DROP POLICY IF EXISTS "Restaurant owners view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Restaurant owners delete reservations" ON public.reservations;

CREATE POLICY "Restaurant owners view reservations"
ON public.reservations FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Restaurant owners manage reservations"
ON public.reservations FOR UPDATE
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Restaurant owners delete reservations"
ON public.reservations FOR DELETE
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Anyone can create reservation"
ON public.reservations FOR INSERT
WITH CHECK (true);

-- =============================================================================
-- 10. LOYALTY MEMBERS - Restaurant owners only
-- =============================================================================

DROP POLICY IF EXISTS "Restaurant owners manage loyalty members" ON public.loyalty_members;
DROP POLICY IF EXISTS "Restaurant owners view their loyalty members only" ON public.loyalty_members;
DROP POLICY IF EXISTS "Restaurant owners view loyalty members" ON public.loyalty_members;

CREATE POLICY "Restaurant owners view loyalty members"
ON public.loyalty_members FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Restaurant owners manage loyalty members"
ON public.loyalty_members FOR ALL
USING (public.is_restaurant_owner(restaurant_id));

-- =============================================================================
-- 11. DRIVER EARNINGS - Driver only
-- =============================================================================

DROP POLICY IF EXISTS "Drivers view own earnings" ON public.driver_earnings;
DROP POLICY IF EXISTS "Drivers view own earnings only" ON public.driver_earnings;

CREATE POLICY "Drivers view own earnings only"
ON public.driver_earnings FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 12. DRIVER WITHDRAWALS - Driver only
-- =============================================================================

DROP POLICY IF EXISTS "Drivers view own withdrawals" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers view own withdrawals only" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "Drivers create own withdrawals" ON public.driver_withdrawals;

CREATE POLICY "Drivers view own withdrawals only"
ON public.driver_withdrawals FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers create own withdrawals"
ON public.driver_withdrawals FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 13. EMERGENCY CONTACTS - Driver only
-- =============================================================================

DROP POLICY IF EXISTS "Drivers manage own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Drivers view own emergency contacts only" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Drivers manage own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Drivers view own emergency contacts" ON public.emergency_contacts;

CREATE POLICY "Drivers view own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers manage own emergency contacts"
ON public.emergency_contacts FOR ALL
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 14. STAFF MEMBERS - Staff + restaurant owners
-- =============================================================================

DROP POLICY IF EXISTS "Staff can view own record" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners manage staff" ON public.staff_members;
DROP POLICY IF EXISTS "Staff view own record only" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners view their staff only" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners manage their staff" ON public.staff_members;
DROP POLICY IF EXISTS "Staff view own record" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners view staff" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners manage staff" ON public.staff_members;

CREATE POLICY "Staff view own record"
ON public.staff_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Restaurant owners view staff"
ON public.staff_members FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Restaurant owners manage staff"
ON public.staff_members FOR ALL
USING (public.is_restaurant_owner(restaurant_id));

-- =============================================================================
-- 15. VEHICLES - Driver only, create safe view without VIN
-- =============================================================================

CREATE OR REPLACE VIEW public.vehicles_public
WITH (security_invoker = on) AS
SELECT 
  id, driver_id, make, model, year, color, license_plate,
  mileage, fuel_type, is_primary, health_score, approval_status, 
  created_at, updated_at
FROM public.vehicles;

DROP POLICY IF EXISTS "Drivers manage own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers view own vehicles only" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers view own vehicles" ON public.vehicles;

CREATE POLICY "Drivers view own vehicles"
ON public.vehicles FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers manage own vehicles"
ON public.vehicles FOR ALL
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 16. DRIVER EXPENSES - Driver only
-- =============================================================================

DROP POLICY IF EXISTS "Drivers manage own expenses" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers view own expenses only" ON public.driver_expenses;
DROP POLICY IF EXISTS "Drivers view own expenses" ON public.driver_expenses;

CREATE POLICY "Drivers view own expenses"
ON public.driver_expenses FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers manage own expenses"
ON public.driver_expenses FOR ALL
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================================================
-- 17. SAVED LOCATIONS - User only
-- =============================================================================

DROP POLICY IF EXISTS "Users manage own locations" ON public.saved_locations;
DROP POLICY IF EXISTS "Users view own saved locations only" ON public.saved_locations;
DROP POLICY IF EXISTS "Users manage own saved locations" ON public.saved_locations;
DROP POLICY IF EXISTS "Users view own saved locations" ON public.saved_locations;

CREATE POLICY "Users view own saved locations"
ON public.saved_locations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage own saved locations"
ON public.saved_locations FOR ALL
USING (user_id = auth.uid());

-- =============================================================================
-- 18. CUSTOMER FEEDBACK - Safe public view (no email)
-- =============================================================================

CREATE OR REPLACE VIEW public.customer_feedback_public
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, rating, food_rating, service_rating,
  ambiance_rating, comment, response, responded_at, sentiment, created_at
FROM public.customer_feedback
WHERE is_public = true;

DROP POLICY IF EXISTS "Public can view public feedback only" ON public.customer_feedback;
DROP POLICY IF EXISTS "Restaurant owners view their feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Restaurant owners view feedback" ON public.customer_feedback;

CREATE POLICY "Restaurant owners view feedback"
ON public.customer_feedback FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

-- =============================================================================
-- 19. AUDIT LOGS - Admin only SELECT
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Anyone can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- 20. SUPPORT TICKETS - User + admin access
-- =============================================================================

DROP POLICY IF EXISTS "Users manage own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users view own support tickets only" ON public.support_tickets;
DROP POLICY IF EXISTS "Users manage own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users view own support tickets" ON public.support_tickets;

CREATE POLICY "Users view own support tickets"
ON public.support_tickets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage own support tickets"
ON public.support_tickets FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins view all support tickets"
ON public.support_tickets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));;
