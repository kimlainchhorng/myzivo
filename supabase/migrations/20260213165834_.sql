
-- ============================================================
-- Automated City Launch Toolkit
-- ============================================================

-- 1) city_launches — master record per city launch
CREATE TABLE public.city_launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned',
  target_launch_date date,
  actual_launch_date date,
  readiness_score numeric NOT NULL DEFAULT 0,
  driver_readiness numeric NOT NULL DEFAULT 0,
  demand_readiness numeric NOT NULL DEFAULT 0,
  operational_readiness numeric NOT NULL DEFAULT 0,
  target_drivers int NOT NULL DEFAULT 50,
  current_drivers int NOT NULL DEFAULT 0,
  approved_drivers int NOT NULL DEFAULT 0,
  active_drivers int NOT NULL DEFAULT 0,
  target_restaurants int NOT NULL DEFAULT 20,
  current_restaurants int NOT NULL DEFAULT 0,
  pricing_configured boolean NOT NULL DEFAULT false,
  surge_configured boolean NOT NULL DEFAULT false,
  services_enabled text[] NOT NULL DEFAULT '{}',
  marketing_status text NOT NULL DEFAULT 'not_started',
  notes text,
  launched_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city_id)
);

CREATE OR REPLACE FUNCTION public.validate_city_launch_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('planned','setup','recruiting','soft_launch','live','paused','cancelled') THEN
    RAISE EXCEPTION 'Invalid city launch status: %', NEW.status;
  END IF;
  IF NEW.marketing_status NOT IN ('not_started','preparing','scheduled','active','completed') THEN
    RAISE EXCEPTION 'Invalid marketing_status: %', NEW.marketing_status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_city_launch_validate
  BEFORE INSERT OR UPDATE ON public.city_launches
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_launch_status();

CREATE INDEX idx_city_launches_city ON public.city_launches(city_id);
CREATE INDEX idx_city_launches_status ON public.city_launches(status);

ALTER TABLE public.city_launches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_launches"
  ON public.city_launches FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) city_launch_checklist — checklist items per launch
CREATE TABLE public.city_launch_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.city_launches(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid,
  sort_order int NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_launch_checklist_category()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category NOT IN ('recruitment','onboarding','restaurants','pricing','marketing','operations','general') THEN
    RAISE EXCEPTION 'Invalid checklist category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_launch_checklist_validate
  BEFORE INSERT OR UPDATE ON public.city_launch_checklist
  FOR EACH ROW EXECUTE FUNCTION public.validate_launch_checklist_category();

CREATE INDEX idx_launch_checklist_launch ON public.city_launch_checklist(launch_id);

ALTER TABLE public.city_launch_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_launch_checklist"
  ON public.city_launch_checklist FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3) city_launch_templates — reusable templates for marketing, recruitment, etc.
CREATE TABLE public.city_launch_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_launch_template_type()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.template_type NOT IN ('social_media','announcement','promo_campaign','referral_offer','recruitment_campaign','referral_bonus','onboarding_guide') THEN
    RAISE EXCEPTION 'Invalid template_type: %', NEW.template_type;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_launch_template_validate
  BEFORE INSERT OR UPDATE ON public.city_launch_templates
  FOR EACH ROW EXECUTE FUNCTION public.validate_launch_template_type();

ALTER TABLE public.city_launch_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on city_launch_templates"
  ON public.city_launch_templates FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seed default checklist template items (will be cloned per launch)
-- We'll handle this in the app layer instead to keep migration clean

-- Function to auto-create checklist items when a new launch is created
CREATE OR REPLACE FUNCTION public.seed_launch_checklist()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.city_launch_checklist (launch_id, category, title, description, sort_order, is_required) VALUES
    (NEW.id, 'recruitment', 'Start driver recruitment campaign', 'Begin recruiting drivers in the target city.', 1, true),
    (NEW.id, 'recruitment', 'Reach minimum driver target', 'Ensure enough drivers are signed up before launch.', 2, true),
    (NEW.id, 'recruitment', 'Configure referral bonuses', 'Set up referral bonus structure for the city.', 3, false),
    (NEW.id, 'onboarding', 'Driver onboarding guides published', 'Ensure all training materials are available.', 4, true),
    (NEW.id, 'onboarding', 'Drivers approved and active', 'Complete background checks and activation.', 5, true),
    (NEW.id, 'restaurants', 'Restaurant partners onboarded', 'Onboard target number of restaurant partners.', 6, true),
    (NEW.id, 'restaurants', 'Restaurant menus configured', 'Verify all menus and prices are correct.', 7, true),
    (NEW.id, 'pricing', 'Pricing template applied', 'Apply base pricing for rides and delivery.', 8, true),
    (NEW.id, 'pricing', 'Surge rules configured', 'Set up surge pricing parameters.', 9, true),
    (NEW.id, 'pricing', 'Commission rates set', 'Configure commission rates for all services.', 10, true),
    (NEW.id, 'marketing', 'Social media campaign prepared', 'Create launch announcement materials.', 11, true),
    (NEW.id, 'marketing', 'Launch promotions configured', 'Set up launch day promotions and discounts.', 12, true),
    (NEW.id, 'marketing', 'Marketing campaign scheduled', 'Schedule email and push notification campaigns.', 13, false),
    (NEW.id, 'operations', 'Support team briefed', 'Brief support staff on new city operations.', 14, true),
    (NEW.id, 'operations', 'Service zones configured', 'Define delivery and service zone boundaries.', 15, true),
    (NEW.id, 'operations', 'Services enabled', 'Enable Ride, Eats, and/or Delivery services.', 16, true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seed_launch_checklist
  AFTER INSERT ON public.city_launches
  FOR EACH ROW EXECUTE FUNCTION public.seed_launch_checklist();
;
