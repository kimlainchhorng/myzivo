-- Add actor_role column to admin_audit_logs
ALTER TABLE admin_audit_logs
ADD COLUMN IF NOT EXISTS actor_role text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_type ON admin_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);

-- Create audit_alerts table for high-risk action tracking
CREATE TABLE IF NOT EXISTS audit_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id uuid REFERENCES admin_audit_logs(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('medium', 'high', 'critical')),
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit_alerts
ALTER TABLE audit_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_alerts
CREATE POLICY "Admins can view alerts" ON audit_alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Owners can insert alerts" ON audit_alerts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager', 'support'))
  );

CREATE POLICY "Owners can update alerts" ON audit_alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );;
