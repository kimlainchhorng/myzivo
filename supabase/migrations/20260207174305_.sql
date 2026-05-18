-- Add ranking fields to restaurants table
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_rate numeric DEFAULT 0;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_restaurants_location
  ON public.restaurants(lat, lng) 
  WHERE status = 'active';

-- Create ranking view that joins restaurants with merchant_plans
CREATE OR REPLACE VIEW public.v_restaurant_rank AS
SELECT
  r.id,
  r.name,
  r.address,
  r.lat,
  r.lng,
  r.is_open,
  r.cuisine_type,
  r.description,
  r.logo_url,
  r.cover_image_url,
  r.rating,
  r.rating_count,
  r.avg_prep_time,
  r.cancel_rate,
  r.plan_code,
  r.status,
  r.phone,
  r.opening_hours,
  COALESCE(mp.placement_boost, 1.0) as placement_boost
FROM public.restaurants r
LEFT JOIN public.merchant_plans mp ON mp.code = r.plan_code
WHERE r.status = 'active'
  AND r.lat IS NOT NULL
  AND r.lng IS NOT NULL;;
