-- Create customers profile table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Customers can insert their own profile
CREATE POLICY "customers_insert_own" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Customers can update their own profile
CREATE POLICY "customers_update_own" ON public.customers
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for trips table (customer access)
CREATE POLICY "customers_view_own_trips" ON public.trips
  FOR SELECT TO authenticated
  USING (rider_id = auth.uid());

CREATE POLICY "customers_create_trips" ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (rider_id = auth.uid());

-- RLS Policies for food_orders table (customer access)
CREATE POLICY "customers_view_own_food_orders" ON public.food_orders
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "customers_create_food_orders" ON public.food_orders
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Customer access to assigned driver location during active orders
-- trips uses trip_status: accepted, en_route, arrived, in_progress
-- food_orders uses booking_status: confirmed, in_progress, ready_for_pickup
CREATE POLICY "customer_view_assigned_driver_location" ON public.drivers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.rider_id = auth.uid()
        AND trips.driver_id = drivers.id
        AND trips.status::text IN ('accepted', 'en_route', 'arrived', 'in_progress')
    )
    OR EXISTS (
      SELECT 1 FROM food_orders
      WHERE food_orders.customer_id = auth.uid()
        AND food_orders.driver_id = drivers.id
        AND food_orders.status::text IN ('confirmed', 'in_progress', 'ready_for_pickup')
    )
  );

-- Create updated_at trigger for customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
