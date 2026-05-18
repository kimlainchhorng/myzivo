CREATE TABLE IF NOT EXISTS public.live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_kind TEXT NOT NULL CHECK (chat_kind IN ('direct', 'group')),
  chat_key TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_m NUMERIC,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chat_kind, chat_key)
);
CREATE INDEX IF NOT EXISTS idx_live_locations_active ON public.live_locations(chat_kind, chat_key, expires_at);
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read live locations in chats theyre in" ON public.live_locations;
CREATE POLICY "Users can read live locations in chats theyre in" ON public.live_locations FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can publish their own location" ON public.live_locations;
CREATE POLICY "Users can publish their own location" ON public.live_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own location" ON public.live_locations;
CREATE POLICY "Users can update their own location" ON public.live_locations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can stop sharing their own location" ON public.live_locations;
CREATE POLICY "Users can stop sharing their own location" ON public.live_locations FOR DELETE USING (auth.uid() = user_id);;
