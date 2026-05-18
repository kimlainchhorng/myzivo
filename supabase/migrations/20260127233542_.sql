-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create table to track pending profile changes that require admin approval
CREATE TABLE public.pending_profile_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'avatar', 'vehicle', 'document'
  change_data JSONB NOT NULL, -- stores the change details
  file_path TEXT, -- for avatar/document uploads
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add approval status to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS approval_status approval_status NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.pending_profile_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_profile_changes
-- Drivers can view their own pending changes
CREATE POLICY "Drivers can view own pending changes"
  ON public.pending_profile_changes
  FOR SELECT
  TO authenticated
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Drivers can insert their own pending changes
CREATE POLICY "Drivers can create pending changes"
  ON public.pending_profile_changes
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Admins can view all pending changes
CREATE POLICY "Admins can view all pending changes"
  ON public.pending_profile_changes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update pending changes (approve/reject)
CREATE POLICY "Admins can update pending changes"
  ON public.pending_profile_changes
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_pending_profile_changes_updated_at
  BEFORE UPDATE ON public.pending_profile_changes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_pending_changes_driver_id ON public.pending_profile_changes(driver_id);
CREATE INDEX idx_pending_changes_status ON public.pending_profile_changes(status);
CREATE INDEX idx_vehicles_approval_status ON public.vehicles(approval_status);;
