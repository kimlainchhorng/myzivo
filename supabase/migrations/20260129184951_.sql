-- =============================================
-- PHASE 3: Fix remaining critical security vulnerabilities
-- =============================================

-- 1. FIX: car_rentals - Driver license numbers exposed (ERROR)
-- Already fixed in Phase 1 - verify policies exist
DROP POLICY IF EXISTS "Users can view own car rentals" ON public.car_rentals;
DROP POLICY IF EXISTS "Car owners can view their car rentals" ON public.car_rentals;

CREATE POLICY "Users can view own car rentals"
ON public.car_rentals FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can create own car rentals"
ON public.car_rentals FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- 2. FIX: trips - Customer travel patterns exposed (ERROR)
-- Already partially fixed - ensure no cross-driver access
DROP POLICY IF EXISTS "Riders can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Assigned drivers can view trips" ON public.trips;

CREATE POLICY "Riders can view own trips"
ON public.trips FOR SELECT
USING (rider_id = auth.uid());

CREATE POLICY "Assigned drivers can view trips"
ON public.trips FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 3. FIX: food_orders - Customer addresses exposed (ERROR)
-- Already partially fixed - ensure no cross-driver access
DROP POLICY IF EXISTS "Customers can view own food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view assigned food orders" ON public.food_orders;

CREATE POLICY "Customers can view own food orders"
ON public.food_orders FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Drivers can view assigned food orders"
ON public.food_orders FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 4. FIX: driver_location_history - Surveillance risk (WARN)
DROP POLICY IF EXISTS "Drivers can view own location history" ON public.driver_location_history;
DROP POLICY IF EXISTS "Drivers can insert location updates" ON public.driver_location_history;

CREATE POLICY "Drivers can view own location history"
ON public.driver_location_history FOR SELECT
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert location updates"
ON public.driver_location_history FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 5. FIX: waitlist - Customer info leak
DROP POLICY IF EXISTS "Restaurant owners can manage waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Public can view waitlist" ON public.waitlist;

-- Create helper function for restaurant ownership
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(p_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = p_restaurant_id AND r.owner_id = auth.uid()
  )
$$;

CREATE POLICY "Restaurant owners can manage waitlist"
ON public.waitlist FOR ALL
USING (public.is_restaurant_owner(restaurant_id))
WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- 6. FIX: transactions - Financial data exposed
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;

CREATE POLICY "Users view own transactions"
ON public.transactions FOR SELECT
USING (user_id = auth.uid());

-- 7. FIX: vehicle_documents - Registration documents exposed
DROP POLICY IF EXISTS "Owners can view vehicle documents" ON public.vehicle_documents;
DROP POLICY IF EXISTS "Owners can manage vehicle documents" ON public.vehicle_documents;

-- Create helper to check vehicle ownership
CREATE OR REPLACE FUNCTION public.is_vehicle_owner(p_vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vehicles v
    JOIN drivers d ON d.id = v.driver_id
    WHERE v.id = p_vehicle_id AND d.user_id = auth.uid()
  )
$$;

CREATE POLICY "Owners can view vehicle documents"
ON public.vehicle_documents FOR SELECT
USING (public.is_vehicle_owner(vehicle_id));

CREATE POLICY "Owners can manage vehicle documents"
ON public.vehicle_documents FOR ALL
USING (public.is_vehicle_owner(vehicle_id))
WITH CHECK (public.is_vehicle_owner(vehicle_id));

-- 8. FIX: customer_feedback - Customer info in feedback
DROP POLICY IF EXISTS "Restaurant owners can view feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Customers can submit feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Public can view public feedback" ON public.customer_feedback;

CREATE POLICY "Restaurant owners can view all feedback"
ON public.customer_feedback FOR SELECT
USING (public.is_restaurant_owner(restaurant_id));

CREATE POLICY "Public can view public feedback only"
ON public.customer_feedback FOR SELECT
USING (is_public = true);

CREATE POLICY "Anyone can submit feedback"
ON public.customer_feedback FOR INSERT
WITH CHECK (true);;
