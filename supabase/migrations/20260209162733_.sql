
-- Extend loyalty_tiers with richer configuration columns
ALTER TABLE loyalty_tiers
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS discount_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_delivery boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_delivery_min_order numeric,
  ADD COLUMN IF NOT EXISTS bonus_points_multiplier numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS icon_color text DEFAULT '#6B7280',
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_loyalty_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_loyalty_tiers_updated_at ON loyalty_tiers;
CREATE TRIGGER update_loyalty_tiers_updated_at
  BEFORE UPDATE ON loyalty_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_tiers_updated_at();
;
