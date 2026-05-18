-- =============================================
-- RESTAURANT PII TABLES - Final Security Fixes
-- =============================================

-- CUSTOMER_ORDERS - Restaurant owner only
DROP POLICY IF EXISTS "customer_orders_restaurant_select" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_restaurant_insert" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_restaurant_update" ON public.customer_orders;
DROP POLICY IF EXISTS "customer_orders_select_policy" ON public.customer_orders;
DROP POLICY IF EXISTS "Restaurant owners can manage orders" ON public.customer_orders;

ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_orders_owner_select" ON public.customer_orders FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "customer_orders_owner_insert" ON public.customer_orders FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "customer_orders_owner_update" ON public.customer_orders FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.customer_orders FROM anon, public;

-- RESERVATIONS - Restaurant owner only
DROP POLICY IF EXISTS "reservations_restaurant_select" ON public.reservations;
DROP POLICY IF EXISTS "reservations_restaurant_insert" ON public.reservations;
DROP POLICY IF EXISTS "reservations_restaurant_update" ON public.reservations;
DROP POLICY IF EXISTS "reservations_select_policy" ON public.reservations;
DROP POLICY IF EXISTS "Restaurant owners can manage reservations" ON public.reservations;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_owner_select" ON public.reservations FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reservations_owner_insert" ON public.reservations FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "reservations_owner_update" ON public.reservations FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.reservations FROM anon, public;

-- STAFF_MEMBERS - Restaurant owner or self
DROP POLICY IF EXISTS "staff_members_secure_select" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_secure_insert" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_secure_update" ON public.staff_members;
DROP POLICY IF EXISTS "staff_select_policy" ON public.staff_members;
DROP POLICY IF EXISTS "Restaurant owners can manage staff" ON public.staff_members;

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_members_owner_select" ON public.staff_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "staff_members_owner_insert" ON public.staff_members FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "staff_members_owner_update" ON public.staff_members FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.staff_members FROM anon, public;

-- LOYALTY_MEMBERS - Restaurant owner only
DROP POLICY IF EXISTS "loyalty_members_secure_select" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_members_secure_insert" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_members_secure_update" ON public.loyalty_members;
DROP POLICY IF EXISTS "loyalty_select_policy" ON public.loyalty_members;

ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_members_owner_select" ON public.loyalty_members FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "loyalty_members_owner_insert" ON public.loyalty_members FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "loyalty_members_owner_update" ON public.loyalty_members FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.loyalty_members FROM anon, public;

-- WAITLIST - Restaurant owner only
DROP POLICY IF EXISTS "waitlist_secure_select" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_secure_insert" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_secure_update" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_secure_delete" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_policy" ON public.waitlist;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_owner_select" ON public.waitlist FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "waitlist_owner_insert" ON public.waitlist FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "waitlist_owner_update" ON public.waitlist FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "waitlist_owner_delete" ON public.waitlist FOR DELETE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.waitlist FROM anon, public;

-- CUSTOMER_FEEDBACK - Public if is_public, else restaurant owner
DROP POLICY IF EXISTS "customer_feedback_secure_select" ON public.customer_feedback;
DROP POLICY IF EXISTS "customer_feedback_secure_insert" ON public.customer_feedback;
DROP POLICY IF EXISTS "customer_feedback_secure_update" ON public.customer_feedback;
DROP POLICY IF EXISTS "feedback_select_policy" ON public.customer_feedback;
DROP POLICY IF EXISTS "Anyone can view public feedback" ON public.customer_feedback;

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_feedback_owner_select" ON public.customer_feedback FOR SELECT TO authenticated
USING (
  is_public = true
  OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "customer_feedback_public_insert" ON public.customer_feedback FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY "customer_feedback_owner_update" ON public.customer_feedback FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.customer_feedback FROM anon, public;

-- GIFT_CARDS - Restaurant owner only
DROP POLICY IF EXISTS "gift_cards_secure_select" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_secure_insert" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_secure_update" ON public.gift_cards;
DROP POLICY IF EXISTS "giftcards_select_policy" ON public.gift_cards;

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_cards_owner_select" ON public.gift_cards FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "gift_cards_owner_insert" ON public.gift_cards FOR INSERT TO authenticated
WITH CHECK (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()));
CREATE POLICY "gift_cards_owner_update" ON public.gift_cards FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.gift_cards FROM anon, public;

-- FOOD_ORDERS - Customer, driver, or restaurant owner
DROP POLICY IF EXISTS "food_orders_participant_select" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_customer_insert" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_participant_update" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_select_policy" ON public.food_orders;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.food_orders;

ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "food_orders_owner_select" ON public.food_orders FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
  OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "food_orders_owner_insert" ON public.food_orders FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());
CREATE POLICY "food_orders_owner_update" ON public.food_orders FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.food_orders FROM anon, public;

-- TRIPS - Participant only
DROP POLICY IF EXISTS "trips_participant_select" ON public.trips;
DROP POLICY IF EXISTS "trips_rider_insert" ON public.trips;
DROP POLICY IF EXISTS "trips_participant_update" ON public.trips;
DROP POLICY IF EXISTS "trips_select_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_insert_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_update_policy" ON public.trips;

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_owner_select" ON public.trips FOR SELECT TO authenticated
USING (
  rider_id = auth.uid() 
  OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "trips_owner_insert" ON public.trips FOR INSERT TO authenticated
WITH CHECK (rider_id = auth.uid() OR rider_id IS NULL);
CREATE POLICY "trips_owner_update" ON public.trips FOR UPDATE TO authenticated
USING (rider_id = auth.uid() OR driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.trips FROM anon, public;;
