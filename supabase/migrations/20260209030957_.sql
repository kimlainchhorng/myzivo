-- Add editing awareness columns to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS editable_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS restaurant_confirmed_at TIMESTAMPTZ;

-- Composite index for dispatch eligibility query
CREATE INDEX IF NOT EXISTS idx_food_orders_dispatch_editable
ON food_orders(dispatch_at, editable_until, restaurant_confirmed_at)
WHERE driver_id IS NULL AND status IN ('pending', 'confirmed', 'preparing');

-- Comment explaining the columns
COMMENT ON COLUMN food_orders.editable_until IS 'Timestamp until customer can edit the order. Dispatch waits until this expires or restaurant confirms.';
COMMENT ON COLUMN food_orders.restaurant_confirmed_at IS 'Timestamp when restaurant confirmed the order, bypassing the editing window.';;
