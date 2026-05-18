
-- Special fees table for conditional surcharges
CREATE TABLE public.special_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('flat', 'percent')),
  amount NUMERIC NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('airport', 'late_night', 'long_distance', 'peak_hour', 'holiday', 'custom')),
  condition_config JSONB NOT NULL DEFAULT '{}',
  service_types TEXT[] NOT NULL DEFAULT '{ride,delivery}',
  zone_id UUID REFERENCES public.pricing_zones(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.special_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage special_fees" ON public.special_fees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role IS NOT NULL)
  );

CREATE POLICY "Authenticated users can read active special_fees" ON public.special_fees
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Pricing config change history
CREATE TABLE public.pricing_config_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_table TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_config_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing_config_history" ON public.pricing_config_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role IS NOT NULL)
  );

-- Trigger for special_fees updated_at
CREATE TRIGGER update_special_fees_updated_at
  BEFORE UPDATE ON public.special_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
