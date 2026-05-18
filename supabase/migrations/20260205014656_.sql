-- Add INSERT policy for security_events table
-- Allows authenticated users to insert their own security events
CREATE POLICY "Users can insert own security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);;
