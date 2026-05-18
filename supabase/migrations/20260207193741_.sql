-- Add bonus tracking columns to rides table
ALTER TABLE rides
ADD COLUMN bonus_amount NUMERIC DEFAULT NULL;

ALTER TABLE rides
ADD COLUMN bonus_zone_id UUID REFERENCES bonus_zones(id) DEFAULT NULL;

-- Add index for audit queries
CREATE INDEX idx_rides_bonus_zone_id ON rides(bonus_zone_id) WHERE bonus_zone_id IS NOT NULL;;
