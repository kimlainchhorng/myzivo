
-- Keep seller rating + total_reviews in sync on marketplace_seller_profiles
CREATE OR REPLACE FUNCTION public.recompute_seller_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_avg numeric;
  v_count int;
BEGIN
  v_seller := COALESCE(NEW.seller_id, OLD.seller_id);
  IF v_seller IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  SELECT COALESCE(AVG(rating)::numeric(3,2), 0), COUNT(*)::int
    INTO v_avg, v_count
    FROM public.marketplace_reviews WHERE seller_id = v_seller;

  -- Upsert profile so first review creates the row
  INSERT INTO public.marketplace_seller_profiles (user_id, store_name, rating, total_reviews)
  VALUES (v_seller, 'Seller', v_avg, v_count)
  ON CONFLICT (user_id) DO UPDATE
    SET rating = EXCLUDED.rating, total_reviews = EXCLUDED.total_reviews;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_review_rating_ins ON public.marketplace_reviews;
DROP TRIGGER IF EXISTS trg_review_rating_upd ON public.marketplace_reviews;
DROP TRIGGER IF EXISTS trg_review_rating_del ON public.marketplace_reviews;

CREATE TRIGGER trg_review_rating_ins
  AFTER INSERT ON public.marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recompute_seller_rating();
CREATE TRIGGER trg_review_rating_upd
  AFTER UPDATE ON public.marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recompute_seller_rating();
CREATE TRIGGER trg_review_rating_del
  AFTER DELETE ON public.marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recompute_seller_rating();

-- Counter-offer column on offers
ALTER TABLE public.marketplace_offers
  ADD COLUMN IF NOT EXISTS counter_amount_cents integer;
;
