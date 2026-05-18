-- Update existing Bronze rows to Silver (code's lowest tier)
UPDATE public.drivers SET level = 'Silver' WHERE level = 'Bronze';

-- Now apply the corrected level constraint
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_level_check;
ALTER TABLE public.drivers ADD CONSTRAINT drivers_level_check 
CHECK (level IN ('Silver', 'Gold', 'Platinum', 'Black', 'Black Lux'));;
