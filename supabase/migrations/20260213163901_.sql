
-- ============================================================
-- US 50-State Launch Readiness System
-- ============================================================

-- 1. us_states
CREATE TABLE public.us_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL DEFAULT 'US',
  state_code text NOT NULL UNIQUE,
  state_name text NOT NULL,
  timezone_default text,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.us_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active states" ON public.us_states
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins full access us_states" ON public.us_states
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 2. city_settings
CREATE TABLE public.city_settings (
  city_id uuid PRIMARY KEY REFERENCES public.regions(id) ON DELETE CASCADE,
  state_id uuid REFERENCES public.us_states(id),
  services_enabled jsonb DEFAULT '{}',
  minimum_driver_supply int NOT NULL DEFAULT 20,
  surge_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.city_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read city_settings" ON public.city_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins full access city_settings" ON public.city_settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 3. service_availability_rules
CREATE TABLE public.service_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.service_zones(id) ON DELETE SET NULL,
  service_type text NOT NULL,
  day_of_week int,
  start_time time,
  end_time time,
  enabled boolean NOT NULL DEFAULT true,
  note text
);
ALTER TABLE public.service_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled rules" ON public.service_availability_rules
  FOR SELECT USING (enabled = true);

CREATE POLICY "Admins full access availability_rules" ON public.service_availability_rules
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 4. pricing_profiles
CREATE TABLE public.pricing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  service_type text NOT NULL,
  base_fee numeric NOT NULL DEFAULT 0,
  per_mile numeric NOT NULL DEFAULT 0,
  per_minute numeric NOT NULL DEFAULT 0,
  minimum_fare numeric NOT NULL DEFAULT 0,
  platform_fee_percent numeric NOT NULL DEFAULT 0,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.pricing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access pricing_profiles" ON public.pricing_profiles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 5. pricing_assignments
CREATE TABLE public.pricing_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.service_zones(id) ON DELETE SET NULL,
  service_type text NOT NULL,
  pricing_profile_id uuid NOT NULL REFERENCES public.pricing_profiles(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.pricing_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access pricing_assignments" ON public.pricing_assignments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 6. tax_rules
CREATE TABLE public.tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'national',
  state_id uuid REFERENCES public.us_states(id),
  city_id uuid REFERENCES public.regions(id),
  service_type text NOT NULL,
  tax_name text NOT NULL,
  tax_rate_percent numeric NOT NULL DEFAULT 0,
  flat_fee numeric NOT NULL DEFAULT 0,
  included_in_price boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access tax_rules" ON public.tax_rules
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 7. fee_rules
CREATE TABLE public.fee_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'national',
  state_id uuid REFERENCES public.us_states(id),
  city_id uuid REFERENCES public.regions(id),
  zone_id uuid REFERENCES public.service_zones(id),
  service_type text NOT NULL,
  fee_name text NOT NULL,
  fee_type text NOT NULL DEFAULT 'flat',
  fee_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.fee_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access fee_rules" ON public.fee_rules
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 8. driver_requirements
CREATE TABLE public.driver_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES public.us_states(id) ON DELETE CASCADE,
  requires_background_check boolean NOT NULL DEFAULT true,
  requires_vehicle_inspection boolean NOT NULL DEFAULT true,
  min_driver_age int NOT NULL DEFAULT 21,
  required_documents jsonb DEFAULT '[]'
);
ALTER TABLE public.driver_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access driver_requirements" ON public.driver_requirements
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 9. driver_document_status
CREATE TABLE public.driver_document_status (
  driver_user_id uuid NOT NULL,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at date,
  reviewed_by uuid,
  reviewed_at timestamptz,
  PRIMARY KEY (driver_user_id, document_type)
);
ALTER TABLE public.driver_document_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers view own docs" ON public.driver_document_status
  FOR SELECT TO authenticated USING (auth.uid() = driver_user_id);

CREATE POLICY "Admins full access driver_document_status" ON public.driver_document_status
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 10. launch_compliance_checklist
CREATE TABLE public.launch_compliance_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid REFERENCES public.us_states(id),
  city_id uuid REFERENCES public.regions(id),
  item text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_compliance_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access compliance_checklist" ON public.launch_compliance_checklist
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ============================================================
-- RPC: get_pricing_for_trip
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_pricing_for_trip(
  p_city_id uuid,
  p_zone_id uuid,
  p_service_type text,
  p_timestamp timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pricing jsonb;
  v_profile_id uuid;
  v_state_id uuid;
  v_taxes jsonb;
  v_fees jsonb;
BEGIN
  SELECT cs.state_id INTO v_state_id
  FROM city_settings cs WHERE cs.city_id = p_city_id;

  SELECT pa.pricing_profile_id INTO v_profile_id
  FROM pricing_assignments pa
  WHERE pa.is_active = true
    AND pa.service_type = p_service_type
    AND pa.city_id = p_city_id
    AND (pa.zone_id = p_zone_id OR pa.zone_id IS NULL)
  ORDER BY pa.zone_id NULLS LAST
  LIMIT 1;

  SELECT jsonb_build_object(
    'id', pp.id, 'name', pp.name, 'base_fee', pp.base_fee,
    'per_mile', pp.per_mile, 'per_minute', pp.per_minute,
    'minimum_fare', pp.minimum_fare, 'platform_fee_percent', pp.platform_fee_percent
  ) INTO v_pricing
  FROM pricing_profiles pp
  WHERE pp.id = v_profile_id AND pp.is_active = true;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'tax_name', tr.tax_name, 'tax_rate_percent', tr.tax_rate_percent,
    'flat_fee', tr.flat_fee, 'included_in_price', tr.included_in_price
  )), '[]'::jsonb) INTO v_taxes
  FROM tax_rules tr
  WHERE tr.is_active = true
    AND tr.service_type = p_service_type
    AND (
      (tr.scope = 'national') OR
      (tr.scope = 'state' AND tr.state_id = v_state_id) OR
      (tr.scope = 'city' AND tr.city_id = p_city_id)
    );

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'fee_name', fr.fee_name, 'fee_type', fr.fee_type, 'fee_value', fr.fee_value
  )), '[]'::jsonb) INTO v_fees
  FROM fee_rules fr
  WHERE fr.is_active = true
    AND fr.service_type = p_service_type
    AND (
      (fr.scope = 'national') OR
      (fr.scope = 'state' AND fr.state_id = v_state_id) OR
      (fr.scope = 'city' AND fr.city_id = p_city_id) OR
      (fr.scope = 'zone' AND fr.zone_id = p_zone_id)
    );

  RETURN jsonb_build_object(
    'pricing_profile', COALESCE(v_pricing, '{}'::jsonb),
    'taxes', v_taxes,
    'fees', v_fees
  );
END;
$$;

-- ============================================================
-- Seed all 50 US states
-- ============================================================
INSERT INTO public.us_states (state_code, state_name, timezone_default) VALUES
('AL','Alabama','America/Chicago'),
('AK','Alaska','America/Anchorage'),
('AZ','Arizona','America/Phoenix'),
('AR','Arkansas','America/Chicago'),
('CA','California','America/Los_Angeles'),
('CO','Colorado','America/Denver'),
('CT','Connecticut','America/New_York'),
('DE','Delaware','America/New_York'),
('FL','Florida','America/New_York'),
('GA','Georgia','America/New_York'),
('HI','Hawaii','Pacific/Honolulu'),
('ID','Idaho','America/Boise'),
('IL','Illinois','America/Chicago'),
('IN','Indiana','America/Indiana/Indianapolis'),
('IA','Iowa','America/Chicago'),
('KS','Kansas','America/Chicago'),
('KY','Kentucky','America/New_York'),
('LA','Louisiana','America/Chicago'),
('ME','Maine','America/New_York'),
('MD','Maryland','America/New_York'),
('MA','Massachusetts','America/New_York'),
('MI','Michigan','America/Detroit'),
('MN','Minnesota','America/Chicago'),
('MS','Mississippi','America/Chicago'),
('MO','Missouri','America/Chicago'),
('MT','Montana','America/Denver'),
('NE','Nebraska','America/Chicago'),
('NV','Nevada','America/Los_Angeles'),
('NH','New Hampshire','America/New_York'),
('NJ','New Jersey','America/New_York'),
('NM','New Mexico','America/Denver'),
('NY','New York','America/New_York'),
('NC','North Carolina','America/New_York'),
('ND','North Dakota','America/Chicago'),
('OH','Ohio','America/New_York'),
('OK','Oklahoma','America/Chicago'),
('OR','Oregon','America/Los_Angeles'),
('PA','Pennsylvania','America/New_York'),
('RI','Rhode Island','America/New_York'),
('SC','South Carolina','America/New_York'),
('SD','South Dakota','America/Chicago'),
('TN','Tennessee','America/Chicago'),
('TX','Texas','America/Chicago'),
('UT','Utah','America/Denver'),
('VT','Vermont','America/New_York'),
('VA','Virginia','America/New_York'),
('WA','Washington','America/Los_Angeles'),
('WV','West Virginia','America/New_York'),
('WI','Wisconsin','America/Chicago'),
('WY','Wyoming','America/Denver');

-- Indexes
CREATE INDEX idx_city_settings_state ON public.city_settings(state_id);
CREATE INDEX idx_service_avail_city ON public.service_availability_rules(city_id);
CREATE INDEX idx_pricing_assign_city ON public.pricing_assignments(city_id, service_type);
CREATE INDEX idx_tax_rules_scope ON public.tax_rules(scope, service_type);
CREATE INDEX idx_fee_rules_scope ON public.fee_rules(scope, service_type);
CREATE INDEX idx_driver_req_state ON public.driver_requirements(state_id);
CREATE INDEX idx_compliance_state ON public.launch_compliance_checklist(state_id);
;
