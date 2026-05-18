
-- Add bonus payment tracking columns to driver_incentive_progress
ALTER TABLE public.driver_incentive_progress
ADD COLUMN IF NOT EXISTS bonus_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add check constraint for valid statuses
ALTER TABLE public.driver_incentive_progress
ADD CONSTRAINT chk_bonus_status CHECK (bonus_status IN ('pending', 'approved', 'paid'));
;
