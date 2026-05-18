-- Trusted Contacts Table (for trip sharing)
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  auto_share BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOS Alerts Table
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat NUMERIC,
  lng NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'resolved')),
  cancelled_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- Safety Alerts Table (for broadcast alerts)
CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  location_area TEXT,
  lat NUMERIC,
  lng NUMERIC,
  radius_km NUMERIC DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Trusted Contacts
CREATE POLICY "Drivers view their trusted contacts" ON public.trusted_contacts
  FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers insert their trusted contacts" ON public.trusted_contacts
  FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update their trusted contacts" ON public.trusted_contacts
  FOR UPDATE USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers delete their trusted contacts" ON public.trusted_contacts
  FOR DELETE USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS Policies: SOS Alerts
CREATE POLICY "Drivers view their SOS alerts" ON public.sos_alerts
  FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers create their SOS alerts" ON public.sos_alerts
  FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers update their SOS alerts" ON public.sos_alerts
  FOR UPDATE USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS Policies: Safety Alerts (broadcast - read-only)
CREATE POLICY "View active safety alerts" ON public.safety_alerts
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_driver ON public.trusted_contacts(driver_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_driver ON public.sos_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_active ON public.sos_alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_safety_alerts_active_time ON public.safety_alerts(is_active, expires_at);;
