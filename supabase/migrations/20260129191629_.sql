-- =============================================
-- PHASE 6: REMOVE DANGEROUS AND DUPLICATE POLICIES
-- =============================================

-- 1. Fix food_orders - remove dangerous policy that allows viewing all unassigned orders
DROP POLICY IF EXISTS "food_orders_select_policy" ON public.food_orders;

-- 2. Clean up duplicate car_rentals SELECT policies (keep only the strict ones)
DROP POLICY IF EXISTS "Customers can view their car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Users can view own car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners view their vehicle rentals" ON public.car_rentals;
-- Keep: "Customers can view own car rentals" and "Car owners can view rentals of their cars"

-- 3. Clean up duplicate customer_orders policies
DROP POLICY IF EXISTS "Restaurant owners view customer orders" ON public.customer_orders;
-- Keep: "Restaurant owners manage customer orders"

-- 4. Clean up duplicate flight_bookings SELECT policies
DROP POLICY IF EXISTS "Customers can view their flight bookings" ON public.flight_bookings;
DROP POLICY IF EXISTS "Customers view own flight bookings only" ON public.flight_bookings;
-- Keep: "Customers can view own flight bookings"

-- 5. Clean up duplicate food_orders SELECT policies
DROP POLICY IF EXISTS "Customers can view their food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Customers view own food orders only" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view assigned food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view their assigned food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers view assigned food orders only" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners view their food orders" ON public.food_orders;
-- Keep: "Customers can view own food orders", "Drivers can view ready for pickup orders", "Restaurant owners can view their orders"

-- 6. Clean up duplicate hotel_bookings SELECT policies
DROP POLICY IF EXISTS "Customers can view their hotel bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Guests can view own hotel bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Hotel owners view property bookings" ON public.hotel_bookings;
-- Keep: "Customers view own hotel bookings only", "Hotel owners can view property bookings"

-- 7. Clean up duplicate loyalty_members policies
DROP POLICY IF EXISTS "Restaurant owners view loyalty members" ON public.loyalty_members;
DROP POLICY IF EXISTS "Restaurant owners can view loyalty members" ON public.loyalty_members;
-- Keep: "Restaurant owners manage loyalty members"

-- 8. Clean up duplicate profiles policies
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- Keep: "Users can view own profile only", "Users can update own profile", "Users can insert own profile"

-- 9. Clean up duplicate reservations policies
DROP POLICY IF EXISTS "Restaurant owners can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Restaurant owners view reservations" ON public.reservations;
-- Keep: "Restaurant owners can manage reservations"

-- 10. Clean up duplicate trips SELECT policies  
DROP POLICY IF EXISTS "Drivers can view assigned trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers view assigned trips only" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Riders view own trips only" ON public.trips;
-- Keep: "Drivers can view their assigned trips", "Riders can view own trips"

-- 11. Clean up duplicate drivers policies
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their online status" ON public.drivers;
-- Keep: "Drivers can view their own record", "Drivers can update their own record", "Users can register as driver"

-- 12. Remove dangerous INSERT policies without WITH CHECK clauses
-- These allow anyone to insert without restrictions
DROP POLICY IF EXISTS "Users can create own car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Customers can create hotel bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;

-- 13. Create proper INSERT policies with restrictions
CREATE POLICY "Authenticated users can create car rentals" ON public.car_rentals
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Authenticated users can create hotel bookings" ON public.hotel_bookings
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Authenticated users can make reservations" ON public.reservations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);;
