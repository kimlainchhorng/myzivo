-- Fix: Add 'Bronze' to the drivers_level_check constraint since the default value is 'Bronze'
ALTER TABLE public.drivers DROP CONSTRAINT drivers_level_check;
ALTER TABLE public.drivers ADD CONSTRAINT drivers_level_check 
  CHECK (level = ANY (ARRAY['Bronze'::text, 'Silver'::text, 'Gold'::text, 'Platinum'::text, 'Black'::text, 'Black Lux'::text]));;
