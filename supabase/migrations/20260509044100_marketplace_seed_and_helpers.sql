
-- Seed top-level categories (idempotent on slug)
INSERT INTO public.marketplace_categories (name, slug, icon, sort_order, is_active) VALUES
  ('Electronics',    'electronics',    '📱', 10, true),
  ('Fashion',        'fashion',        '👗', 20, true),
  ('Home & Garden',  'home-garden',    '🏡', 30, true),
  ('Vehicles',       'vehicles',       '🚗', 40, true),
  ('Sports',         'sports',         '⚽', 50, true),
  ('Toys & Games',   'toys-games',     '🎮', 60, true),
  ('Books',          'books',          '📚', 70, true),
  ('Beauty',         'beauty',         '💄', 80, true),
  ('Baby & Kids',    'baby-kids',      '🍼', 90, true),
  ('Pets',           'pets',           '🐾', 100, true),
  ('Music',          'music',          '🎵', 110, true),
  ('Other',          'other',          '🏷️', 999, true)
ON CONFLICT (slug) DO NOTHING;

-- Atomic view increment RPC
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.marketplace_listings
     SET views_count = COALESCE(views_count, 0) + 1
   WHERE id = listing_id AND status = 'active';
$$;

GRANT EXECUTE ON FUNCTION public.increment_listing_views(uuid) TO anon, authenticated;

-- Keep favorites_count in sync via triggers
CREATE OR REPLACE FUNCTION public.handle_marketplace_favorite_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.marketplace_listings
       SET favorites_count = COALESCE(favorites_count, 0) + 1
     WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.marketplace_listings
       SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
     WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_fav_ins ON public.marketplace_favorites;
DROP TRIGGER IF EXISTS trg_marketplace_fav_del ON public.marketplace_favorites;

CREATE TRIGGER trg_marketplace_fav_ins
  AFTER INSERT ON public.marketplace_favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_favorite_change();

CREATE TRIGGER trg_marketplace_fav_del
  AFTER DELETE ON public.marketplace_favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_favorite_change();

-- Index hot paths
CREATE INDEX IF NOT EXISTS idx_listings_status_created
  ON public.marketplace_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_featured
  ON public.marketplace_listings(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_views
  ON public.marketplace_listings(views_count DESC NULLS LAST);
;
