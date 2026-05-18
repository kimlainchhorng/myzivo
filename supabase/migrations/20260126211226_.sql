-- Allow drivers to view food orders that are ready for pickup (waiting for driver assignment)
CREATE POLICY "Drivers can view ready for pickup orders"
ON public.food_orders FOR SELECT
USING (
  (status = 'ready_for_pickup'::booking_status AND driver_id IS NULL)
  AND EXISTS (
    SELECT 1 FROM drivers 
    WHERE drivers.user_id = auth.uid() 
    AND drivers.is_online = true
    AND drivers.status = 'verified'::driver_status
  )
);

-- Allow drivers to claim/accept orders that are ready for pickup
CREATE POLICY "Drivers can accept ready orders"
ON public.food_orders FOR UPDATE
USING (
  status = 'ready_for_pickup'::booking_status 
  AND driver_id IS NULL
  AND EXISTS (
    SELECT 1 FROM drivers 
    WHERE drivers.user_id = auth.uid() 
    AND drivers.is_online = true
    AND drivers.status = 'verified'::driver_status
  )
)
WITH CHECK (
  driver_id IN (
    SELECT id FROM drivers WHERE drivers.user_id = auth.uid()
  )
);

-- Allow customers to see driver location when order is in progress
CREATE POLICY "Customers can view their order driver"
ON public.drivers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM food_orders 
    WHERE food_orders.customer_id = auth.uid()
    AND food_orders.driver_id = drivers.id
    AND food_orders.status IN ('in_progress'::booking_status, 'ready_for_pickup'::booking_status)
  )
);;
