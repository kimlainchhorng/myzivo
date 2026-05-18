
-- Create time_based_pricing_rules table
CREATE TABLE public.time_based_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  days_of_week integer[] DEFAULT '{0,1,2,3,4,5,6}',
  start_hour integer NOT NULL DEFAULT 0,
  end_hour integer NOT NULL DEFAULT 23,
  multiplier numeric NOT NULL DEFAULT 1.0,
  flat_adjustment numeric DEFAULT 0,
  zone_id uuid REFERENCES public.pricing_zones(id),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_based_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (authenticated users with admin role via user_roles)
CREATE POLICY "Admins can view time_based_pricing_rules"
ON public.time_based_pricing_rules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Admins can insert time_based_pricing_rules"
ON public.time_based_pricing_rules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update time_based_pricing_rules"
ON public.time_based_pricing_rules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can delete time_based_pricing_rules"
ON public.time_based_pricing_rules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

-- Updated_at trigger
CREATE TRIGGER update_time_based_pricing_rules_updated_at
BEFORE UPDATE ON public.time_based_pricing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
;
