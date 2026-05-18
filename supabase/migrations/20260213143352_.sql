
-- Notification campaigns table for targeted messaging
CREATE TABLE public.notification_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'push',
  category TEXT NOT NULL DEFAULT 'info',
  target_audience TEXT NOT NULL DEFAULT 'all',
  target_city TEXT,
  target_tier TEXT,
  target_activity TEXT,
  target_filters JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  repeat_schedule TEXT,
  repeat_until TIMESTAMPTZ,
  action_url TEXT,
  action_data JSONB,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns"
  ON public.notification_campaigns FOR ALL
  USING (public.is_admin(auth.uid()));

-- Campaign recipients tracking
CREATE TABLE public.campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.notification_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'driver',
  channel TEXT NOT NULL DEFAULT 'push',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view campaign recipients"
  ON public.campaign_recipients FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert campaign recipients"
  ON public.campaign_recipients FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update campaign recipients"
  ON public.campaign_recipients FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON public.notification_campaigns(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user ON public.campaign_recipients(user_id);
;
