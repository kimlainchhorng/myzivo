-- Add activity_status column to drivers table for customer-visible status
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS activity_status TEXT DEFAULT 'offline';

-- Add check constraint for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'drivers_activity_status_check'
  ) THEN
    ALTER TABLE drivers 
    ADD CONSTRAINT drivers_activity_status_check 
    CHECK (activity_status IN ('offline', 'available', 'picking_up', 'at_pickup', 'delivering', 'at_dropoff'));
  END IF;
END $$;

-- Add index for efficient queries on activity_status
CREATE INDEX IF NOT EXISTS idx_drivers_activity_status ON drivers(activity_status) WHERE activity_status != 'offline';

-- Comment for documentation
COMMENT ON COLUMN drivers.activity_status IS 'Customer-visible driver activity: offline, available, picking_up, at_pickup, delivering, at_dropoff';;
