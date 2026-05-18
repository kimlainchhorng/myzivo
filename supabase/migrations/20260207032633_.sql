-- Create risk_events table for audit logging suspicious activity
CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity INT NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  details JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_limits table for rate limiting customers
CREATE TABLE IF NOT EXISTS public.user_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  orders_created_today INT DEFAULT 0,
  cancels_today INT DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create driver_limits table for rate limiting drivers
CREATE TABLE IF NOT EXISTS public.driver_limits (
  driver_id UUID PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  cancels_today INT DEFAULT 0,
  location_flags_today INT DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add GPS anti-spoof tracking fields to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS prev_lat NUMERIC,
ADD COLUMN IF NOT EXISTS prev_lng NUMERIC,
ADD COLUMN IF NOT EXISTS prev_location_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_suspicious BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspicious_count INT DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin-only access to risk_events (using existing has_role function)
CREATE POLICY "Admin can view risk_events"
ON public.risk_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update risk_events"
ON public.risk_events FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert risk_events"
ON public.risk_events FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- No direct user access to limits tables - only service role (Edge Functions)

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_risk_events_user_id ON public.risk_events(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_driver_id ON public.risk_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_event_type ON public.risk_events(event_type);
CREATE INDEX IF NOT EXISTS idx_risk_events_created_at ON public.risk_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_suspicious ON public.drivers(location_suspicious) WHERE location_suspicious = true;;
