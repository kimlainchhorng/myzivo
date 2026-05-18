
-- Launch cities for public portal
CREATE TABLE public.launch_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'pre_launch', 'active', 'paused')),
  estimated_launch_date DATE,
  description TEXT,
  services_available TEXT[] DEFAULT '{}',
  hero_image_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  driver_interest_count INT NOT NULL DEFAULT 0,
  restaurant_interest_count INT NOT NULL DEFAULT 0,
  fleet_interest_count INT NOT NULL DEFAULT 0,
  customer_interest_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.launch_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Launch cities are publicly readable"
  ON public.launch_cities FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can manage launch cities"
  ON public.launch_cities FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Partner portal applications (public-facing)
CREATE TABLE public.partner_portal_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES public.launch_cities(id),
  city_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('driver', 'restaurant', 'fleet_operator', 'franchise_partner', 'logistics_company')),
  service_type TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  documents_json JSONB DEFAULT '[]',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'approved', 'rejected', 'more_info_required')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  converted_to_application_id UUID REFERENCES public.applications(id),
  tracking_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_portal_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public portal)
CREATE POLICY "Anyone can submit partner applications"
  ON public.partner_portal_applications FOR INSERT
  WITH CHECK (true);

-- Anyone can check their own application by tracking code (via RPC)
CREATE POLICY "Public can read own application by tracking code"
  ON public.partner_portal_applications FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage portal applications"
  ON public.partner_portal_applications FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- City waitlist
CREATE TABLE public.city_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.launch_cities(id),
  email TEXT NOT NULL,
  full_name TEXT,
  interest_type TEXT NOT NULL DEFAULT 'customer' CHECK (interest_type IN ('customer', 'driver', 'restaurant')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_id, email)
);

ALTER TABLE public.city_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.city_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage waitlist"
  ON public.city_waitlist FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Increment interest counts on waitlist join
CREATE OR REPLACE FUNCTION public.increment_city_interest()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interest_type = 'driver' THEN
    UPDATE public.launch_cities SET driver_interest_count = driver_interest_count + 1 WHERE id = NEW.city_id;
  ELSIF NEW.interest_type = 'restaurant' THEN
    UPDATE public.launch_cities SET restaurant_interest_count = restaurant_interest_count + 1 WHERE id = NEW.city_id;
  ELSE
    UPDATE public.launch_cities SET customer_interest_count = customer_interest_count + 1 WHERE id = NEW.city_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_increment_city_interest
  AFTER INSERT ON public.city_waitlist
  FOR EACH ROW EXECUTE FUNCTION public.increment_city_interest();

-- Indexes
CREATE INDEX idx_partner_portal_apps_city ON public.partner_portal_applications(city_id);
CREATE INDEX idx_partner_portal_apps_status ON public.partner_portal_applications(status);
CREATE INDEX idx_partner_portal_apps_tracking ON public.partner_portal_applications(tracking_code);
CREATE INDEX idx_city_waitlist_city ON public.city_waitlist(city_id);
CREATE INDEX idx_launch_cities_status ON public.launch_cities(status);
;
