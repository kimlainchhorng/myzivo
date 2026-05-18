
-- 1. Add missing ride_type column to food_orders
ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS ride_type TEXT DEFAULT 'delivery';

-- 2. Add index for ride_type queries
CREATE INDEX IF NOT EXISTS idx_food_orders_ride_type ON public.food_orders(ride_type);

-- 3. Add index on food_orders.status for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON public.food_orders(status);

-- 4. Add index on food_orders.restaurant_id + status for merchant dashboard
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant_status ON public.food_orders(restaurant_id, status);

-- 5. Add composite index on food_orders.created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_food_orders_created_at ON public.food_orders(created_at DESC);
;
