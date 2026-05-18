-- Add dispatch timing column to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS dispatch_at TIMESTAMPTZ;

-- Index for efficient querying of orders ready for dispatch
CREATE INDEX IF NOT EXISTS idx_food_orders_dispatch_at 
ON food_orders(dispatch_at) 
WHERE dispatch_at IS NOT NULL AND driver_id IS NULL;;
