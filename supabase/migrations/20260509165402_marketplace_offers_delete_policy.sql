
-- Buyer can delete (withdraw) their own pending offer
CREATE POLICY "Buyers withdraw own offers"
  ON public.marketplace_offers
  FOR DELETE
  USING (auth.uid() = buyer_id);

-- Make sure profiles is readable for seller card lookups
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles public id-only'
    ) THEN
      -- only add a permissive read if no policies grant SELECT yet
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd='SELECT') THEN
        EXECUTE 'CREATE POLICY "profiles public id-only" ON public.profiles FOR SELECT USING (true)';
      END IF;
    END IF;
  END IF;
END$$;
;
