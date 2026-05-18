-- Driver shifts/scheduling table
CREATE TABLE public.driver_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  earnings NUMERIC(10,2) DEFAULT 0,
  trips_completed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages between drivers and customers
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.food_orders(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('driver', 'customer', 'system')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Multi-stop delivery batches
CREATE TABLE public.delivery_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  total_distance_km NUMERIC(10,2),
  total_earnings NUMERIC(10,2),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batch stops (individual deliveries in a batch)
CREATE TABLE public.batch_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.delivery_batches(id) ON DELETE CASCADE,
  food_order_id UUID REFERENCES public.food_orders(id),
  trip_id UUID REFERENCES public.trips(id),
  stop_order INTEGER NOT NULL,
  stop_type TEXT NOT NULL CHECK (stop_type IN ('pickup', 'dropoff')),
  address TEXT NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'completed', 'skipped')),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.driver_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_stops ENABLE ROW LEVEL SECURITY;

-- Driver shifts policies
CREATE POLICY "Drivers can view their own shifts"
  ON public.driver_shifts FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can create their own shifts"
  ON public.driver_shifts FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own shifts"
  ON public.driver_shifts FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete their own shifts"
  ON public.driver_shifts FOR DELETE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Chat messages policies (drivers can see messages for their orders/trips)
CREATE POLICY "Users can view messages for their orders"
  ON public.chat_messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    order_id IN (SELECT id FROM public.food_orders WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())) OR
    trip_id IN (SELECT id FROM public.trips WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can mark their messages as read"
  ON public.chat_messages FOR UPDATE
  USING (
    order_id IN (SELECT id FROM public.food_orders WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())) OR
    trip_id IN (SELECT id FROM public.trips WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
  );

-- Delivery batches policies
CREATE POLICY "Drivers can view their own batches"
  ON public.delivery_batches FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can create their own batches"
  ON public.delivery_batches FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own batches"
  ON public.delivery_batches FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Batch stops policies
CREATE POLICY "Drivers can view stops for their batches"
  ON public.batch_stops FOR SELECT
  USING (batch_id IN (SELECT id FROM public.delivery_batches WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())));

CREATE POLICY "Drivers can manage stops for their batches"
  ON public.batch_stops FOR ALL
  USING (batch_id IN (SELECT id FROM public.delivery_batches WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())));

-- Add updated_at triggers
CREATE TRIGGER update_driver_shifts_updated_at
  BEFORE UPDATE ON public.driver_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;;
