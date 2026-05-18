-- Add affiliate tracking columns to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS affiliate_code TEXT,
ADD COLUMN IF NOT EXISTS affiliate_partner_id TEXT,
ADD COLUMN IF NOT EXISTS affiliate_partner_name TEXT,
ADD COLUMN IF NOT EXISTS affiliate_captured_at TIMESTAMPTZ;

-- Add index for partner referral queries
CREATE INDEX IF NOT EXISTS idx_restaurants_affiliate_code ON public.restaurants(affiliate_code) WHERE affiliate_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_affiliate_partner_id ON public.restaurants(affiliate_partner_id) WHERE affiliate_partner_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.restaurants.affiliate_code IS 'The full affiliate/partner code used during signup';
COMMENT ON COLUMN public.restaurants.affiliate_partner_id IS 'Partner identifier from click log';
COMMENT ON COLUMN public.restaurants.affiliate_partner_name IS 'Partner name for display';
COMMENT ON COLUMN public.restaurants.affiliate_captured_at IS 'When the affiliate code was captured';;
