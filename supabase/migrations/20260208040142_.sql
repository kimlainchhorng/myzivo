-- Verify priority column exists (this is idempotent, no-op if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pricing_zones' AND column_name = 'priority'
  ) THEN
    ALTER TABLE pricing_zones ADD COLUMN priority integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update USA Default Pricing zone to priority 0 (lowest fallback)
UPDATE pricing_zones SET priority = 0 WHERE name = 'USA Default Pricing' OR is_default = true;;
