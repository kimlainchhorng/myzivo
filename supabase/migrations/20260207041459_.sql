-- Enhance restaurant_branches with coordinates and business hours
ALTER TABLE restaurant_branches
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC,
ADD COLUMN IF NOT EXISTS hours JSONB DEFAULT '{}'::jsonb;

-- Create index for coordinate-based lookups
CREATE INDEX IF NOT EXISTS idx_branches_coords 
ON restaurant_branches(lat, lng) WHERE is_active = true;

-- Add branch reference to food_orders for order routing
ALTER TABLE food_orders
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES restaurant_branches(id);

-- Create index for branch-filtered order queries
CREATE INDEX IF NOT EXISTS idx_food_orders_branch 
ON food_orders(branch_id) WHERE branch_id IS NOT NULL;

-- Create function to find nearest active branch for a restaurant
CREATE OR REPLACE FUNCTION find_nearest_branch(
  p_restaurant_id UUID, 
  p_lat NUMERIC, 
  p_lng NUMERIC
)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM restaurant_branches
  WHERE parent_restaurant_id = p_restaurant_id
    AND is_active = true
    AND lat IS NOT NULL
    AND lng IS NOT NULL
  ORDER BY haversine_miles(p_lat, p_lng, lat, lng) ASC
  LIMIT 1;
$$;;
