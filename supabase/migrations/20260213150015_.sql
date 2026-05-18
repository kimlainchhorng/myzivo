-- Extend restaurant_ads with targeting and ad type
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS ad_type text NOT NULL DEFAULT 'featured_listing';
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS target_city text;
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS target_zone text;
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.restaurant_ads ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.restaurant_ads.ad_type IS 'featured_listing, banner, search_promotion';
COMMENT ON COLUMN public.restaurant_ads.placement IS 'home_top, search_results, banner_carousel';;
