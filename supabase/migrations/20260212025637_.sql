
-- Trust & Safety Actions table
CREATE TABLE public.trust_safety_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('driver', 'customer', 'merchant')),
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'restriction', 'suspension', 're_verification')),
  reason TEXT NOT NULL,
  details TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  lifted_by UUID,
  lifted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trust_safety_actions_entity ON public.trust_safety_actions (entity_type, entity_id);
CREATE INDEX idx_trust_safety_actions_active ON public.trust_safety_actions (is_active) WHERE is_active = true;

ALTER TABLE public.trust_safety_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to trust_safety_actions"
  ON public.trust_safety_actions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support', 'operations')
    )
  );

-- Behavior Anomalies table
CREATE TABLE public.behavior_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('driver', 'customer', 'merchant')),
  entity_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('repeated_cancels', 'suspicious_orders', 'abnormal_login', 'unusual_location', 'payment_failures', 'rating_drop')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  meta JSONB,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_behavior_anomalies_entity ON public.behavior_anomalies (entity_type, entity_id);
CREATE INDEX idx_behavior_anomalies_unreviewed ON public.behavior_anomalies (is_reviewed) WHERE is_reviewed = false;

ALTER TABLE public.behavior_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to behavior_anomalies"
  ON public.behavior_anomalies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager', 'support', 'operations')
    )
  );
;
