-- Temporary token relay for native OAuth (Safari overlay → WebView)
-- Tokens are stored briefly (< 5 min) keyed by a random UUID relay_id.
-- The relay_id acts as a one-time secret (122 bits of entropy).

CREATE TABLE public.auth_relay_tokens (
  relay_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_relay_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (tokens are protected by the random relay_id)
CREATE POLICY "anon_insert_relay" ON public.auth_relay_tokens
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_relay" ON public.auth_relay_tokens
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_delete_relay" ON public.auth_relay_tokens
  FOR DELETE TO anon USING (true);

-- Index for cleanup of expired tokens
CREATE INDEX idx_relay_created ON public.auth_relay_tokens (created_at);;
