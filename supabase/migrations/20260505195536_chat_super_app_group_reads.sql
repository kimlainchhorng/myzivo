CREATE TABLE IF NOT EXISTS public.group_message_reads (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_group_message_reads_message ON public.group_message_reads(message_id);
ALTER TABLE public.group_message_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can record their own read" ON public.group_message_reads;
CREATE POLICY "Members can record their own read" ON public.group_message_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Members can read receipts in their groups" ON public.group_message_reads;
CREATE POLICY "Members can read receipts in their groups" ON public.group_message_reads FOR SELECT USING (auth.uid() IS NOT NULL);;
