ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID, ADD COLUMN IF NOT EXISTS reply_to_snapshot JSONB;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID, ADD COLUMN IF NOT EXISTS reply_to_snapshot JSONB;;
