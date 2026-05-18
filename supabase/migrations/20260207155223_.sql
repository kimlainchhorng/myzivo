-- Add driver metrics columns
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS acceptance_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS decline_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS cancel_count INTEGER DEFAULT 0 NOT NULL;

-- Create RPC function for atomic increment of acceptance count
CREATE OR REPLACE FUNCTION increment_driver_acceptance(driver_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE drivers
  SET acceptance_count = acceptance_count + 1
  WHERE id = driver_id_param;
END;
$$;

-- Create RPC function for atomic increment of decline count
CREATE OR REPLACE FUNCTION increment_driver_decline(driver_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE drivers
  SET decline_count = decline_count + 1
  WHERE id = driver_id_param;
END;
$$;

-- Create RPC function for atomic increment of cancel count
CREATE OR REPLACE FUNCTION increment_driver_cancel(driver_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE drivers
  SET cancel_count = cancel_count + 1
  WHERE id = driver_id_param;
END;
$$;;
