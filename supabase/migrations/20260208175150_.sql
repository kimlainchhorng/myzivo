-- Create applications table for tracking driver/merchant onboarding
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('driver', 'merchant')),
  applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected')),
  current_step INTEGER NOT NULL DEFAULT 1,
  checklist JSONB NOT NULL DEFAULT '{}',
  rejection_reason TEXT NULL,
  assigned_to UUID NULL REFERENCES auth.users(id),
  approved_by UUID NULL REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_applications_type_status_created ON public.applications (type, status, created_at DESC);
CREATE INDEX idx_applications_applicant ON public.applications (applicant_user_id);
CREATE INDEX idx_applications_assigned ON public.applications (assigned_to) WHERE assigned_to IS NOT NULL;

-- Create application_events table for audit trail
CREATE TABLE public.application_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'submitted', 'assigned', 'step_completed', 'approved', 'rejected', 'note')),
  meta JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_events_application ON public.application_events (application_id, created_at DESC);

-- Add onboarding columns to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS application_id UUID NULL REFERENCES public.applications(id),
ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS can_go_online BOOLEAN NOT NULL DEFAULT false;

-- Add onboarding columns to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS application_id UUID NULL REFERENCES public.applications(id),
ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'submitted', 'approved', 'rejected'));

-- Create trigger to update updated_at on applications
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_applications_updated_at();

-- Create trigger to enforce can_go_online for drivers
CREATE OR REPLACE FUNCTION public.check_driver_can_go_online()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
    IF NEW.can_go_online = false THEN
      RAISE EXCEPTION 'Driver onboarding not complete. Please complete your application first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_driver_onboarding
BEFORE UPDATE OF is_online ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.check_driver_can_go_online();

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications using user_roles table
CREATE POLICY "Admin can read all applications" ON public.applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin can insert applications" ON public.applications
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin can update applications" ON public.applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Applicants can view own applications" ON public.applications
FOR SELECT USING (applicant_user_id = auth.uid());

-- RLS policies for application_events
CREATE POLICY "Admin can read all application events" ON public.application_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin can insert application events" ON public.application_events
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Applicants can view own application events" ON public.application_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications 
    WHERE id = application_id AND applicant_user_id = auth.uid()
  )
);;
