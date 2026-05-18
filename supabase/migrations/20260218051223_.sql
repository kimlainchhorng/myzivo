
-- Drop existing loose update policy
DROP POLICY IF EXISTS "Drivers can update own lost item requests" ON public.lost_item_requests;

-- Drivers can only update their own requests (accept/complete/decline)
CREATE POLICY "Drivers can update own requests"
  ON public.lost_item_requests
  FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Customers can only update their own requests (e.g. cancel)
CREATE POLICY "Customers can update own requests"
  ON public.lost_item_requests
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Customers can view their own requests
DROP POLICY IF EXISTS "Drivers can view own lost item requests" ON public.lost_item_requests;

CREATE POLICY "Users can view own lost item requests"
  ON public.lost_item_requests
  FOR SELECT
  USING (driver_id = auth.uid() OR customer_id = auth.uid());

-- Customers can delete (cancel) only their own pending requests
CREATE POLICY "Customers can delete own pending requests"
  ON public.lost_item_requests
  FOR DELETE
  USING (customer_id = auth.uid() AND status = 'pending');
;
