
DROP POLICY IF EXISTS "Authenticated users can insert fare calculations" ON public.fare_calculations;
CREATE POLICY "Auth users can insert fare calculations"
  ON public.fare_calculations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
;
