-- Add saved location reference to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS saved_location_id UUID REFERENCES saved_locations(id),
ADD COLUMN IF NOT EXISTS address_type TEXT;

-- Index for saved location joins
CREATE INDEX IF NOT EXISTS idx_food_orders_saved_location 
ON food_orders(saved_location_id) WHERE saved_location_id IS NOT NULL;

-- Also add to trips for ride pickups/dropoffs
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS pickup_saved_location_id UUID REFERENCES saved_locations(id),
ADD COLUMN IF NOT EXISTS pickup_address_type TEXT,
ADD COLUMN IF NOT EXISTS dropoff_saved_location_id UUID REFERENCES saved_locations(id),
ADD COLUMN IF NOT EXISTS dropoff_address_type TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN food_orders.saved_location_id IS 'Reference to customer saved location for delivery address';
COMMENT ON COLUMN food_orders.address_type IS 'Denormalized label from saved location (Home, Work, etc.)';
COMMENT ON COLUMN trips.pickup_saved_location_id IS 'Reference to customer saved location for pickup';
COMMENT ON COLUMN trips.dropoff_saved_location_id IS 'Reference to customer saved location for dropoff';;
