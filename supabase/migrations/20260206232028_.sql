-- Phase 1: Add Stripe & Level columns to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Bronze',
ADD COLUMN IF NOT EXISTS daily_goal numeric DEFAULT 150;

-- Add check constraint for level (if not exists - use DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drivers_level_check'
  ) THEN
    ALTER TABLE public.drivers ADD CONSTRAINT drivers_level_check 
    CHECK (level IN ('Bronze', 'Silver', 'Gold', 'Platinum'));
  END IF;
END $$;

-- Phase 1.2: Create commission rates table
CREATE TABLE IF NOT EXISTS public.driver_commission_rates (
  level text PRIMARY KEY CHECK (level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  commission_pct numeric NOT NULL,
  trips_required integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default commission rates
INSERT INTO public.driver_commission_rates (level, commission_pct, trips_required) VALUES
  ('Bronze', 20, 0),
  ('Silver', 18, 100),
  ('Gold', 15, 500),
  ('Platinum', 12, 1000)
ON CONFLICT (level) DO NOTHING;

-- Enable RLS on commission rates table
ALTER TABLE public.driver_commission_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can read commission rates
CREATE POLICY "Anyone can read commission rates"
ON public.driver_commission_rates FOR SELECT USING (true);

-- Phase 1.3: Create driver level update function and trigger
CREATE OR REPLACE FUNCTION public.update_driver_level()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.total_trips >= 1000 THEN 'Platinum'
    WHEN NEW.total_trips >= 500 THEN 'Gold'
    WHEN NEW.total_trips >= 100 THEN 'Silver'
    ELSE 'Bronze'
  END;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_update_driver_level ON public.drivers;
CREATE TRIGGER trigger_update_driver_level
BEFORE UPDATE OF total_trips ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.update_driver_level();

-- Phase 1.4: Enable Realtime on key tables (ignore errors if already added)
DO $$
BEGIN
  ALTER publication supabase_realtime ADD TABLE trips;
EXCEPTION WHEN duplicate_object THEN
  -- Already exists, ignore
END $$;

DO $$
BEGIN
  ALTER publication supabase_realtime ADD TABLE food_orders;
EXCEPTION WHEN duplicate_object THEN
  -- Already exists, ignore
END $$;

DO $$
BEGIN
  ALTER publication supabase_realtime ADD TABLE driver_earnings;
EXCEPTION WHEN duplicate_object THEN
  -- Already exists, ignore
END $$;;
