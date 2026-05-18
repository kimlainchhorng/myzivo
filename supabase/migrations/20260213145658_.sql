
-- Trip PIN verification table
CREATE TABLE public.trip_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  pin_code TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_pins ENABLE ROW LEVEL SECURITY;

-- Customers can view their trip PINs
CREATE POLICY "Customers can view their trip PIN"
  ON public.trip_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r WHERE r.id = trip_id AND r.rider_user_id = auth.uid()
    )
  );

-- Drivers can view and update PINs for their assigned trips  
CREATE POLICY "Drivers can view their trip PIN"
  ON public.trip_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r WHERE r.id = trip_id AND r.driver_id = (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Drivers can update PIN verification"
  ON public.trip_pins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r WHERE r.id = trip_id AND r.driver_id = (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  );

-- Admins can manage all PINs
CREATE POLICY "Admins can manage trip PINs"
  ON public.trip_pins FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Authenticated can insert PINs
CREATE POLICY "Authenticated can insert trip PINs"
  ON public.trip_pins FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE UNIQUE INDEX idx_trip_pins_trip ON public.trip_pins(trip_id);
CREATE INDEX idx_trip_pins_expires ON public.trip_pins(expires_at);

-- Function to generate a random 4-digit PIN
CREATE OR REPLACE FUNCTION public.generate_trip_pin(p_trip_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin TEXT;
BEGIN
  v_pin := lpad(floor(random() * 10000)::text, 4, '0');
  
  INSERT INTO public.trip_pins (trip_id, pin_code)
  VALUES (p_trip_id, v_pin)
  ON CONFLICT (trip_id) DO UPDATE SET
    pin_code = v_pin,
    is_verified = false,
    attempts = 0,
    verified_at = NULL,
    expires_at = now() + interval '1 hour',
    created_at = now();
  
  RETURN v_pin;
END;
$$;

-- Function to verify a PIN
CREATE OR REPLACE FUNCTION public.verify_trip_pin(p_trip_id UUID, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record trip_pins%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM trip_pins WHERE trip_id = p_trip_id;
  
  IF v_record IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PIN not found');
  END IF;
  
  IF v_record.is_verified THEN
    RETURN jsonb_build_object('ok', true, 'already_verified', true);
  END IF;
  
  IF v_record.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PIN expired');
  END IF;
  
  IF v_record.attempts >= v_record.max_attempts THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Too many attempts');
  END IF;
  
  UPDATE trip_pins SET attempts = attempts + 1 WHERE trip_id = p_trip_id;
  
  IF v_record.pin_code = p_pin THEN
    UPDATE trip_pins SET is_verified = true, verified_at = now() WHERE trip_id = p_trip_id;
    RETURN jsonb_build_object('ok', true, 'verified', true);
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Incorrect PIN', 'attempts_remaining', v_record.max_attempts - v_record.attempts - 1);
  END IF;
END;
$$;
;
