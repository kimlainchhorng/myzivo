
-- ============================================================
-- US Launch Phase 2: City Rollout Operations
-- ============================================================

-- 1) city_onboarding
CREATE TABLE public.city_onboarding (
  city_id uuid PRIMARY KEY REFERENCES public.regions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned',
  target_launch_date date,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_city_onboarding_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('planned','setup','testing','live','paused') THEN
    RAISE EXCEPTION 'Invalid city_onboarding status: %', NEW.status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_city_onboarding_validate
  BEFORE INSERT OR UPDATE ON public.city_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_onboarding_status();

ALTER TABLE public.city_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_onboarding"
  ON public.city_onboarding FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) airports
CREATE TABLE public.airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  geo_polygon jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_airports_city ON public.airports(city_id);

ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active airports"
  ON public.airports FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access on airports"
  ON public.airports FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3) airport_fee_rules
CREATE TABLE public.airport_fee_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid NOT NULL REFERENCES public.airports(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  fee_type text NOT NULL,
  fee_value numeric NOT NULL DEFAULT 0,
  apply_when text NOT NULL DEFAULT 'pickup',
  is_active boolean NOT NULL DEFAULT true
);

CREATE OR REPLACE FUNCTION public.validate_airport_fee_rule()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_type NOT IN ('ride','delivery') THEN
    RAISE EXCEPTION 'Invalid service_type: %', NEW.service_type;
  END IF;
  IF NEW.fee_type NOT IN ('flat','percent') THEN
    RAISE EXCEPTION 'Invalid fee_type: %', NEW.fee_type;
  END IF;
  IF NEW.apply_when NOT IN ('pickup','dropoff','both') THEN
    RAISE EXCEPTION 'Invalid apply_when: %', NEW.apply_when;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_airport_fee_rule_validate
  BEFORE INSERT OR UPDATE ON public.airport_fee_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_airport_fee_rule();

CREATE INDEX idx_airport_fee_rules_airport ON public.airport_fee_rules(airport_id);

ALTER TABLE public.airport_fee_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active airport fee rules"
  ON public.airport_fee_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access on airport_fee_rules"
  ON public.airport_fee_rules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4) state_regulatory_rules
CREATE TABLE public.state_regulatory_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES public.us_states(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  details jsonb,
  is_active boolean NOT NULL DEFAULT true
);

CREATE OR REPLACE FUNCTION public.validate_regulatory_rule_type()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.rule_type NOT IN ('driver','vehicle','insurance','tax','other') THEN
    RAISE EXCEPTION 'Invalid rule_type: %', NEW.rule_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_regulatory_rule_validate
  BEFORE INSERT OR UPDATE ON public.state_regulatory_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_regulatory_rule_type();

CREATE INDEX idx_state_regulatory_rules_state ON public.state_regulatory_rules(state_id);

ALTER TABLE public.state_regulatory_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on state_regulatory_rules"
  ON public.state_regulatory_rules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5) city_required_driver_documents
CREATE TABLE public.city_required_driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  expires boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_city_req_docs_city ON public.city_required_driver_documents(city_id);

ALTER TABLE public.city_required_driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active city required docs"
  ON public.city_required_driver_documents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access on city_required_driver_documents"
  ON public.city_required_driver_documents FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6) city_surge_rules
CREATE TABLE public.city_surge_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.service_zones(id) ON DELETE SET NULL,
  enabled boolean NOT NULL DEFAULT true,
  min_multiplier numeric NOT NULL DEFAULT 1.0,
  max_multiplier numeric NOT NULL DEFAULT 2.5,
  day_of_week int,
  start_time time,
  end_time time,
  note text
);

CREATE INDEX idx_city_surge_rules_city ON public.city_surge_rules(city_id);

ALTER TABLE public.city_surge_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_surge_rules"
  ON public.city_surge_rules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7) fare_breakdowns
CREATE TABLE public.fare_breakdowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type text NOT NULL,
  object_id uuid NOT NULL,
  city_id uuid NOT NULL,
  zone_id uuid,
  currency text NOT NULL DEFAULT 'USD',
  base_amount numeric NOT NULL DEFAULT 0,
  distance_amount numeric NOT NULL DEFAULT 0,
  time_amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  fee_amount numeric NOT NULL DEFAULT 0,
  surge_multiplier numeric NOT NULL DEFAULT 1.0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_fare_breakdown_type()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.object_type NOT IN ('trip','delivery','food_order') THEN
    RAISE EXCEPTION 'Invalid object_type: %', NEW.object_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fare_breakdown_validate
  BEFORE INSERT OR UPDATE ON public.fare_breakdowns
  FOR EACH ROW EXECUTE FUNCTION public.validate_fare_breakdown_type();

CREATE INDEX idx_fare_breakdowns_object ON public.fare_breakdowns(object_type, object_id);
CREATE INDEX idx_fare_breakdowns_city ON public.fare_breakdowns(city_id);

ALTER TABLE public.fare_breakdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read all fare breakdowns"
  ON public.fare_breakdowns FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated read own fare breakdowns"
  ON public.fare_breakdowns FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 8) cancellation_fee_rules
CREATE TABLE public.cancellation_fee_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  free_cancel_window_minutes int NOT NULL DEFAULT 2,
  fee_type text NOT NULL,
  fee_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE OR REPLACE FUNCTION public.validate_cancellation_fee_rule()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_type NOT IN ('ride','delivery','eats') THEN
    RAISE EXCEPTION 'Invalid service_type: %', NEW.service_type;
  END IF;
  IF NEW.fee_type NOT IN ('flat','percent') THEN
    RAISE EXCEPTION 'Invalid fee_type: %', NEW.fee_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cancellation_fee_validate
  BEFORE INSERT OR UPDATE ON public.cancellation_fee_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_cancellation_fee_rule();

CREATE INDEX idx_cancellation_fee_rules_city ON public.cancellation_fee_rules(city_id);

ALTER TABLE public.cancellation_fee_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on cancellation_fee_rules"
  ON public.cancellation_fee_rules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ── Update get_pricing_for_trip to v2 ──
CREATE OR REPLACE FUNCTION public.get_pricing_for_trip(
  p_city_id uuid,
  p_zone_id uuid DEFAULT NULL,
  p_service_type text DEFAULT 'ride',
  p_timestamp timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pricing_profile jsonb;
  v_taxes jsonb;
  v_fees jsonb;
  v_airport_fees jsonb;
  v_cancellation jsonb;
  v_state_id uuid;
  v_profile_id uuid;
BEGIN
  -- Resolve state from city_settings
  SELECT cs.state_id INTO v_state_id
  FROM city_settings cs WHERE cs.city_id = p_city_id;

  -- Find pricing assignment (zone-specific first, then city-level)
  SELECT pa.pricing_profile_id INTO v_profile_id
  FROM pricing_assignments pa
  WHERE pa.city_id = p_city_id
    AND pa.service_type = p_service_type
    AND pa.is_active = true
    AND (pa.zone_id = p_zone_id OR pa.zone_id IS NULL)
  ORDER BY pa.zone_id NULLS LAST
  LIMIT 1;

  -- Get pricing profile
  IF v_profile_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', pp.id, 'name', pp.name, 'base_fee', pp.base_fee,
      'per_mile', pp.per_mile, 'per_minute', pp.per_minute,
      'minimum_fare', pp.minimum_fare, 'platform_fee_percent', pp.platform_fee_percent
    ) INTO v_pricing_profile
    FROM pricing_profiles pp WHERE pp.id = v_profile_id AND pp.is_active = true;
  END IF;

  -- Collect taxes (cascading: national -> state -> city)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'tax_name', tr.tax_name, 'tax_rate_percent', tr.tax_rate_percent,
    'flat_fee', tr.flat_fee, 'included_in_price', tr.included_in_price
  )), '[]'::jsonb) INTO v_taxes
  FROM tax_rules tr
  WHERE tr.is_active = true
    AND tr.service_type = p_service_type
    AND (
      (tr.scope = 'national')
      OR (tr.scope = 'state' AND tr.state_id = v_state_id)
      OR (tr.scope = 'city' AND tr.city_id = p_city_id)
    );

  -- Collect fees (cascading: national -> state -> city -> zone)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'fee_name', fr.fee_name, 'fee_type', fr.fee_type, 'fee_value', fr.fee_value
  )), '[]'::jsonb) INTO v_fees
  FROM fee_rules fr
  WHERE fr.is_active = true
    AND fr.service_type = p_service_type
    AND (
      (fr.scope = 'national')
      OR (fr.scope = 'state' AND fr.state_id = v_state_id)
      OR (fr.scope = 'city' AND fr.city_id = p_city_id)
      OR (fr.scope = 'zone' AND fr.zone_id = p_zone_id)
    );

  -- Collect airport fees for the city
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'airport_name', a.name, 'airport_code', a.code,
    'fee_type', afr.fee_type, 'fee_value', afr.fee_value,
    'apply_when', afr.apply_when
  )), '[]'::jsonb) INTO v_airport_fees
  FROM airport_fee_rules afr
  JOIN airports a ON a.id = afr.airport_id
  WHERE a.city_id = p_city_id
    AND a.is_active = true
    AND afr.is_active = true
    AND afr.service_type = p_service_type;

  -- Get cancellation policy
  SELECT jsonb_build_object(
    'free_cancel_window_minutes', cfr.free_cancel_window_minutes,
    'fee_type', cfr.fee_type, 'fee_value', cfr.fee_value
  ) INTO v_cancellation
  FROM cancellation_fee_rules cfr
  WHERE cfr.city_id = p_city_id
    AND cfr.service_type = p_service_type
    AND cfr.is_active = true
  LIMIT 1;

  RETURN jsonb_build_object(
    'pricing_profile', COALESCE(v_pricing_profile, 'null'::jsonb),
    'taxes', COALESCE(v_taxes, '[]'::jsonb),
    'fees', COALESCE(v_fees, '[]'::jsonb),
    'airport_fees', COALESCE(v_airport_fees, '[]'::jsonb),
    'cancellation_policy', COALESCE(v_cancellation, 'null'::jsonb)
  );
END;
$$;
;
