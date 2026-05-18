-- Add policy to allow anyone to view active hotels (similar to restaurants and airlines)
-- This enables the public booking flow where users can browse available hotels

CREATE POLICY "Anyone can view active hotels"
ON public.hotels
FOR SELECT
USING (status = 'active'::partner_status);;
