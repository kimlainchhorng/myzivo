-- Add streak tracking columns to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create index for efficient streak queries
CREATE INDEX IF NOT EXISTS idx_drivers_streak ON drivers(streak_days DESC) WHERE streak_days > 0;

-- Comment for clarity
COMMENT ON COLUMN drivers.streak_days IS 'Consecutive days with at least one completed trip';
COMMENT ON COLUMN drivers.last_active_date IS 'Date of last completed trip for streak tracking';
COMMENT ON COLUMN drivers.longest_streak IS 'Highest streak achieved by this driver';;
