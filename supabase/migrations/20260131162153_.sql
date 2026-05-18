-- Fix hotels table: Restrict full SELECT to owners/admins only
-- Public access should use hotels_public view which excludes PII

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "hotels_public_basic_select" ON public.hotels;

-- Create strict SELECT policy - only owners/admins see full details
CREATE POLICY "hotels_owner_admin_select" ON public.hotels FOR SELECT TO authenticated
USING (
  owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- Ensure public view exists with NO PII (for general browsing)
DROP VIEW IF EXISTS public.hotels_public;
CREATE VIEW public.hotels_public
WITH (security_invoker = true)
AS
SELECT 
  id, name, description, star_rating, address, city, country, 
  lat, lng, website, logo_url, images, amenities, 
  check_in_time, check_out_time, cancellation_policy, 
  rating, status, created_at
  -- EXCLUDED: owner_id, phone, email, commission_rate, total_bookings
FROM public.hotels
WHERE status = 'active';

-- Revoke direct access, grant view access
REVOKE ALL ON public.hotels FROM anon, public;
GRANT SELECT ON public.hotels_public TO authenticated;;
