-- Fix overly permissive RLS policies for security_events

-- Drop the permissive insert policy
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;

-- Create a proper insert policy - only authenticated users inserting events about themselves or admins
CREATE POLICY "Authenticated users can log security events"
ON public.security_events FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
);;
