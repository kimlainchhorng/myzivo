
-- ==========================================
-- Zivo Company Policies & Approval Workflow
-- ==========================================

-- 1. Company Policies
CREATE TABLE public.business_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  max_spend_per_ride_cents INTEGER,
  max_spend_per_day_cents INTEGER,
  max_spend_per_month_cents INTEGER,
  allow_rides BOOLEAN NOT NULL DEFAULT true,
  allow_eats BOOLEAN NOT NULL DEFAULT true,
  allow_delivery BOOLEAN NOT NULL DEFAULT true,
  allow_travel BOOLEAN NOT NULL DEFAULT false,
  allow_economy BOOLEAN NOT NULL DEFAULT true,
  allow_comfort BOOLEAN NOT NULL DEFAULT true,
  allow_premium BOOLEAN NOT NULL DEFAULT false,
  allow_suv BOOLEAN NOT NULL DEFAULT false,
  business_hours_only BOOLEAN NOT NULL DEFAULT false,
  business_hours_start TIME DEFAULT '08:00',
  business_hours_end TIME DEFAULT '18:00',
  allowed_cities TEXT[],
  airport_rides_allowed BOOLEAN NOT NULL DEFAULT true,
  restricted_zones TEXT[],
  approval_threshold_cents INTEGER DEFAULT 5000,
  require_approval_after_hours BOOLEAN NOT NULL DEFAULT true,
  require_approval_premium BOOLEAN NOT NULL DEFAULT true,
  require_approval_out_of_policy BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

ALTER TABLE public.business_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view their policies"
ON public.business_policies FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can manage policies"
ON public.business_policies FOR ALL TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 2. Approval Requests
CREATE TABLE public.business_approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  approver_id UUID,
  request_type TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  estimated_cost_cents INTEGER,
  description TEXT NOT NULL,
  pickup_location TEXT,
  dropoff_location TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.approval_status NOT NULL DEFAULT 'pending',
  approval_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view approval requests"
ON public.business_approval_requests FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business members can create approval requests"
ON public.business_approval_requests FOR INSERT TO authenticated
WITH CHECK (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

CREATE POLICY "Business owners can update approval requests"
ON public.business_approval_requests FOR UPDATE TO authenticated
USING (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()));

-- 3. Policy Audit Log
CREATE TABLE public.business_policy_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_policy_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view their policy audit logs"
ON public.business_policy_audit_log FOR SELECT TO authenticated
USING (
  business_id IN (SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid())
  OR business_id IN (SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid())
);

-- 4. Triggers
CREATE TRIGGER update_business_policies_updated_at
  BEFORE UPDATE ON public.business_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_approval_requests_updated_at
  BEFORE UPDATE ON public.business_approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Indexes
CREATE INDEX idx_business_policies_business_id ON public.business_policies(business_id);
CREATE INDEX idx_business_approval_requests_business_id ON public.business_approval_requests(business_id);
CREATE INDEX idx_business_approval_requests_status ON public.business_approval_requests(status);
CREATE INDEX idx_business_approval_requests_requester ON public.business_approval_requests(requester_id);
CREATE INDEX idx_business_policy_audit_log_business_id ON public.business_policy_audit_log(business_id);
;
