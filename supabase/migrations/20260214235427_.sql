-- Fix: trip_receipts and trip_receipt_items use job_id, not customer/driver_id
-- The earlier policies for other tables already applied successfully, so only add the remaining ones.

-- trip_receipts: accessible via job ownership (jobs table has customer_id and assigned_driver_id)
CREATE POLICY "Service role full access" ON public.trip_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users view own trip receipts" ON public.trip_receipts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = trip_receipts.job_id
    AND (j.customer_id = auth.uid() OR j.assigned_driver_id = auth.uid())
  )
);

-- trip_receipt_items: accessible if user can access parent receipt
CREATE POLICY "Service role full access" ON public.trip_receipt_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users view own receipt items" ON public.trip_receipt_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_receipts r
    JOIN public.jobs j ON j.id = r.job_id
    WHERE r.id = trip_receipt_items.receipt_id
    AND (j.customer_id = auth.uid() OR j.assigned_driver_id = auth.uid())
  )
);;
