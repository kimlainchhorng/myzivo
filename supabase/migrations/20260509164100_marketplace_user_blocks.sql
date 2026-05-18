
CREATE TABLE IF NOT EXISTS public.marketplace_user_blocks (
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
ALTER TABLE public.marketplace_user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own blocks" ON public.marketplace_user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "users insert own blocks" ON public.marketplace_user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "users delete own blocks" ON public.marketplace_user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);
CREATE INDEX IF NOT EXISTS idx_market_blocks_blocker ON public.marketplace_user_blocks(blocker_id);
;
