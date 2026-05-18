-- Add vehicle_type and capacity columns to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT 'sedan';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 4;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance_expiry date;;
