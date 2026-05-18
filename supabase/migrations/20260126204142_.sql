-- Add RLS policy for drivers to view and update food orders assigned to them
CREATE POLICY "Drivers can view their assigned food orders"
ON public.food_orders
FOR SELECT
USING (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
));

CREATE POLICY "Drivers can update their assigned food orders"
ON public.food_orders
FOR UPDATE
USING (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
))
WITH CHECK (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
));

-- Add policy for restaurants to assign drivers to orders
CREATE POLICY "Restaurants can assign drivers to orders"
ON public.food_orders
FOR UPDATE
USING (restaurant_id IN (
  SELECT id FROM restaurants WHERE owner_id = auth.uid()
))
WITH CHECK (restaurant_id IN (
  SELECT id FROM restaurants WHERE owner_id = auth.uid()
));

-- Enable realtime for food_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE food_orders;;
