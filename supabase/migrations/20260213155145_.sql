
-- ============================================================
-- ZIVO MULTI-ROLE SCHEMA + RLS MIGRATION v3
-- ============================================================

-- STEP 1: ENUM
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'restaurant_user'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business_user'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STEP 2: ALTER EXISTING TABLES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('customer','driver','restaurant_user','business_user','admin'));
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York';
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
UPDATE public.cities SET active = COALESCE(is_active, true) WHERE active IS NULL;

ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rating_avg numeric DEFAULT 5;

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS customer_user_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS pickup_location jsonb;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS dropoff_location jsonb;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS fare_total numeric;
UPDATE public.trips SET customer_user_id = rider_id WHERE customer_user_id IS NULL AND rider_id IS NOT NULL;
UPDATE public.trips SET fare_total = fare_amount WHERE fare_total IS NULL AND fare_amount IS NOT NULL;

ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id);
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS rating_avg numeric DEFAULT 5;

ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS customer_user_id uuid REFERENCES public.profiles(id);
UPDATE public.food_orders SET customer_user_id = customer_id WHERE customer_user_id IS NULL AND customer_id IS NOT NULL;

ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS owner_type text CHECK (owner_type IN ('user','company','restaurant','driver'));
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS owner_id uuid;
UPDATE public.wallets SET owner_type = 'driver', owner_id = driver_id WHERE owner_type IS NULL AND driver_id IS NOT NULL;

-- STEP 3: CREATE NEW TABLES
CREATE TABLE IF NOT EXISTS public.service_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.cities(id) NOT NULL,
  name text NOT NULL, polygon jsonb, active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.cities(id),
  customer_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  driver_user_id uuid REFERENCES public.profiles(id),
  status text CHECK (status IN ('requested','assigned','arrived','in_progress','completed','canceled')) DEFAULT 'requested',
  pickup_location jsonb, dropoff_location jsonb, delivery_fee numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_users (
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner','manager','staff')) NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (restaurant_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.food_orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES public.menu_items(id) NOT NULL,
  qty int NOT NULL DEFAULT 1, price_each numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, status text DEFAULT 'active',
  billing_email text, preferred_currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_members (
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner','admin','manager','employee')) NOT NULL DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.company_policies (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  max_per_trip numeric, max_daily numeric, max_monthly numeric,
  allowed_services jsonb DEFAULT '["ride","eats","delivery"]'::jsonb,
  approval_required_over numeric,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  requested_by_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  approver_user_id uuid REFERENCES public.profiles(id),
  object_type text NOT NULL, object_id uuid,
  status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  notes text, created_at timestamptz DEFAULT now()
);

-- STEP 4: HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_company_member(_uid uuid, _company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE user_id = _uid AND company_id = _company_id);
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_uid uuid, _company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE user_id = _uid AND company_id = _company_id AND role IN ('owner','admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_member(_uid uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurant_users WHERE user_id = _uid AND restaurant_id = _restaurant_id);
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_owner_or_manager(_uid uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurant_users WHERE user_id = _uid AND restaurant_id = _restaurant_id AND role IN ('owner','manager'));
$$;

-- STEP 5: ENABLE RLS
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- STEP 6: DROP OLD POLICIES
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can read cities" ON public.cities;

DROP POLICY IF EXISTS "Admins have full access to drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_self" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_self" ON public.drivers;

DROP POLICY IF EXISTS "Admins can manage all trips" ON public.trips;
DROP POLICY IF EXISTS "trips_restricted" ON public.trips;
DROP POLICY IF EXISTS "Customers can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers can view assigned trips" ON public.trips;
DROP POLICY IF EXISTS "trips_select_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_insert_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_update_policy" ON public.trips;

DROP POLICY IF EXISTS "Admins can manage all restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins have full access to restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Owners can manage their restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_restricted" ON public.restaurants;

DROP POLICY IF EXISTS "Admins can manage all menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON public.menu_items;

DROP POLICY IF EXISTS "Admins can manage all food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Admins have full access to food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "Customers can create food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Customers can view own food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can accept ready orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can update their assigned food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Drivers can view ready for pickup orders" ON public.food_orders;
DROP POLICY IF EXISTS "Merchants can create orders" ON public.food_orders;
DROP POLICY IF EXISTS "Merchants can read own restaurant orders" ON public.food_orders;
DROP POLICY IF EXISTS "Merchants can update own orders" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners can assign drivers to their orders" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners can update order status" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurant owners can view their orders" ON public.food_orders;
DROP POLICY IF EXISTS "Restaurants can assign drivers to orders" ON public.food_orders;
DROP POLICY IF EXISTS "Users can read own orders by phone" ON public.food_orders;
DROP POLICY IF EXISTS "customers_create_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "customers_view_own_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "drivers_read_assigned_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "drivers_update_assigned_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "drivers_update_food_orders" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_insert" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_owner_insert" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_owner_select" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_owner_update" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_participant_only" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_restricted" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_update" ON public.food_orders;
DROP POLICY IF EXISTS "food_orders_update_policy" ON public.food_orders;
DROP POLICY IF EXISTS "orders_insert_auth" ON public.food_orders;

DROP POLICY IF EXISTS "wallets_restricted" ON public.wallets;
DROP POLICY IF EXISTS "wallets_select_policy" ON public.wallets;
DROP POLICY IF EXISTS "Drivers can view own wallet" ON public.wallets;

DROP POLICY IF EXISTS "transactions_participant_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_restricted" ON public.transactions;

DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view invoices for their business" ON public.invoices;

DROP POLICY IF EXISTS "Admins can update any notification" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Admins manage tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users manage own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_restricted" ON public.support_tickets;

DROP POLICY IF EXISTS "vehicles_restricted" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can manage own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_select_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_policy" ON public.vehicles;

-- STEP 7: CREATE CLEAN RLS POLICIES

-- PROFILES
CREATE POLICY "zivo_profiles_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "zivo_profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- CITIES
CREATE POLICY "zivo_cities_select" ON public.cities FOR SELECT TO anon, authenticated USING (active = true OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cities_admin_insert" ON public.cities FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "zivo_cities_admin_update" ON public.cities FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "zivo_cities_admin_delete" ON public.cities FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- SERVICE_ZONES
CREATE POLICY "zivo_sz_select" ON public.service_zones FOR SELECT TO anon, authenticated USING (active = true OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_sz_admin_insert" ON public.service_zones FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "zivo_sz_admin_update" ON public.service_zones FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "zivo_sz_admin_delete" ON public.service_zones FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- DRIVERS
CREATE POLICY "zivo_drivers_select" ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_drivers_insert" ON public.drivers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "zivo_drivers_update" ON public.drivers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- VEHICLES
CREATE POLICY "zivo_vehicles_select" ON public.vehicles FOR SELECT TO authenticated USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_vehicles_insert" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_vehicles_update" ON public.vehicles FOR UPDATE TO authenticated USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_vehicles_delete" ON public.vehicles FOR DELETE TO authenticated USING (driver_id = auth.uid() OR public.is_admin(auth.uid()));

-- TRIPS
CREATE POLICY "zivo_trips_select" ON public.trips FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid() OR rider_id = auth.uid() OR driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_trips_insert" ON public.trips FOR INSERT TO authenticated
  WITH CHECK (customer_user_id = auth.uid() OR rider_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_trips_update" ON public.trips FOR UPDATE TO authenticated
  USING ((customer_user_id = auth.uid() AND status = 'requested') OR (rider_id = auth.uid() AND status = 'requested') OR driver_id = auth.uid() OR public.is_admin(auth.uid()));

-- DELIVERIES
CREATE POLICY "zivo_deliveries_select" ON public.deliveries FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid() OR driver_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_deliveries_insert" ON public.deliveries FOR INSERT TO authenticated
  WITH CHECK (customer_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_deliveries_update" ON public.deliveries FOR UPDATE TO authenticated
  USING ((customer_user_id = auth.uid() AND status = 'requested') OR driver_user_id = auth.uid() OR public.is_admin(auth.uid()));

-- RESTAURANTS
CREATE POLICY "zivo_restaurants_select" ON public.restaurants FOR SELECT TO anon, authenticated
  USING (status = 'active' OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_restaurants_admin_insert" ON public.restaurants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "zivo_restaurants_update" ON public.restaurants FOR UPDATE TO authenticated
  USING (public.is_restaurant_owner_or_manager(auth.uid(), id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_restaurants_admin_delete" ON public.restaurants FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- RESTAURANT_USERS
CREATE POLICY "zivo_ru_select" ON public.restaurant_users FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_ru_insert" ON public.restaurant_users FOR INSERT TO authenticated
  WITH CHECK (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_ru_update" ON public.restaurant_users FOR UPDATE TO authenticated
  USING (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_ru_delete" ON public.restaurant_users FOR DELETE TO authenticated
  USING (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));

-- MENU_ITEMS (uses is_available)
CREATE POLICY "zivo_menu_select" ON public.menu_items FOR SELECT TO anon, authenticated
  USING (is_available = true OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_menu_insert" ON public.menu_items FOR INSERT TO authenticated
  WITH CHECK (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_menu_update" ON public.menu_items FOR UPDATE TO authenticated
  USING (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_menu_delete" ON public.menu_items FOR DELETE TO authenticated
  USING (public.is_restaurant_owner_or_manager(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));

-- FOOD_ORDERS
CREATE POLICY "zivo_fo_select" ON public.food_orders FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid() OR customer_id = auth.uid() OR driver_id = auth.uid() OR public.is_restaurant_member(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_fo_insert" ON public.food_orders FOR INSERT TO authenticated
  WITH CHECK (customer_user_id = auth.uid() OR customer_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_fo_update" ON public.food_orders FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() OR public.is_restaurant_member(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));

-- FOOD_ORDER_ITEMS
CREATE POLICY "zivo_foi_select" ON public.food_order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.food_orders fo WHERE fo.id = order_id AND (fo.customer_user_id = auth.uid() OR fo.customer_id = auth.uid() OR fo.driver_id = auth.uid() OR public.is_restaurant_member(auth.uid(), fo.restaurant_id) OR public.is_admin(auth.uid()))));
CREATE POLICY "zivo_foi_admin" ON public.food_order_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- COMPANIES
CREATE POLICY "zivo_companies_select" ON public.companies FOR SELECT TO authenticated
  USING (public.is_company_member(auth.uid(), id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "zivo_companies_update" ON public.companies FOR UPDATE TO authenticated
  USING (public.is_company_admin(auth.uid(), id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_companies_delete" ON public.companies FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- COMPANY_MEMBERS
CREATE POLICY "zivo_cm_select" ON public.company_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cm_insert" ON public.company_members FOR INSERT TO authenticated
  WITH CHECK (public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cm_update" ON public.company_members FOR UPDATE TO authenticated
  USING (public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cm_delete" ON public.company_members FOR DELETE TO authenticated
  USING (public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));

-- COMPANY_POLICIES
CREATE POLICY "zivo_cp_select" ON public.company_policies FOR SELECT TO authenticated
  USING (public.is_company_member(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cp_update" ON public.company_policies FOR UPDATE TO authenticated
  USING (public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_cp_admin" ON public.company_policies FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- APPROVALS
CREATE POLICY "zivo_approvals_select" ON public.approvals FOR SELECT TO authenticated
  USING (requested_by_user_id = auth.uid() OR approver_user_id = auth.uid() OR public.is_company_admin(auth.uid(), company_id) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_approvals_insert" ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requested_by_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_approvals_update" ON public.approvals FOR UPDATE TO authenticated
  USING (approver_user_id = auth.uid() OR public.is_admin(auth.uid()));

-- WALLETS
CREATE POLICY "zivo_wallets_select" ON public.wallets FOR SELECT TO authenticated
  USING ((owner_type = 'driver' AND owner_id = auth.uid()) OR (owner_type = 'user' AND owner_id = auth.uid()) OR (driver_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_wallets_admin_update" ON public.wallets FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- TRANSACTIONS (no wallet_id - uses user_id, driver_id, restaurant_id)
CREATE POLICY "zivo_transactions_select" ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR driver_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_transactions_admin_insert" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- INVOICES (uses business_id not company_id)
CREATE POLICY "zivo_invoices_select" ON public.invoices FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "zivo_invoices_admin" ON public.invoices FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "zivo_notifications_select" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_notifications_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_notifications_admin_insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- SUPPORT_TICKETS (uses user_id not created_by_user_id)
CREATE POLICY "zivo_tickets_select" ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'support'));
CREATE POLICY "zivo_tickets_insert" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "zivo_tickets_update" ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'support'));

-- STEP 8: INDEXES
CREATE INDEX IF NOT EXISTS idx_service_zones_city ON public.service_zones(city_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON public.deliveries(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON public.deliveries(driver_user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_city ON public.deliveries(city_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_user ON public.restaurant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_food_order_items_order ON public.food_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_company ON public.approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON public.approvals(requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON public.approvals(approver_user_id);
CREATE INDEX IF NOT EXISTS idx_trips_customer_user ON public.trips(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_customer_user ON public.food_orders(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_owner ON public.wallets(owner_type, owner_id);
;
