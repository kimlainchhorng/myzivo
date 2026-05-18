-- =====================================================
-- COMPREHENSIVE SECURITY HARDENING - ALL SENSITIVE TABLES
-- Remove public role access, restrict to authenticated only
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE - Strict owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DRIVERS TABLE - Strict owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "drivers_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_public_select" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view their own record" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_own_or_admin" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_own" ON public.drivers;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 3. TRIPS TABLE - Participant only (rider + driver + admin)
-- =====================================================
DROP POLICY IF EXISTS "trips_select" ON public.trips;
DROP POLICY IF EXISTS "trips_public_select" ON public.trips;
DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 4. HOTEL_BOOKINGS - Already fixed, ensure FORCE RLS
-- =====================================================
ALTER TABLE public.hotel_bookings FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CAR_RENTALS - Remove public role policies
-- =====================================================
DROP POLICY IF EXISTS "car_rentals_select" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers view own rentals only" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers can view own car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners can view rentals of their cars" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners can update rental status" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers can create car rentals" ON public.car_rentals;
ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_rentals FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 6. FOOD_ORDERS - Participant only
-- =====================================================
DROP POLICY IF EXISTS "food_orders_select" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_public_select" ON public.food_orders;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CUSTOMER_FEEDBACK - Public feedback without PII, full access for owners
-- =====================================================
DROP POLICY IF EXISTS "customer_feedback_select" ON public.customer_feedback;
DROP POLICY IF EXISTS "Restaurant owners can view all feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Restaurant owners view feedback" ON public.customer_feedback;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 8. RESERVATIONS - Restaurant owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
DROP POLICY IF EXISTS "reservations_public_select" ON public.reservations;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 9. STAFF_MEMBERS - Restaurant owner + admin only  
-- =====================================================
DROP POLICY IF EXISTS "staff_members_select" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_public_select" ON public.staff_members;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 10. LOYALTY_MEMBERS - Restaurant owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "loyalty_members_select" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_members_public_select" ON public.loyalty_members;
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_members FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 11. WAITLIST - Restaurant owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "waitlist_select" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_public_select" ON public.waitlist;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 12. GIFT_CARDS - Restaurant owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "gift_cards_select" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_public_select" ON public.gift_cards;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 13. VEHICLES - Driver owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_public_select" ON public.vehicles;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 14. EMERGENCY_CONTACTS - Driver owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "emergency_contacts_select" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_public_select" ON public.emergency_contacts;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 15. DRIVER_EARNINGS - Driver owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "driver_earnings_select" ON public.driver_earnings;
DROP POLICY IF EXISTS "driver_earnings_public_select" ON public.driver_earnings;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 16. DRIVER_WITHDRAWALS - Driver owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "driver_withdrawals_select" ON public.driver_withdrawals;
DROP POLICY IF EXISTS "driver_withdrawals_insert" ON public.driver_withdrawals;
ALTER TABLE public.driver_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_withdrawals FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 17. TRANSACTIONS - Participant + admin only
-- =====================================================
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_public_select" ON public.transactions;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 18. SECURITY_EVENTS - Admin only
-- =====================================================
DROP POLICY IF EXISTS "security_events_select" ON public.security_events;
DROP POLICY IF EXISTS "security_events_public_select" ON public.security_events;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 19. AUDIT_LOGS - Admin only
-- =====================================================
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_public_select" ON public.audit_logs;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 20. CHAT_MESSAGES - Participant only (sender/receiver)
-- =====================================================
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_public_select" ON public.chat_messages;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 21. TRUSTED_CONTACTS - Owner + admin only
-- =====================================================
DROP POLICY IF EXISTS "trusted_contacts_select" ON public.trusted_contacts;
DROP POLICY IF EXISTS "trusted_contacts_public_select" ON public.trusted_contacts;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 22. CUSTOMER_ORDERS - Restaurant owner + customer + admin
-- =====================================================
DROP POLICY IF EXISTS "customer_orders_select" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_public_select" ON public.customer_orders;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 23. FLIGHT_BOOKINGS - Customer + admin only
-- =====================================================
DROP POLICY IF EXISTS "flight_bookings_select" ON public.flight_bookings;
DROP POLICY IF EXISTS "flight_bookings_public_select" ON public.flight_bookings;
ALTER TABLE public.flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_bookings FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 24. HOTELS TABLE - Ensure protected
-- =====================================================
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels FORCE ROW LEVEL SECURITY;;
