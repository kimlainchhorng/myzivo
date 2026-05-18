-- Add referral_code column to drivers table
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate codes for existing drivers using first 4 chars of UUID
UPDATE drivers 
SET referral_code = 'ZIVO-DRIVER-' || UPPER(SUBSTRING(id::text, 1, 4))
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL after populating
ALTER TABLE drivers 
ALTER COLUMN referral_code SET NOT NULL;

-- Add default for new drivers
ALTER TABLE drivers 
ALTER COLUMN referral_code SET DEFAULT '';

-- Add referred_driver_id to driver_referrals to track which driver signed up
ALTER TABLE driver_referrals
ADD COLUMN IF NOT EXISTS referred_driver_id UUID REFERENCES drivers(id);

-- Create trigger function to auto-generate referral code on new driver insert
CREATE OR REPLACE FUNCTION generate_driver_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := 'ZIVO-DRIVER-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_driver_referral_code ON drivers;
CREATE TRIGGER set_driver_referral_code
BEFORE INSERT ON drivers
FOR EACH ROW
EXECUTE FUNCTION generate_driver_referral_code();;
