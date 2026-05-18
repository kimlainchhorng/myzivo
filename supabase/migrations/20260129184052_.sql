-- =============================================
-- SECURITY FIX: Complete remaining RLS policies
-- =============================================

-- Drop existing policies that may conflict, then recreate
DROP POLICY IF EXISTS "Drivers can view assigned trips" ON public.trips;
DROP POLICY IF EXISTS "Riders can view own trips" ON public.trips;

-- 4. FIX: trips table - Restrict to rider and assigned driver only
CREATE POLICY "Riders can view own trips"
ON public.trips FOR SELECT
USING (rider_id = auth.uid());

CREATE POLICY "Drivers can view assigned trips"
ON public.trips FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.user_id = auth.uid()
    AND d.id = trips.driver_id
  )
);

-- 5. FIX: car_rentals table - Restrict to customer only
DROP POLICY IF EXISTS "Customers can view own car rentals" ON public.car_rentals;

CREATE POLICY "Customers can view own car rentals"
ON public.car_rentals FOR SELECT
USING (customer_id = auth.uid());

-- 6. FIX: hotel_bookings table
DROP POLICY IF EXISTS "Guests can view own hotel bookings" ON public.hotel_bookings;
DROP POLICY IF EXISTS "Hotel owners can view property bookings" ON public.hotel_bookings;

CREATE POLICY "Guests can view own hotel bookings"
ON public.hotel_bookings FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Hotel owners can view property bookings"
ON public.hotel_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hotels h
    WHERE h.id = hotel_bookings.hotel_id
    AND h.owner_id = auth.uid()
  )
);

-- 7. FIX: flight_bookings table
DROP POLICY IF EXISTS "Customers can view own flight bookings" ON public.flight_bookings;

CREATE POLICY "Customers can view own flight bookings"
ON public.flight_bookings FOR SELECT
USING (customer_id = auth.uid());

-- 8. FIX: reservations table
DROP POLICY IF EXISTS "Restaurant owners can view reservations" ON public.reservations;

CREATE POLICY "Restaurant owners can view reservations"
ON public.reservations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = reservations.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

-- 9. FIX: loyalty_members table
DROP POLICY IF EXISTS "Restaurant owners can view loyalty members" ON public.loyalty_members;

CREATE POLICY "Restaurant owners can view loyalty members"
ON public.loyalty_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = loyalty_members.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

-- 10. FIX: staff_members table
DROP POLICY IF EXISTS "Restaurant owners can view their staff" ON public.staff_members;
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff_members;

CREATE POLICY "Restaurant owners can view their staff"
ON public.staff_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = staff_members.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "Staff can view own record"
ON public.staff_members FOR SELECT
USING (user_id = auth.uid());

-- 11. FIX: emergency_contacts table
DROP POLICY IF EXISTS "Drivers can view own emergency contacts" ON public.emergency_contacts;

CREATE POLICY "Drivers can view own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.id = emergency_contacts.driver_id
    AND d.user_id = auth.uid()
  )
);

-- 12. FIX: driver_location_history table
DROP POLICY IF EXISTS "Drivers can view own location history" ON public.driver_location_history;

CREATE POLICY "Drivers can view own location history"
ON public.driver_location_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.id = driver_location_history.driver_id
    AND d.user_id = auth.uid()
  )
);

-- 13. FIX: saved_locations table
DROP POLICY IF EXISTS "Users can view own saved locations" ON public.saved_locations;

CREATE POLICY "Users can view own saved locations"
ON public.saved_locations FOR SELECT
USING (user_id = auth.uid());

-- 14. FIX: vehicles table
DROP POLICY IF EXISTS "Drivers can view own vehicles" ON public.vehicles;

CREATE POLICY "Drivers can view own vehicles"
ON public.vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.id = vehicles.driver_id
    AND d.user_id = auth.uid()
  )
);

-- 15. FIX: profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);;
