
-- Fix: Allow authenticated users to see active restaurants
-- while owners and admins retain full access

-- First re-create the dropped policy to restore access
CREATE POLICY "restaurants_public_read" ON public.restaurants
FOR SELECT USING (
  -- Authenticated users can see active, approved restaurants
  (status = 'active') OR
  -- Owners can always see their own restaurant
  owner_id = auth.uid() OR
  -- Admins see all
  public.has_role(auth.uid(), 'admin')
);
;
