-- Create driver_locations table for dedicated location tracking
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  heading NUMERIC,
  speed NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated_at ON driver_locations(updated_at);

-- Enable RLS
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- Drivers can only upsert their own location
CREATE POLICY "driver_locations_driver_own" ON driver_locations
  FOR ALL USING (driver_id = (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  ));

-- Add needs_driver column to food_orders (optional but helpful for clearer intent)
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS needs_driver BOOLEAN DEFAULT false;

-- Update existing RLS policy for food_orders to allow drivers to accept unassigned orders
-- First drop any conflicting policies if they exist
DROP POLICY IF EXISTS "drivers_accept_unassigned_food_orders" ON food_orders;
DROP POLICY IF EXISTS "drivers_update_own_food_orders" ON food_orders;

-- Drivers can update orders: either unassigned (to accept) or their own assigned orders
CREATE POLICY "drivers_update_food_orders" ON food_orders
  FOR UPDATE USING (
    driver_id IS NULL
    OR driver_id = (SELECT id FROM drivers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    driver_id = (SELECT id FROM drivers WHERE user_id = auth.uid())
  );;
