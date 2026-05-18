-- Add ETA and assignment tracking columns to food_orders
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Create index for merchant dispatch queries (online drivers with fresh locations)
CREATE INDEX IF NOT EXISTS idx_drivers_online_dispatch 
ON drivers (is_online, updated_at) 
WHERE is_online = true;

-- Create index for food_orders by restaurant and status (using valid enum values)
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant_status 
ON food_orders (restaurant_id, status) 
WHERE status IN ('pending', 'confirmed', 'in_progress', 'ready_for_pickup');

-- RLS policy for merchants to read online drivers (public driver info for dispatch)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'drivers' 
    AND policyname = 'Authenticated users can read online driver locations'
  ) THEN
    CREATE POLICY "Authenticated users can read online driver locations"
    ON drivers
    FOR SELECT
    TO authenticated
    USING (is_online = true);
  END IF;
END $$;

-- RLS policy for merchants to assign drivers to their restaurant's orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_orders' 
    AND policyname = 'Restaurant owners can assign drivers to their orders'
  ) THEN
    CREATE POLICY "Restaurant owners can assign drivers to their orders"
    ON food_orders
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM restaurants r 
        WHERE r.id = food_orders.restaurant_id 
        AND r.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM restaurants r 
        WHERE r.id = food_orders.restaurant_id 
        AND r.owner_id = auth.uid()
      )
    );
  END IF;
END $$;;
