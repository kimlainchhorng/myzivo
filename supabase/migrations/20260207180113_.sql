-- Add trip metrics columns to rides table
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS trip_started_at TIMESTAMPTZ;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS actual_duration_min INTEGER;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS actual_distance_miles NUMERIC(6,2);;
