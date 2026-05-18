
CREATE OR REPLACE FUNCTION public.bump_marketplace_listing(listing_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_last  timestamptz;
  v_now   timestamptz := now();
BEGIN
  SELECT seller_id, updated_at INTO v_seller, v_last
  FROM public.marketplace_listings WHERE id = listing_id;

  IF v_seller IS NULL THEN
    RAISE EXCEPTION 'listing not found';
  END IF;
  IF v_seller <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  IF v_last IS NOT NULL AND v_now - v_last < interval '24 hours' THEN
    RAISE EXCEPTION 'You can bump once per 24h';
  END IF;

  UPDATE public.marketplace_listings
     SET created_at = v_now, updated_at = v_now
   WHERE id = listing_id AND status = 'active';

  RETURN v_now;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bump_marketplace_listing(uuid) TO authenticated;
;
