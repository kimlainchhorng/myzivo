-- Create system_incidents table for tracking platform issues
CREATE TABLE public.system_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  affects_dispatch BOOLEAN NOT NULL DEFAULT false,
  affected_zones TEXT[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;

-- Drivers can read active incidents
CREATE POLICY "Drivers can view active incidents"
ON public.system_incidents
FOR SELECT
USING (resolved_at IS NULL);

-- Admins can manage incidents
CREATE POLICY "Admins can manage incidents"
ON public.system_incidents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Index for efficient querying of active incidents
CREATE INDEX idx_system_incidents_active ON public.system_incidents (resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_system_incidents_severity ON public.system_incidents (severity) WHERE resolved_at IS NULL;;
