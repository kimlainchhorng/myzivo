-- Flight Funnel Events Table for tracking user journey
CREATE TABLE public.flight_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  
  -- Route context
  origin TEXT,
  destination TEXT,
  departure_date DATE,
  return_date DATE,
  passengers INTEGER,
  cabin_class TEXT,
  
  -- Event-specific data
  offer_id TEXT,
  booking_id UUID,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  offers_count INTEGER,
  
  -- Failure tracking
  error_type TEXT,
  error_message TEXT,
  
  -- Device/source
  device_type TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admin read-only
ALTER TABLE flight_funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read funnel events"
ON flight_funnel_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert funnel events"
ON flight_funnel_events FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Anon can insert funnel events"
ON flight_funnel_events FOR INSERT TO anon
WITH CHECK (true);

-- Indexes for analytics queries
CREATE INDEX idx_funnel_event_type ON flight_funnel_events(event_type);
CREATE INDEX idx_funnel_created ON flight_funnel_events(created_at);
CREATE INDEX idx_funnel_route ON flight_funnel_events(origin, destination);
CREATE INDEX idx_funnel_session ON flight_funnel_events(session_id);

-- Add revenue columns to flight_bookings
ALTER TABLE flight_bookings
ADD COLUMN IF NOT EXISTS zivo_markup NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS zivo_margin_pct NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_processor_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS duffel_cost NUMERIC;;
