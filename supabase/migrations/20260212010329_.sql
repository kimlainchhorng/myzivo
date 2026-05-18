
-- Add new columns to featured_listings
ALTER TABLE public.featured_listings
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'featured',
  ADD COLUMN IF NOT EXISTS max_redemptions integer,
  ADD COLUMN IF NOT EXISTS impressions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0;
;
