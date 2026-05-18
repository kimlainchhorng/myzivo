-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create order_events table for tracking order status changes and notes
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.food_orders(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('status_change', 'note', 'assignment')),
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT at_least_one_order CHECK (order_id IS NOT NULL OR trip_id IS NOT NULL)
);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- 3. Extend app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'merchant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- 4. RLS Policies for profiles table
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. RLS Policies for order_events table
-- Users can read order events if they can access the related order
CREATE POLICY "Drivers can read their order events"
  ON public.order_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.drivers d ON d.id = fo.driver_id
      WHERE fo.id = order_events.order_id AND d.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.drivers d ON d.id = t.driver_id
      WHERE t.id = order_events.trip_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order events"
  ON public.order_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert order events for orders they have access to
CREATE POLICY "Drivers can create order events"
  ON public.order_events FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id AND (
      EXISTS (
        SELECT 1 FROM public.food_orders fo
        JOIN public.drivers d ON d.id = fo.driver_id
        WHERE fo.id = order_events.order_id AND d.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.trips t
        JOIN public.drivers d ON d.id = t.driver_id
        WHERE t.id = order_events.trip_id AND d.user_id = auth.uid()
      )
    )
  );

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_trip_id ON public.order_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);;
