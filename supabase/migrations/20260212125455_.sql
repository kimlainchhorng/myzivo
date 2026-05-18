
-- =============================================
-- Restricted Zones System
-- =============================================

-- 1. restricted_zones table
CREATE TABLE public.restricted_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('allowed', 'restricted', 'pickup_only', 'dropoff_only')),
  polygon JSONB NOT NULL,
  center_lat NUMERIC,
  center_lng NUMERIC,
  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ride_allowed BOOLEAN NOT NULL DEFAULT true,
  delivery_allowed BOOLEAN NOT NULL DEFAULT true,
  restaurant_allowed BOOLEAN NOT NULL DEFAULT true,
  warning_message TEXT,
  redirect_message TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restricted_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on restricted_zones" ON public.restricted_zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
  );

CREATE INDEX idx_restricted_zones_active ON public.restricted_zones (is_active);

-- 2. restricted_zone_rules table
CREATE TABLE public.restricted_zone_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.restricted_zones(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('nighttime', 'temporary_closure', 'event_based')),
  description TEXT,
  start_time TIME,
  end_time TIME,
  start_date DATE,
  end_date DATE,
  event_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restricted_zone_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on restricted_zone_rules" ON public.restricted_zone_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
  );

CREATE INDEX idx_restricted_zone_rules_zone ON public.restricted_zone_rules (zone_id, is_active);

-- 3. restricted_zone_logs table
CREATE TABLE public.restricted_zone_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.restricted_zones(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'redirected', 'warned')),
  service_type TEXT,
  user_id UUID,
  driver_id UUID,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restricted_zone_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on restricted_zone_logs" ON public.restricted_zone_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
  );

CREATE INDEX idx_restricted_zone_logs_zone ON public.restricted_zone_logs (zone_id, created_at DESC);
CREATE INDEX idx_restricted_zone_logs_created ON public.restricted_zone_logs (created_at DESC);

-- 4. Trigger for updated_at
CREATE TRIGGER update_restricted_zones_updated_at
  BEFORE UPDATE ON public.restricted_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
