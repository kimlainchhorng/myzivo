-- Add onboarding tracking columns to drivers table
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS application_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add onboarding_status if not exists (it may already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'drivers' 
    AND column_name = 'onboarding_status'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN onboarding_status TEXT DEFAULT 'incomplete';
  END IF;
END $$;

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_drivers_onboarding_status ON public.drivers(onboarding_status);

-- Update existing drivers: if is_verified=true, set onboarding_status to 'approved'
UPDATE public.drivers 
SET onboarding_status = 'approved', onboarding_step = 4 
WHERE is_verified = true AND onboarding_status IS NULL;

-- Update existing drivers: if status='pending', set onboarding_status to 'pending_review' if they have documents
UPDATE public.drivers d
SET onboarding_status = 'pending_review', onboarding_step = 4
WHERE d.status = 'pending' 
  AND d.is_verified = false 
  AND d.onboarding_status IS NULL
  AND EXISTS (SELECT 1 FROM public.driver_documents dd WHERE dd.driver_id = d.id);

-- For remaining null onboarding_status, set to 'incomplete'
UPDATE public.drivers 
SET onboarding_status = 'incomplete' 
WHERE onboarding_status IS NULL;;
