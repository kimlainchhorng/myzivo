-- Add missing columns to trips table for driver app
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS distance_miles numeric,
ADD COLUMN IF NOT EXISTS estimated_minutes integer,
ADD COLUMN IF NOT EXISTS passenger_name text,
ADD COLUMN IF NOT EXISTS driver_lat numeric,
ADD COLUMN IF NOT EXISTS driver_lng numeric,
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS arrived_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_by text;

-- Add updated_at if not exists (with default)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'updated_at') THEN
    ALTER TABLE trips ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to food_orders table
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS distance_miles numeric;

-- Add tip_amount if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_orders' AND column_name = 'tip_amount') THEN
    ALTER TABLE food_orders ADD COLUMN tip_amount numeric DEFAULT 0;
  END IF;
END $$;

-- Create or replace the updated_at trigger function (already exists but ensure it's there)
CREATE OR REPLACE FUNCTION public.update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for trips updated_at
DROP TRIGGER IF EXISTS set_trips_updated_at ON trips;
CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trips_updated_at();;
