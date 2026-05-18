-- Add auto_arrived_enabled setting to driver_settings
ALTER TABLE driver_settings 
ADD COLUMN IF NOT EXISTS auto_arrived_enabled BOOLEAN DEFAULT true;

-- Add arrived_dropoff_at timestamp to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS arrived_dropoff_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN driver_settings.auto_arrived_enabled IS 'Whether to auto-detect arrival when within proximity threshold';
COMMENT ON COLUMN trips.arrived_dropoff_at IS 'Timestamp when driver arrived at dropoff location';;
