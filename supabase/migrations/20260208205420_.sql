-- Add needs_driver column to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS needs_driver BOOLEAN DEFAULT false;

-- Create partial index for efficient driver pickup queries
CREATE INDEX IF NOT EXISTS idx_food_orders_needs_driver 
ON food_orders(status, needs_driver, driver_id) 
WHERE status = 'ready_for_pickup' AND needs_driver = true AND driver_id IS NULL;;
