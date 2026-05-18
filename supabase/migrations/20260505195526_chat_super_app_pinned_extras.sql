ALTER TABLE public.pinned_messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.pinned_messages ADD COLUMN IF NOT EXISTS message_table TEXT;
CREATE INDEX IF NOT EXISTS idx_pinned_messages_lookup ON public.pinned_messages(conversation_id, pinned_at DESC);;
