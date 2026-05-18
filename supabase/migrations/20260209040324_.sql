-- Create announcement deliveries table for tracking delivery status per recipient
CREATE TABLE announcement_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'driver', 'merchant')),
  channel TEXT NOT NULL CHECK (channel IN ('push', 'sms', 'email', 'in_app')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_announcement_deliveries_announcement ON announcement_deliveries(announcement_id);
CREATE INDEX idx_announcement_deliveries_status ON announcement_deliveries(status);
CREATE INDEX idx_announcement_deliveries_recipient ON announcement_deliveries(recipient_id, recipient_type);

-- Enable RLS
ALTER TABLE announcement_deliveries ENABLE ROW LEVEL SECURITY;

-- Policy for admin access
CREATE POLICY "Admins can manage announcement deliveries" ON announcement_deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policy for announcements table (admin access)
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );;
