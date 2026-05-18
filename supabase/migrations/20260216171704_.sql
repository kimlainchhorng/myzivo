
CREATE POLICY "Admins can insert zone pricing rates"
ON public.zone_pricing_rates
FOR INSERT
WITH CHECK ((SELECT public.is_admin(auth.uid())));

CREATE POLICY "Admins can update zone pricing rates"
ON public.zone_pricing_rates
FOR UPDATE
USING ((SELECT public.is_admin(auth.uid())));

CREATE POLICY "Admins can delete zone pricing rates"
ON public.zone_pricing_rates
FOR DELETE
USING ((SELECT public.is_admin(auth.uid())));

-- ai_pricing_bot_suggestions needs update policy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_pricing_bot_suggestions' AND cmd = 'UPDATE') THEN
    EXECUTE 'CREATE POLICY "Admins can update bot suggestions" ON public.ai_pricing_bot_suggestions FOR UPDATE USING ((SELECT public.is_admin(auth.uid())))';
  END IF;
END $$;
;
