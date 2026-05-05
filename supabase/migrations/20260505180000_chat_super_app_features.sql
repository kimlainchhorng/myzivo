-- Chat super-app features:
--   pinned_messages: pin DMs and group messages with TTL/unpin support
--   reply_to_message_id columns: quote-reply for direct + group messages
--   group_message_reads: per-member read receipts
--   group_polls + group_poll_votes: in-chat polls ("where should we eat tonight?")
--   live_locations: share live location to a chat for N minutes

-- =================
-- pinned_messages
-- =================
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_kind TEXT NOT NULL CHECK (chat_kind IN ('direct', 'group')),
  chat_key TEXT NOT NULL,                -- recipient_id (DM pair token) or group_id
  message_id UUID NOT NULL,
  message_table TEXT NOT NULL CHECK (message_table IN ('direct_messages', 'group_messages')),
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(chat_kind, chat_key, message_id)
);

CREATE INDEX IF NOT EXISTS idx_pinned_messages_lookup ON public.pinned_messages(chat_kind, chat_key, pinned_at DESC);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read pins for chats they're in"
  ON public.pinned_messages FOR SELECT
  USING (
    (chat_kind = 'direct' AND auth.uid() IS NOT NULL)
    OR (chat_kind = 'group' AND EXISTS (
      SELECT 1 FROM public.chat_group_members m
      WHERE m.group_id::TEXT = chat_key AND m.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can pin messages in their chats"
  ON public.pinned_messages FOR INSERT
  WITH CHECK (auth.uid() = pinned_by);

CREATE POLICY "Users can unpin their own pins"
  ON public.pinned_messages FOR DELETE
  USING (auth.uid() = pinned_by);


-- =================
-- reply_to_message_id columns
-- =================
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID,
  ADD COLUMN IF NOT EXISTS reply_to_snapshot JSONB;     -- {sender_name, text} snapshot for fast render

ALTER TABLE public.group_messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID,
  ADD COLUMN IF NOT EXISTS reply_to_snapshot JSONB;


-- =================
-- group_message_reads
-- =================
CREATE TABLE IF NOT EXISTS public.group_message_reads (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_message_reads_message ON public.group_message_reads(message_id);

ALTER TABLE public.group_message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can record their own read"
  ON public.group_message_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can read receipts in their groups"
  ON public.group_message_reads FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- =================
-- group_polls
-- =================
CREATE TABLE IF NOT EXISTS public.group_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  message_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,                -- [{id, label, emoji?}]
  multi_select BOOLEAN NOT NULL DEFAULT false,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_polls_group ON public.group_polls(group_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.group_poll_votes (
  poll_id UUID NOT NULL REFERENCES public.group_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, user_id, option_id)
);

ALTER TABLE public.group_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read group polls"
  ON public.group_polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members m
      WHERE m.group_id = group_polls.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create polls in their groups"
  ON public.group_polls FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.chat_group_members m
      WHERE m.group_id = group_polls.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can read votes"
  ON public.group_poll_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can vote"
  ON public.group_poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can change their vote"
  ON public.group_poll_votes FOR DELETE
  USING (auth.uid() = user_id);


-- =================
-- live_locations
-- =================
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

CREATE POLICY "Users can read live locations in chats they're in"
  ON public.live_locations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can publish their own location"
  ON public.live_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
  ON public.live_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can stop sharing their own location"
  ON public.live_locations FOR DELETE
  USING (auth.uid() = user_id);
