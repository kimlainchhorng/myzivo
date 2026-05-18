-- Track surge notifications sent to drivers
CREATE TABLE public.surge_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.surge_zones(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  multiplier numeric(3,1) NOT NULL,
  notification_type text NOT NULL DEFAULT 'high_demand'
);

-- Enable RLS
ALTER TABLE public.surge_notifications ENABLE ROW LEVEL SECURITY;

-- Drivers can read their own notifications
CREATE POLICY "Drivers can view their own surge notifications"
ON public.surge_notifications
FOR SELECT
USING (driver_id = auth.uid());

-- Service role can insert notifications
CREATE POLICY "Service role can insert surge notifications"
ON public.surge_notifications
FOR INSERT
WITH CHECK (true);

-- Index for cooldown checks (find recent notifications for a driver)
CREATE INDEX idx_surge_notifications_driver_recent 
ON public.surge_notifications(driver_id, sent_at DESC);

-- Index for zone-based queries
CREATE INDEX idx_surge_notifications_zone 
ON public.surge_notifications(zone_id, sent_at DESC);;
