
CREATE TABLE public.driver_hiring_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT,
  zone_id UUID REFERENCES public.regions(id),
  target_drivers INTEGER NOT NULL,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_hiring_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage hiring targets"
  ON public.driver_hiring_targets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE TRIGGER update_driver_hiring_targets_updated_at
  BEFORE UPDATE ON public.driver_hiring_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
