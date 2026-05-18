-- Engagement notifications tracking table
CREATE TABLE IF NOT EXISTS public.engagement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  opened_at TIMESTAMPTZ,
  
  CONSTRAINT engagement_notifications_type_check 
    CHECK (notification_type IN ('high_demand', 'incentive', 'inactivity'))
);

-- Index for efficient cooldown queries
CREATE INDEX idx_engagement_notifications_driver_type_sent 
  ON engagement_notifications(driver_id, notification_type, sent_at DESC);

-- RLS
ALTER TABLE engagement_notifications ENABLE ROW LEVEL SECURITY;

-- Service role full access for cron jobs
CREATE POLICY "Service role full access" ON engagement_notifications
  FOR ALL USING (true) WITH CHECK (true);;
