
CREATE TABLE public.fare_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid,
  service_type text NOT NULL DEFAULT 'ride',
  ride_type text NOT NULL DEFAULT 'standard',
  zone_id uuid,
  distance_miles numeric NOT NULL DEFAULT 0,
  duration_minutes numeric NOT NULL DEFAULT 0,
  base_fare numeric NOT NULL DEFAULT 0,
  distance_charge numeric NOT NULL DEFAULT 0,
  time_charge numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  surge_multiplier numeric NOT NULL DEFAULT 1,
  surge_amount numeric NOT NULL DEFAULT 0,
  time_multiplier numeric NOT NULL DEFAULT 1,
  time_adjustment numeric NOT NULL DEFAULT 0,
  service_fee numeric NOT NULL DEFAULT 0,
  booking_fee numeric NOT NULL DEFAULT 0,
  total_fare numeric NOT NULL DEFAULT 0,
  minimum_fare_applied boolean NOT NULL DEFAULT false,
  breakdown_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fare_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all fare calculations"
  ON public.fare_calculations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert fare calculations"
  ON public.fare_calculations FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_fare_calculations_created_at ON public.fare_calculations (created_at DESC);
CREATE INDEX idx_fare_calculations_service_type ON public.fare_calculations (service_type);
CREATE INDEX idx_fare_calculations_order_id ON public.fare_calculations (order_id);
;
