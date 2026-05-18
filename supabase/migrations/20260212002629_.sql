
-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using existing is_admin() function
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications FOR DELETE
  USING (is_admin());

CREATE POLICY "System can insert notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications (created_at DESC);
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications (is_read);
CREATE INDEX idx_admin_notifications_is_archived ON public.admin_notifications (is_archived);
CREATE INDEX idx_admin_notifications_composite ON public.admin_notifications (is_read, is_archived, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
;
