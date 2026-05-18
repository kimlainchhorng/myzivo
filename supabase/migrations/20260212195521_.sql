
-- Create passenger_ratings table
CREATE TABLE public.passenger_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  customer_id UUID NOT NULL,
  trip_id UUID,
  food_order_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT passenger_ratings_order_check CHECK (trip_id IS NOT NULL OR food_order_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_passenger_ratings_trip ON public.passenger_ratings(driver_id, trip_id) WHERE trip_id IS NOT NULL;
CREATE UNIQUE INDEX idx_passenger_ratings_food ON public.passenger_ratings(driver_id, food_order_id) WHERE food_order_id IS NOT NULL;

ALTER TABLE public.passenger_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert their own passenger ratings"
  ON public.passenger_ratings FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can view their own passenger ratings"
  ON public.passenger_ratings FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all passenger ratings"
  ON public.passenger_ratings FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Create rating_flags table
CREATE TABLE public.rating_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  flag_type TEXT NOT NULL CHECK (flag_type IN ('low_average', 'repeated_low', 'complaint_pattern')),
  details JSONB DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rating_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rating flags"
  ON public.rating_flags FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update rating flags"
  ON public.rating_flags FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert rating flags"
  ON public.rating_flags FOR INSERT
  WITH CHECK (true);
;
