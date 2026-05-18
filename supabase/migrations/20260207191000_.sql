-- Create user_devices table for OneSignal player IDs
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('driver', 'merchant')),
  onesignal_player_id text NOT NULL,
  device_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT user_devices_unique UNIQUE (user_id, onesignal_player_id)
);

-- Indexes for user_devices
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_player ON public.user_devices(onesignal_player_id);

-- RLS for user_devices
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their own devices" ON public.user_devices;
CREATE POLICY "Users can manage their own devices" ON public.user_devices
  FOR ALL USING (user_id = auth.uid());

-- Add role column to existing notifications table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'notifications' 
                 AND column_name = 'role') THEN
    ALTER TABLE public.notifications 
    ADD COLUMN role text DEFAULT 'merchant' CHECK (role IN ('driver', 'merchant'));
  END IF;
END $$;

-- Ensure RLS policies exist for notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can read their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());;
