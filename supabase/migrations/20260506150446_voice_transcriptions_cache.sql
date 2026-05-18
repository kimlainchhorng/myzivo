CREATE TABLE IF NOT EXISTS public.voice_transcriptions (
  message_id text PRIMARY KEY,
  text text NOT NULL,
  language text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read; writes only via service role.
DROP POLICY IF EXISTS "voice_transcriptions_select_authenticated" ON public.voice_transcriptions;
CREATE POLICY "voice_transcriptions_select_authenticated"
  ON public.voice_transcriptions FOR SELECT
  TO authenticated USING (true);;
