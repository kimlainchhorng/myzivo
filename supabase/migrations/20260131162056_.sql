-- HOTELS - Create secure view and tighten RLS
-- Problem: "Anyone can view active hotels" exposes email, phone, commission_rate

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active hotels" ON public.hotels;
DROP POLICY IF EXISTS "hotels_restricted" ON public.hotels;

-- Create restricted public view (no PII or financial data)
DROP VIEW IF EXISTS public.hotels_public;
CREATE VIEW public.hotels_public
WITH (security_invoker = true)
AS
SELECT 
  id, name, description, star_rating, address, city, country, 
  lat, lng, website, logo_url, images, amenities, 
  check_in_time, check_out_time, cancellation_policy, 
  rating, status, created_at
  -- Excludes: owner_id, phone, email, commission_rate, total_bookings
FROM public.hotels
WHERE status = 'active';

-- Create policy for authenticated users to see basic public info
CREATE POLICY "hotels_public_basic_select" ON public.hotels FOR SELECT TO authenticated
USING (
  status = 'active'
  OR owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

REVOKE ALL ON public.hotels FROM anon, public;
GRANT SELECT ON public.hotels_public TO authenticated;;
