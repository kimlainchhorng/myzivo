
CREATE INDEX IF NOT EXISTS idx_listings_tags_gin ON public.marketplace_listings USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON public.marketplace_listings(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_category_status_created
  ON public.marketplace_listings(category_id, status, created_at DESC);
;
