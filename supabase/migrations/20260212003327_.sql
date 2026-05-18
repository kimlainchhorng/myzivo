
ALTER TABLE eats_zones
  ADD COLUMN IF NOT EXISTS services_enabled jsonb NOT NULL DEFAULT '["ride","eats","delivery"]',
  ADD COLUMN IF NOT EXISTS center_lat numeric,
  ADD COLUMN IF NOT EXISTS center_lng numeric,
  ADD COLUMN IF NOT EXISTS polygon jsonb;
;
