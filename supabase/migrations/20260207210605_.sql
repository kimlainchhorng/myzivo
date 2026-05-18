-- Create notification_attempts table for audit logging of push/SMS delivery
CREATE TABLE public.notification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('push', 'sms')),
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  provider_id text,
  error text,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_notification_attempts_user ON notification_attempts(user_id, created_at DESC);
CREATE INDEX idx_notification_attempts_status ON notification_attempts(status, created_at DESC);

-- Enable RLS
ALTER TABLE notification_attempts ENABLE ROW LEVEL SECURITY;

-- Users can read their own attempts
CREATE POLICY "Users can read own notification attempts" ON notification_attempts
  FOR SELECT USING (user_id = auth.uid());

-- Service role can insert (edge functions use service role)
CREATE POLICY "Service role can insert notification attempts" ON notification_attempts
  FOR INSERT WITH CHECK (true);;
