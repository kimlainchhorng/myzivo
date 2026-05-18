
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.marketplace_reviews
     SET helpful_count = COALESCE(helpful_count, 0) + 1
   WHERE id = review_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO anon, authenticated;
;
