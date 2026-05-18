
-- When an offer is accepted, automatically:
--  1. Mark the listing as sold
--  2. Reject other pending offers on the same listing
CREATE OR REPLACE FUNCTION public.handle_offer_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    UPDATE public.marketplace_listings
       SET status = 'sold', updated_at = now()
     WHERE id = NEW.listing_id AND status = 'active';

    UPDATE public.marketplace_offers
       SET status = 'rejected', responded_at = now()
     WHERE listing_id = NEW.listing_id
       AND id <> NEW.id
       AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offer_accepted ON public.marketplace_offers;
CREATE TRIGGER trg_offer_accepted
  AFTER UPDATE ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_offer_accepted();
;
