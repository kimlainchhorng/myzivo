-- =====================================================
-- REMAINING POLICY FIXES
-- =====================================================

-- Fix profiles insert policy (drop first, then create if needed)
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- Fix drivers insert policy  
DROP POLICY IF EXISTS "drivers_insert" ON public.drivers;
DROP POLICY IF EXISTS "Users can register as driver" ON public.drivers;

-- Create driver registration policy with unique name
CREATE POLICY "drivers_self_registration" ON public.drivers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);;
