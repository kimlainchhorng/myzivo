-- Add inactivity tracking columns to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS inactivity_warning_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_driver_lat NUMERIC,
ADD COLUMN IF NOT EXISTS last_driver_lng NUMERIC,
ADD COLUMN IF NOT EXISTS last_progress_at TIMESTAMPTZ;

-- Add same columns to trips
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS inactivity_warning_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_driver_lat NUMERIC,
ADD COLUMN IF NOT EXISTS last_driver_lng NUMERIC,
ADD COLUMN IF NOT EXISTS last_progress_at TIMESTAMPTZ;

-- Index for inactivity monitor query on food_orders (use created_at as fallback)
CREATE INDEX IF NOT EXISTS idx_food_orders_inactivity
ON food_orders(created_at, status, driver_id)
WHERE driver_id IS NOT NULL AND status IN ('in_progress', 'ready_for_pickup');

-- Index for inactivity monitor query on trips (use created_at)
CREATE INDEX IF NOT EXISTS idx_trips_inactivity
ON trips(created_at, status, driver_id)
WHERE driver_id IS NOT NULL AND status IN ('accepted', 'en_route');;
