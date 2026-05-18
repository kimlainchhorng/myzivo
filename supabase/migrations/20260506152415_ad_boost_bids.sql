-- Captures merchant bids for promoted placements (Top Map, Top Reel).
-- Awarding logic happens out-of-band (admin-side scheduler picks the highest
-- bid per slot per duration window). Until the auction runs, the row simply
-- represents the merchant's intent.
CREATE TABLE IF NOT EXISTS public.ad_boost_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES public.store_profiles(id) ON DELETE CASCADE,
  placement text NOT NULL CHECK (placement IN ('top_map', 'top_reel')),
  budget_cents integer NOT NULL CHECK (budget_cents > 0),
  duration_days integer NOT NULL CHECK (duration_days > 0 AND duration_days <= 90),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  predicted_roi_pct integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ad_boost_bids_user
  ON public.ad_boost_bids (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ad_boost_bids_active
  ON public.ad_boost_bids (placement, status)
  WHERE status = 'pending';

ALTER TABLE public.ad_boost_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_boost_bids_select_own" ON public.ad_boost_bids;
CREATE POLICY "ad_boost_bids_select_own"
  ON public.ad_boost_bids FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ad_boost_bids_insert_own" ON public.ad_boost_bids;
CREATE POLICY "ad_boost_bids_insert_own"
  ON public.ad_boost_bids FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ad_boost_bids_update_own_pending" ON public.ad_boost_bids;
CREATE POLICY "ad_boost_bids_update_own_pending"
  ON public.ad_boost_bids FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');;
