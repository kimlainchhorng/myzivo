
-- Create maintenance_mode table (single-row config)
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT false,
  message text,
  affected_services text[] DEFAULT '{}',
  enabled_by uuid REFERENCES auth.users(id),
  enabled_at timestamptz,
  disabled_by uuid REFERENCES auth.users(id),
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create maintenance_history table
CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  message text,
  affected_services text[] DEFAULT '{}',
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz NOT NULL DEFAULT now(),
  duration_minutes int
);

-- Seed single config row
INSERT INTO public.maintenance_mode (enabled) VALUES (false);

-- Enable RLS
ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

-- RLS: All admin roles can SELECT both tables
CREATE POLICY "Admins can view maintenance_mode"
  ON public.maintenance_mode FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'support')
    )
  );

CREATE POLICY "Admins can view maintenance_history"
  ON public.maintenance_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'support')
    )
  );

-- RLS: Owner/admin/manager can UPDATE maintenance_mode
CREATE POLICY "Managers can update maintenance_mode"
  ON public.maintenance_mode FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- RLS: Owner/admin/manager can INSERT into maintenance_history
CREATE POLICY "Managers can insert maintenance_history"
  ON public.maintenance_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_maintenance_mode_updated_at
  BEFORE UPDATE ON public.maintenance_mode
  FOR EACH ROW
  EXECUTE FUNCTION public.set_maintenance_updated_at();
;
