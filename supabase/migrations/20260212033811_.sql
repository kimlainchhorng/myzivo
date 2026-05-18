
-- Add resubmission columns to driver_documents
ALTER TABLE public.driver_documents
  ADD COLUMN IF NOT EXISTS resubmission_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS resubmission_requested_by uuid,
  ADD COLUMN IF NOT EXISTS resubmission_reason text;

-- Add resubmission columns to merchant_documents
ALTER TABLE public.merchant_documents
  ADD COLUMN IF NOT EXISTS resubmission_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS resubmission_requested_by uuid,
  ADD COLUMN IF NOT EXISTS resubmission_reason text;
;
