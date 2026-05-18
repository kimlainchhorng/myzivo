-- Fix the food_orders policy that references auth.users
-- The current policy fails for admins because it tries to access auth.users

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can read own orders by phone" ON public.food_orders;

-- Recreate it with admin bypass
CREATE POLICY "Users can read own orders by phone" ON public.food_orders
FOR SELECT
USING (
  is_admin() OR (
    auth.uid() IS NOT NULL 
    AND customer_phone IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid() AND u.phone = food_orders.customer_phone
    )
  )
);

-- Also add FK for driver_cashouts to fix that error
ALTER TABLE driver_cashouts
ADD CONSTRAINT driver_cashouts_driver_id_fkey
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;;
