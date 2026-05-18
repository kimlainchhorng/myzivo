-- Create driver_settings table for persistent user preferences
CREATE TABLE public.driver_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  -- Voice command settings
  voice_commands_enabled BOOLEAN DEFAULT false,
  voice_language TEXT DEFAULT 'en-US',
  voice_feedback_enabled BOOLEAN DEFAULT true,
  -- Push notification settings
  push_notifications_enabled BOOLEAN DEFAULT false,
  notification_orders BOOLEAN DEFAULT true,
  notification_earnings BOOLEAN DEFAULT true,
  notification_promotions BOOLEAN DEFAULT true,
  notification_messages BOOLEAN DEFAULT true,
  notification_sound_enabled BOOLEAN DEFAULT true,
  notification_vibration_enabled BOOLEAN DEFAULT true,
  -- Offline sync settings
  offline_mode_enabled BOOLEAN DEFAULT false,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_on_wifi_only BOOLEAN DEFAULT false,
  cache_trips_days INTEGER DEFAULT 7,
  -- General preferences
  theme TEXT DEFAULT 'system',
  haptic_feedback_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_driver_settings UNIQUE (driver_id)
);

-- Create voice_command_logs table for analytics
CREATE TABLE public.voice_command_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  command_type TEXT NOT NULL,
  transcript TEXT,
  was_successful BOOLEAN DEFAULT true,
  confidence NUMERIC(4,3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offline_sync_queue table for pending actions
CREATE TABLE public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Create push_notification_subscriptions table for web push
CREATE TABLE public.push_notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT,
  auth_key TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_endpoint_per_driver UNIQUE (driver_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.driver_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_settings
CREATE POLICY "Drivers can view own settings"
  ON public.driver_settings FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert own settings"
  ON public.driver_settings FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own settings"
  ON public.driver_settings FOR UPDATE
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- RLS Policies for voice_command_logs
CREATE POLICY "Drivers can view own voice logs"
  ON public.voice_command_logs FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert own voice logs"
  ON public.voice_command_logs FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- RLS Policies for offline_sync_queue
CREATE POLICY "Drivers can view own sync queue"
  ON public.offline_sync_queue FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can manage own sync queue"
  ON public.offline_sync_queue FOR ALL
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- RLS Policies for push_notification_subscriptions
CREATE POLICY "Drivers can view own subscriptions"
  ON public.push_notification_subscriptions FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can manage own subscriptions"
  ON public.push_notification_subscriptions FOR ALL
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_driver_settings_updated_at
  BEFORE UPDATE ON public.driver_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_notification_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for sync queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.offline_sync_queue;;
