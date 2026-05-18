-- Allow verified drivers to accept (update) searching ride requests
CREATE POLICY "Drivers can accept searching ride requests"
  ON public.ride_requests
  FOR UPDATE
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
  )
  WITH CHECK (
    assigned_driver_id IN (
      SELECT d.id FROM drivers d
      WHERE d.user_id = (SELECT auth.uid())
      AND d.status = 'verified'
    )
  );;
