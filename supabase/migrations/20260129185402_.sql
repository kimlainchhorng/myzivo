-- Fix transactions policy - use correct column names
CREATE POLICY "Drivers view trip transactions"
ON public.transactions FOR SELECT
USING (
  driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
);;
