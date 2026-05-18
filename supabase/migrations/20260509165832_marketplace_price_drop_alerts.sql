
CREATE OR REPLACE FUNCTION public.notify_marketplace_price_drop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record;
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  IF NEW.price_cents IS NULL OR OLD.price_cents IS NULL THEN RETURN NEW; END IF;
  IF NEW.price_cents >= OLD.price_cents THEN RETURN NEW; END IF;

  FOR r IN
    SELECT user_id FROM public.marketplace_favorites
     WHERE listing_id = NEW.id AND user_id <> NEW.seller_id
  LOOP
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, metadata, status, event_type)
    VALUES (
      r.user_id, 'in_app', 'marketing',
      'Price drop on a saved listing',
      NEW.title || ' is now ' ||
        to_char((NEW.price_cents::numeric)/100, 'FM999990.00') ||
        ' (was ' || to_char((OLD.price_cents::numeric)/100, 'FM999990.00') || ')',
      '/marketplace?listing=' || NEW.id::text,
      jsonb_build_object('listing_id', NEW.id, 'old_cents', OLD.price_cents, 'new_cents', NEW.price_cents),
      'sent', 'marketplace.listing.price_drop'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_price_drop ON public.marketplace_listings;
CREATE TRIGGER trg_listing_price_drop
  AFTER UPDATE OF price_cents ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.notify_marketplace_price_drop();
;
