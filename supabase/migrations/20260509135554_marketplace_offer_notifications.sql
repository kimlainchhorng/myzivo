
-- Notify the seller when a new offer arrives, and the buyer when their offer is responded to.
CREATE OR REPLACE FUNCTION public.notify_marketplace_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_title text;
  v_amount numeric;
BEGIN
  SELECT seller_id, title INTO v_seller, v_title
    FROM public.marketplace_listings WHERE id = NEW.listing_id;
  IF v_seller IS NULL THEN RETURN NEW; END IF;

  v_amount := (NEW.amount_cents::numeric) / 100.0;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, metadata, status, event_type)
    VALUES (
      v_seller, 'in_app', 'transactional',
      'New offer received',
      'You got an offer of $' || to_char(v_amount, 'FM999990.00') || ' for "' || coalesce(v_title,'your listing') || '"',
      '/marketplace?listing=' || NEW.listing_id::text,
      jsonb_build_object('listing_id', NEW.listing_id, 'offer_id', NEW.id, 'amount_cents', NEW.amount_cents),
      'sent', 'marketplace.offer.created'
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status
        AND NEW.status IN ('accepted','rejected') THEN
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, metadata, status, event_type)
    VALUES (
      NEW.buyer_id, 'in_app', 'transactional',
      'Offer ' || NEW.status,
      'Your offer of $' || to_char(v_amount, 'FM999990.00') || ' on "' || coalesce(v_title,'a listing') || '" was ' || NEW.status,
      '/marketplace?listing=' || NEW.listing_id::text,
      jsonb_build_object('listing_id', NEW.listing_id, 'offer_id', NEW.id, 'amount_cents', NEW.amount_cents, 'status', NEW.status),
      'sent', 'marketplace.offer.' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_offer_ins ON public.marketplace_offers;
DROP TRIGGER IF EXISTS trg_notify_offer_upd ON public.marketplace_offers;

CREATE TRIGGER trg_notify_offer_ins
  AFTER INSERT ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_marketplace_offer();

CREATE TRIGGER trg_notify_offer_upd
  AFTER UPDATE ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_marketplace_offer();
;
