
-- Add missing columns to service_health_status
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS service_key text;
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS response_time_ms int;
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS error_rate numeric(5,2) DEFAULT 0;
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS manual_override boolean DEFAULT false;
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS override_by uuid REFERENCES auth.users(id);
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS override_reason text;
ALTER TABLE service_health_status ADD COLUMN IF NOT EXISTS last_checked_at timestamptz DEFAULT now();

-- Update status check constraint to include our new values
ALTER TABLE service_health_status DROP CONSTRAINT IF EXISTS service_health_status_status_check;
ALTER TABLE service_health_status ADD CONSTRAINT service_health_status_status_check 
  CHECK (status IN ('operational', 'healthy', 'degraded', 'outage', 'maintenance', 'partial_outage', 'major_outage'));

-- Populate service_key from service_name for existing rows
UPDATE service_health_status SET service_key = service_name WHERE service_key IS NULL;

-- Make service_key unique and not null
ALTER TABLE service_health_status ALTER COLUMN service_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_health_status_service_key ON service_health_status(service_key);

-- Ensure our 5 services exist
INSERT INTO service_health_status (service_key, service_name, status)
VALUES
  ('payments', 'Payments', 'healthy'),
  ('dispatch', 'Dispatch', 'healthy'),
  ('notifications', 'Notifications', 'healthy'),
  ('database', 'Database', 'healthy'),
  ('api', 'API', 'healthy')
ON CONFLICT (service_key) DO NOTHING;

-- Create service_health_history table
CREATE TABLE IF NOT EXISTS service_health_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'degraded', 'outage', 'maintenance')),
  response_time_ms int,
  error_rate numeric(5,2),
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_health_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_health_history_service ON service_health_history(service_key, recorded_at DESC);

-- RLS for history table
CREATE POLICY "Admin roles can view service health history"
  ON service_health_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'manager', 'support')
  ));

CREATE POLICY "Manager+ can insert service health history"
  ON service_health_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'manager')
  ));

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_health_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_health_status_updated_at ON service_health_status;
CREATE TRIGGER set_health_status_updated_at
  BEFORE UPDATE ON service_health_status
  FOR EACH ROW
  EXECUTE FUNCTION set_health_status_updated_at();
;
