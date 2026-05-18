
-- Create reward_rules table
CREATE TABLE public.reward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_value NUMERIC NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value NUMERIC NOT NULL,
  reward_meta JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  max_issuances INTEGER,
  current_issuances INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reward_rules"
  ON public.reward_rules
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create reward_issuances table
CREATE TABLE public.reward_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.reward_rules(id),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'issued',
  issued_at TIMESTAMPTZ DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_issuances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reward_issuances"
  ON public.reward_issuances
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on reward_rules
CREATE TRIGGER update_reward_rules_updated_at
  BEFORE UPDATE ON public.reward_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
