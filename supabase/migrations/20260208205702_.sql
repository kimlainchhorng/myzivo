-- ============================================
-- COMPLIANCE POLICY ENGINE
-- ============================================

-- 1. Create compliance_policies table
CREATE TABLE IF NOT EXISTS public.compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('driver', 'merchant')),
  state TEXT NULL,  -- NULL = all states
  vehicle_type TEXT NULL,  -- NULL = all vehicle types (drivers only)
  document_type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  expires_required BOOLEAN NOT NULL DEFAULT false,
  reminder_days INT[] NOT NULL DEFAULT '{30,14,7,1}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate policies
  CONSTRAINT compliance_policies_unique UNIQUE (role, state, vehicle_type, document_type)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_compliance_policies_role_active ON public.compliance_policies(role, is_active);
CREATE INDEX IF NOT EXISTS idx_compliance_policies_lookup ON public.compliance_policies(role, state, vehicle_type, is_active);

-- 2. Create compliance_requirements_cache table for performance
CREATE TABLE IF NOT EXISTS public.compliance_requirements_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('driver', 'merchant')),
  entity_id UUID NOT NULL,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  missing_documents TEXT[] NOT NULL DEFAULT '{}',
  expired_documents TEXT[] NOT NULL DEFAULT '{}',
  pending_documents TEXT[] NOT NULL DEFAULT '{}',
  rejected_documents TEXT[] NOT NULL DEFAULT '{}',
  compliance_score INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT compliance_requirements_cache_unique UNIQUE (entity_type, entity_id)
);

-- Create index for entity lookup
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_cache_entity ON public.compliance_requirements_cache(entity_type, entity_id);

-- 3. Enable RLS
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_requirements_cache ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Admin only for policies table (using user_roles table)
CREATE POLICY "Admins can view compliance policies"
  ON public.compliance_policies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert compliance policies"
  ON public.compliance_policies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update compliance policies"
  ON public.compliance_policies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete compliance policies"
  ON public.compliance_policies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 5. RLS Policies - Admin only for cache table
CREATE POLICY "Admins can view compliance requirements cache"
  ON public.compliance_requirements_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage compliance requirements cache"
  ON public.compliance_requirements_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 6. Seed default policies (matching current hardcoded requirements)

-- Driver default policies
INSERT INTO public.compliance_policies (role, state, vehicle_type, document_type, required, expires_required, notes)
VALUES 
  ('driver', NULL, NULL, 'driver_license', true, true, 'All drivers must have a valid driver license'),
  ('driver', NULL, NULL, 'insurance', true, true, 'All drivers must have vehicle insurance'),
  ('driver', NULL, NULL, 'vehicle_registration', true, true, 'All drivers must have vehicle registration')
ON CONFLICT (role, state, vehicle_type, document_type) DO NOTHING;

-- Merchant default policies
INSERT INTO public.compliance_policies (role, state, vehicle_type, document_type, required, expires_required, notes)
VALUES 
  ('merchant', NULL, NULL, 'business_license', true, true, 'All merchants must have a valid business license'),
  ('merchant', NULL, NULL, 'food_permit', true, true, 'All merchants must have a food handler permit')
ON CONFLICT (role, state, vehicle_type, document_type) DO NOTHING;

-- 7. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_compliance_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_compliance_policies_updated_at ON public.compliance_policies;
CREATE TRIGGER trg_compliance_policies_updated_at
  BEFORE UPDATE ON public.compliance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_compliance_policies_updated_at();

-- 8. Register automation job for compliance computation (optional daily recompute)
INSERT INTO public.automation_jobs (
  slug,
  name,
  description,
  job_type,
  cron_expression,
  is_enabled,
  config
) VALUES (
  'compliance-recompute',
  'Compliance Recompute',
  'Recompute compliance status for all entities based on policy engine',
  'compliance_recompute',
  '0 3 * * *',
  true,
  '{"batch_size": 100}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;;
