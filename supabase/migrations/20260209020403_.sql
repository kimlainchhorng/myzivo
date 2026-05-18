-- Add segment_id column to promo_codes for user segment targeting
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS segment_id uuid REFERENCES push_segments(id);;
