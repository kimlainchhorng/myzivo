-- Allow customers to view audit logs for their own bookings
CREATE POLICY "Customers can view own booking audit logs"
ON public.booking_audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.travel_orders
    WHERE id = booking_audit_logs.order_id
    AND user_id = auth.uid()
  )
);;
