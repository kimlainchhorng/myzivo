-- Add insurance claim tracking columns to emergency_incidents
ALTER TABLE public.emergency_incidents
  ADD COLUMN IF NOT EXISTS insurance_claim_number text,
  ADD COLUMN IF NOT EXISTS insurance_provider text,
  ADD COLUMN IF NOT EXISTS claim_amount_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_payment_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS claim_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS claim_resolved_at timestamptz;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_insurance ON public.emergency_incidents(insurance_payment_status) WHERE insurance_claim_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_reporter ON public.emergency_incidents(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_type ON public.emergency_incidents(incident_type);;
