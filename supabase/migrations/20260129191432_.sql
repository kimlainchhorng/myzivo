-- =============================================
-- PHASE 5: COMPREHENSIVE PII PROTECTION & DATA MASKING
-- =============================================

-- 1. FIX: Profiles table - strict own-profile-only access
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile only" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. FIX: Emergency contacts - direct ownership check
DROP POLICY IF EXISTS "Drivers can view own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Drivers can manage own emergency contacts" ON public.emergency_contacts;

CREATE POLICY "Drivers can view own emergency contacts" ON public.emergency_contacts
FOR SELECT USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert emergency contacts" ON public.emergency_contacts
FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own emergency contacts" ON public.emergency_contacts
FOR UPDATE USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete own emergency contacts" ON public.emergency_contacts
FOR DELETE USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 3. MASKED VIEWS for PII protection

-- 3a. Customer orders
CREATE OR REPLACE VIEW public.customer_orders_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id, table_id, table_number, customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone_masked,
  CASE WHEN customer_email IS NOT NULL THEN LEFT(customer_email, 2) || '***@' || SPLIT_PART(customer_email, '@', 2) ELSE NULL END as customer_email_masked,
  status, total_amount, notes, priority, assigned_chef, estimated_prep_minutes, prep_started_at, created_at, updated_at
FROM public.customer_orders;

-- 3b. Reservations (correct columns)
CREATE OR REPLACE VIEW public.reservations_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id, table_id, customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone_masked,
  CASE WHEN customer_email IS NOT NULL THEN LEFT(customer_email, 2) || '***@' || SPLIT_PART(customer_email, '@', 2) ELSE NULL END as customer_email_masked,
  party_size, reservation_date, reservation_time, duration_minutes, status, special_requests, reminder_sent, source, created_at, updated_at
FROM public.reservations;

-- 3c. Loyalty members (hide birthday, mask name/phone)
CREATE OR REPLACE VIEW public.loyalty_members_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id,
  CASE WHEN customer_name IS NOT NULL THEN LEFT(customer_name, 1) || '***' ELSE NULL END as name_masked,
  CASE WHEN phone IS NOT NULL THEN '***-***-' || RIGHT(phone, 4) ELSE NULL END as phone_masked,
  NULL::date as birthday, points_balance, lifetime_points, tier, join_date, last_visit, preferences, created_at, updated_at
FROM public.loyalty_members;

-- 3d. Hotel bookings (correct columns)
CREATE OR REPLACE VIEW public.hotel_bookings_masked WITH (security_invoker = on) AS
SELECT id, hotel_id, room_id, guest_name, customer_id, booking_reference,
  CASE WHEN guest_email IS NOT NULL THEN LEFT(guest_email, 2) || '***@' || SPLIT_PART(guest_email, '@', 2) ELSE NULL END as guest_email_masked,
  CASE WHEN guest_phone IS NOT NULL THEN '***-***-' || RIGHT(guest_phone, 4) ELSE NULL END as guest_phone_masked,
  check_in_date, check_out_date, nights, guests, room_count, price_per_night, subtotal, taxes_fees, total_amount, status, payment_status, special_requests, rating, created_at, updated_at
FROM public.hotel_bookings;

-- 3e. Trips (correct columns: fare_amount not fare, rider_id exists)
CREATE OR REPLACE VIEW public.trips_masked WITH (security_invoker = on) AS
SELECT id, rider_id, driver_id, customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone_masked,
  pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, customer_lat, customer_lng,
  fare_amount, distance_km, duration_minutes, status, payment_status, rating, started_at, completed_at, created_at
FROM public.trips;

-- 3f. Food orders (correct columns: no customer_phone/customer_email directly, uses customer_id)
CREATE OR REPLACE VIEW public.food_orders_masked WITH (security_invoker = on) AS
SELECT id, customer_id, restaurant_id, driver_id, items, subtotal, delivery_fee, tax, total_amount,
  delivery_address, delivery_lat, delivery_lng, special_instructions, status, 
  estimated_prep_time, estimated_delivery_time, placed_at, prepared_at, picked_up_at, delivered_at, rating, created_at, updated_at
FROM public.food_orders;

-- 3g. Staff members (hide emergency contact completely)
CREATE OR REPLACE VIEW public.staff_members_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id, user_id, full_name,
  CASE WHEN email IS NOT NULL THEN LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2) ELSE NULL END as email_masked,
  CASE WHEN phone IS NOT NULL THEN '***-***-' || RIGHT(phone, 4) ELSE NULL END as phone_masked,
  role, hire_date, hourly_rate, status, permissions,
  NULL::text as emergency_contact, NULL::text as emergency_phone,
  created_at, updated_at
FROM public.staff_members;

-- 3h. Waitlist (correct columns: customer_phone, check_in_time, seated_time)
CREATE OR REPLACE VIEW public.waitlist_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id, customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone_masked,
  party_size, quoted_wait_minutes, status, notes, check_in_time, seated_time, created_at
FROM public.waitlist;

-- 3i. Customer feedback
CREATE OR REPLACE VIEW public.customer_feedback_masked WITH (security_invoker = on) AS
SELECT id, restaurant_id, order_id, customer_name,
  CASE WHEN customer_email IS NOT NULL THEN LEFT(customer_email, 2) || '***@' || SPLIT_PART(customer_email, '@', 2) ELSE NULL END as customer_email_masked,
  rating, food_rating, service_rating, ambiance_rating, comment, sentiment, response, responded_at, is_public, created_at, updated_at
FROM public.customer_feedback;

-- 3j. Car rentals (mask driver license)
CREATE OR REPLACE VIEW public.car_rentals_masked WITH (security_invoker = on) AS
SELECT id, car_id, customer_id,
  CASE WHEN driver_license_number IS NOT NULL THEN '****-' || RIGHT(driver_license_number, 4) ELSE NULL END as driver_license_masked,
  pickup_date, return_date, actual_return_date, pickup_location, return_location, daily_rate, total_days, subtotal, insurance_fee, additional_fees, total_amount, deposit_paid, status, rating, notes, created_at, updated_at
FROM public.car_rentals;

-- 3k. Vehicles (hide VIN, mask plate)
CREATE OR REPLACE VIEW public.vehicles_safe WITH (security_invoker = on) AS
SELECT id, driver_id, make, model, year, color, fuel_type, mileage,
  CASE WHEN license_plate IS NOT NULL THEN '***' || RIGHT(license_plate, 3) ELSE NULL END as license_plate_masked,
  NULL::text as vin, is_primary, health_score, next_service_miles, last_oil_change, last_tire_rotation, approval_status, created_at, updated_at
FROM public.vehicles;

-- 4. Data retention cleanup functions
CREATE OR REPLACE FUNCTION public.cleanup_old_location_history() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM driver_location_history WHERE recorded_at < NOW() - INTERVAL '30 days';
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_login_sessions() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM login_sessions WHERE created_at < NOW() - INTERVAL '90 days' AND is_active = false;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_security_events() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '180 days';
$$;

-- 5. Grant access to masked views
GRANT SELECT ON public.customer_orders_masked TO authenticated;
GRANT SELECT ON public.reservations_masked TO authenticated;
GRANT SELECT ON public.loyalty_members_masked TO authenticated;
GRANT SELECT ON public.hotel_bookings_masked TO authenticated;
GRANT SELECT ON public.trips_masked TO authenticated;
GRANT SELECT ON public.food_orders_masked TO authenticated;
GRANT SELECT ON public.staff_members_masked TO authenticated;
GRANT SELECT ON public.waitlist_masked TO authenticated;
GRANT SELECT ON public.customer_feedback_masked TO authenticated;
GRANT SELECT ON public.car_rentals_masked TO authenticated;
GRANT SELECT ON public.vehicles_safe TO authenticated;;
