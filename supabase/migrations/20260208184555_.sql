-- ==========================================
-- DRIVER REWARD POINTS SYSTEM
-- ==========================================

-- Table: driver_reward_points
-- Stores each driver's total points balance
CREATE TABLE IF NOT EXISTS public.driver_reward_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  points_total INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id)
);

-- Enable RLS
ALTER TABLE public.driver_reward_points ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own points
CREATE POLICY "Drivers can view own points"
  ON public.driver_reward_points FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Table: driver_reward_history
-- Tracks every points transaction
CREATE TABLE IF NOT EXISTS public.driver_reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('referral_1st', 'referral_10th', 'referral_50th', 'bonus', 'redemption', 'other')),
  points INTEGER NOT NULL,
  referral_id UUID REFERENCES public.driver_referrals(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_reward_history ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own reward history
CREATE POLICY "Drivers can view own reward history"
  ON public.driver_reward_history FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Index for faster queries
CREATE INDEX idx_driver_reward_history_driver ON public.driver_reward_history(driver_id, created_at DESC);
CREATE INDEX idx_driver_reward_points_driver ON public.driver_reward_points(driver_id);

-- Add milestone tracking columns to driver_referrals
ALTER TABLE public.driver_referrals 
  ADD COLUMN IF NOT EXISTS milestone_1_credited BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS milestone_10_credited BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS milestone_50_credited BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing completed referrals to set milestone flags
UPDATE public.driver_referrals 
SET 
  milestone_1_credited = true,
  milestone_10_credited = true,
  milestone_50_credited = true,
  status = 'completed',
  approved_at = credited_at
WHERE credited_at IS NOT NULL;

-- For active referrals with some progress, set appropriate milestone flags
UPDATE public.driver_referrals 
SET 
  milestone_1_credited = (completed_orders >= 1),
  milestone_10_credited = (completed_orders >= 10),
  milestone_50_credited = (completed_orders >= 50),
  status = CASE 
    WHEN completed_orders >= 10 THEN 'approved'
    WHEN completed_orders >= 1 THEN 'active'
    ELSE 'pending'
  END,
  approved_at = CASE WHEN completed_orders >= 10 THEN now() ELSE NULL END
WHERE credited_at IS NULL;

-- Function to get driver points (for easy querying)
CREATE OR REPLACE FUNCTION public.get_driver_points(p_driver_id UUID)
RETURNS TABLE(points_total INTEGER, lifetime_points INTEGER)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(rp.points_total, 0), COALESCE(rp.lifetime_points, 0)
  FROM driver_reward_points rp
  WHERE rp.driver_id = p_driver_id
  UNION ALL
  SELECT 0, 0
  WHERE NOT EXISTS (SELECT 1 FROM driver_reward_points WHERE driver_id = p_driver_id)
  LIMIT 1;
$$;

-- Function to add points to a driver
CREATE OR REPLACE FUNCTION public.add_driver_points(
  p_driver_id UUID,
  p_points INTEGER,
  p_type TEXT,
  p_referral_id UUID DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  -- Insert or update the points balance
  INSERT INTO driver_reward_points (driver_id, points_total, lifetime_points)
  VALUES (p_driver_id, p_points, p_points)
  ON CONFLICT (driver_id) DO UPDATE
  SET 
    points_total = driver_reward_points.points_total + p_points,
    lifetime_points = driver_reward_points.lifetime_points + p_points,
    updated_at = now()
  RETURNING points_total INTO new_total;
  
  -- Record in history
  INSERT INTO driver_reward_history (driver_id, type, points, referral_id, note)
  VALUES (p_driver_id, p_type, p_points, p_referral_id, p_note);
  
  RETURN new_total;
END;
$$;;
