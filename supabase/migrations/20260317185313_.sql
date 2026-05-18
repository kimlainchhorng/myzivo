ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS offer_sdp jsonb;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS caller_name text;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS receiver_name text;;
