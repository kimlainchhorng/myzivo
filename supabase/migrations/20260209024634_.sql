-- Add business order flag to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS is_business_order BOOLEAN DEFAULT false;

-- Add partial index for filtering business orders
CREATE INDEX IF NOT EXISTS idx_food_orders_is_business 
ON food_orders(is_business_order) WHERE is_business_order = true;;
