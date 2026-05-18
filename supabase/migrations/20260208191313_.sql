-- Identity verifications table for Stripe Identity KYC
CREATE TABLE identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  provider text DEFAULT 'stripe_identity',
  stripe_verification_session_id text UNIQUE,
  status text DEFAULT 'not_started',
  last_error text,
  admin_override boolean DEFAULT false,
  admin_override_by uuid,
  admin_override_at timestamptz,
  admin_override_note text,
  raw jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_identity_verifications_application_id ON identity_verifications(application_id);
CREATE INDEX idx_identity_verifications_driver_id ON identity_verifications(driver_id);
CREATE INDEX idx_identity_verifications_status ON identity_verifications(status);

-- Enable RLS
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

-- Admin-only policy (same pattern as background_checks)
CREATE POLICY "Admin access only" ON identity_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_identity_verifications_updated_at
  BEFORE UPDATE ON identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
