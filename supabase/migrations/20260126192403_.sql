-- Add root_cause_confirmed column to track if suggested root cause was accurate
ALTER TABLE public.anomaly_logs 
ADD COLUMN IF NOT EXISTS root_cause_confirmed BOOLEAN DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.anomaly_logs.root_cause_confirmed IS 'Indicates if the suggested root cause was confirmed as accurate by the user';;
