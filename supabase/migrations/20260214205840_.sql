
-- Add manual_multiplier and auto_enabled to surge_zones
ALTER TABLE public.surge_zones 
  ADD COLUMN IF NOT EXISTS manual_multiplier double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_enabled boolean DEFAULT true;

-- Migrate surge_enabled → auto_enabled for existing rows  
UPDATE public.surge_zones SET auto_enabled = surge_enabled WHERE auto_enabled IS NULL;

-- Add a computed column helper: radius_meters = radius_km * 1000
-- We'll just use radius_km * 1000 in the app code

-- Ensure RLS policies exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'surge_zones' AND policyname = 'Admin full access to surge_zones') THEN
    CREATE POLICY "Admin full access to surge_zones" ON public.surge_zones FOR ALL USING (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support'))
    );
  END IF;
END $$;
;
