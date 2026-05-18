-- Add auto-accept columns to driver_settings
ALTER TABLE driver_settings
ADD COLUMN IF NOT EXISTS auto_accept_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_accept_delay_seconds INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN driver_settings.auto_accept_enabled IS 'Whether the driver has enabled auto-accept trips feature';
COMMENT ON COLUMN driver_settings.auto_accept_delay_seconds IS 'Delay in seconds before auto-accepting (0 for instant, 3 for Gold tier preview)';;
