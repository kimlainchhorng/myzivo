
-- Create driver_push_ids table for OneSignal native push registration
CREATE TABLE IF NOT EXISTS public.driver_push_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  onesignal_player_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, onesignal_player_id)
);

-- Enable RLS
ALTER TABLE public.driver_push_ids ENABLE ROW LEVEL SECURITY;

-- Drivers can manage their own push IDs
CREATE POLICY "Drivers can view own push ids"
  ON public.driver_push_ids FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert own push ids"
  ON public.driver_push_ids FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own push ids"
  ON public.driver_push_ids FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own push ids"
  ON public.driver_push_ids FOR DELETE
  USING (auth.uid() = driver_id);

-- Index for fast lookup by driver
CREATE INDEX idx_driver_push_ids_driver ON public.driver_push_ids(driver_id);
;
