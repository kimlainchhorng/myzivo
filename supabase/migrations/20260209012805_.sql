-- Add zone_id foreign key to restaurants table
ALTER TABLE restaurants 
ADD COLUMN zone_id uuid REFERENCES eats_zones(id);

-- Create index for performance
CREATE INDEX idx_restaurants_zone_id ON restaurants(zone_id);

-- Update existing restaurants based on city match
UPDATE restaurants r
SET zone_id = (
  SELECT ez.id FROM eats_zones ez 
  WHERE LOWER(ez.city_name) = LOWER(r.city) 
  AND ez.is_active = true 
  LIMIT 1
)
WHERE r.city IS NOT NULL AND r.zone_id IS NULL;

-- Create policy for merchants to read zones if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'eats_zones' 
    AND policyname = 'Anyone can read active zones'
  ) THEN
    CREATE POLICY "Anyone can read active zones"
    ON eats_zones FOR SELECT
    USING (is_active = true);
  END IF;
END $$;;
