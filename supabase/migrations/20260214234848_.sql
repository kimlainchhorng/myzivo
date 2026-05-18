-- Add user_id to device_registry for ownership tracking
ALTER TABLE public.device_registry ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill isn't possible without data, so allow null for existing rows
-- but new inserts should set it

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert devices" ON public.device_registry;
DROP POLICY IF EXISTS "Authenticated users can update devices" ON public.device_registry;

-- Create scoped INSERT policy: user can only insert devices for themselves
CREATE POLICY "Users can insert own devices"
ON public.device_registry FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create scoped UPDATE policy: user can only update their own devices
CREATE POLICY "Users can update own devices"
ON public.device_registry FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());;
