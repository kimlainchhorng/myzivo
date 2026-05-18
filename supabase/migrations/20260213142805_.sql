
DROP POLICY IF EXISTS "Service role can insert forecast runs" ON public.ai_forecast_runs;
CREATE POLICY "Admins can insert forecast runs"
  ON public.ai_forecast_runs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
;
