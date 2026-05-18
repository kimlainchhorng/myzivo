CREATE POLICY "Drivers can view searching ride requests"
  ON public.ride_requests
  FOR SELECT
  TO authenticated
  USING (
    status = 'searching'
    AND assigned_driver_id IS NULL
    AND EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.user_id = (SELECT auth.uid())
      AND d.status = 'verified'
      AND d.rides_enabled = true
    )
  );;
