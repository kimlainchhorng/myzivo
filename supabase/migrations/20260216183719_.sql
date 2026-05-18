
-- Fix currencies: allow anon reads
DROP POLICY IF EXISTS "Anyone can read currencies" ON public.currencies;
CREATE POLICY "Anyone can read currencies" ON public.currencies
  FOR SELECT USING (true);

-- Fix tax_rules: allow anon reads
CREATE POLICY "Anyone can read tax rules" ON public.tax_rules
  FOR SELECT USING (true);
;
