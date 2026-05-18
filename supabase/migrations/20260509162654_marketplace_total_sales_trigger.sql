
CREATE OR REPLACE FUNCTION public.bump_seller_total_sales()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
    INSERT INTO public.marketplace_seller_profiles (user_id, store_name, total_sales)
    VALUES (NEW.seller_id, 'Seller', 1)
    ON CONFLICT (user_id) DO UPDATE
      SET total_sales = COALESCE(public.marketplace_seller_profiles.total_sales, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_sold_bump_sales ON public.marketplace_listings;
CREATE TRIGGER trg_listing_sold_bump_sales
  AFTER UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.bump_seller_total_sales();
;
