-- =============================================================
-- PHASE 8: ADDITIONAL SECURITY HARDENING - CORRECT COLUMNS
-- =============================================================

-- 1. TRUSTED_CONTACTS - Driver only (uses driver_id not user_id)
DROP POLICY IF EXISTS "Drivers can manage trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_strict" ON public.trusted_contacts;

CREATE POLICY "trusted_contacts_driver_only" ON public.trusted_contacts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.id = trusted_contacts.driver_id 
    AND d.user_id = auth.uid()
  )
);

-- 2. GIFT_CARDS - Restaurant owner only
DROP POLICY IF EXISTS "Restaurant owners can manage gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_restricted" ON public.gift_cards;

CREATE POLICY "gift_cards_owner" ON public.gift_cards
FOR SELECT USING (
  public.is_restaurant_owner(restaurant_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. AUDIT_LOGS - Admin only
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_view" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_immutable" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_delete" ON public.audit_logs;

CREATE POLICY "audit_logs_admin" ON public.audit_logs
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_logs_no_update" ON public.audit_logs
FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_del" ON public.audit_logs
FOR DELETE USING (false);

-- 4. RESERVATIONS masked view with correct columns
DROP VIEW IF EXISTS public.reservations_masked CASCADE;
CREATE OR REPLACE VIEW public.reservations_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, table_id, party_size, reservation_date, reservation_time,
  duration_minutes, status, special_requests, reminder_sent, source, created_at, updated_at,
  CASE WHEN customer_name IS NOT NULL THEN LEFT(customer_name, 1) || '***' ELSE NULL END as customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone,
  CASE WHEN customer_email IS NOT NULL THEN LEFT(customer_email, 2) || '***' ELSE NULL END as customer_email
FROM public.reservations;

-- 5. WAITLIST masked view with correct columns
DROP VIEW IF EXISTS public.waitlist_masked CASCADE;
CREATE OR REPLACE VIEW public.waitlist_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, party_size, quoted_wait_minutes, check_in_time, seated_time,
  status, notes, created_at,
  CASE WHEN customer_name IS NOT NULL THEN LEFT(customer_name, 1) || '***' ELSE NULL END as customer_name,
  CASE WHEN customer_phone IS NOT NULL THEN '***-***-' || RIGHT(customer_phone, 4) ELSE NULL END as customer_phone
FROM public.waitlist;

-- 6. LOYALTY_MEMBERS masked view with correct columns
DROP VIEW IF EXISTS public.loyalty_members_masked CASCADE;
CREATE OR REPLACE VIEW public.loyalty_members_masked 
WITH (security_invoker = on) AS
SELECT 
  id, restaurant_id, points_balance, lifetime_points, tier, join_date, last_visit, created_at,
  CASE WHEN customer_name IS NOT NULL THEN LEFT(customer_name, 1) || '***' ELSE NULL END as customer_name
FROM public.loyalty_members;

-- 7. HOTEL_BOOKINGS masked view with correct columns
DROP VIEW IF EXISTS public.hotel_bookings_masked CASCADE;
CREATE OR REPLACE VIEW public.hotel_bookings_masked 
WITH (security_invoker = on) AS
SELECT 
  id, hotel_id, customer_id, room_id, check_in_date, check_out_date, nights, guests,
  room_count, price_per_night, subtotal, taxes_fees, total_amount, booking_reference,
  status, payment_status, rating, created_at, updated_at,
  CASE WHEN guest_name IS NOT NULL THEN LEFT(guest_name, 1) || '***' ELSE NULL END as guest_name,
  CASE WHEN guest_phone IS NOT NULL THEN '***-***-' || RIGHT(guest_phone, 4) ELSE NULL END as guest_phone,
  CASE WHEN guest_email IS NOT NULL THEN LEFT(guest_email, 2) || '***' ELSE NULL END as guest_email
FROM public.hotel_bookings;

-- 8. CAR_RENTALS masked view with correct columns
DROP VIEW IF EXISTS public.car_rentals_masked CASCADE;
CREATE OR REPLACE VIEW public.car_rentals_masked 
WITH (security_invoker = on) AS
SELECT 
  id, car_id, customer_id, pickup_date, return_date, pickup_location,
  return_location, daily_rate, total_days, subtotal, total_amount, status,
  rating, created_at, updated_at,
  CASE WHEN driver_license_number IS NOT NULL THEN '***' || RIGHT(driver_license_number, 4) ELSE NULL END as driver_license_number
FROM public.car_rentals;

-- 9. Grant access to masked views
GRANT SELECT ON public.reservations_masked TO authenticated;
GRANT SELECT ON public.waitlist_masked TO authenticated;
GRANT SELECT ON public.loyalty_members_masked TO authenticated;
GRANT SELECT ON public.hotel_bookings_masked TO authenticated;
GRANT SELECT ON public.car_rentals_masked TO authenticated;

-- 10. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;;
