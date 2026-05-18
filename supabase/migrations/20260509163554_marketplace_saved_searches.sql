
CREATE TABLE IF NOT EXISTS public.marketplace_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  query TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, label)
);
CREATE INDEX IF NOT EXISTS idx_market_saved_user ON public.marketplace_saved_searches(user_id);
ALTER TABLE public.marketplace_saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own saved searches" ON public.marketplace_saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert saved searches" ON public.marketplace_saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update saved searches" ON public.marketplace_saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete saved searches" ON public.marketplace_saved_searches FOR DELETE USING (auth.uid() = user_id);

-- Notify subscribers when new listing matches their saved-search query
CREATE OR REPLACE FUNCTION public.notify_saved_search_matches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT id, user_id, label, query
      FROM public.marketplace_saved_searches
     WHERE alerts_enabled = true
       AND user_id <> NEW.seller_id
       AND query IS NOT NULL AND length(trim(query)) > 0
       AND (lower(NEW.title) LIKE '%' || lower(query) || '%'
         OR lower(coalesce(NEW.description,'')) LIKE '%' || lower(query) || '%')
       AND (last_alerted_at IS NULL OR last_alerted_at < now() - interval '15 minutes')
  LOOP
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, metadata, status, event_type)
    VALUES (
      r.user_id, 'in_app', 'marketing',
      'New match for "' || r.label || '"',
      NEW.title,
      '/marketplace?listing=' || NEW.id::text,
      jsonb_build_object('saved_search_id', r.id, 'listing_id', NEW.id),
      'sent', 'marketplace.saved_search.match'
    );
    UPDATE public.marketplace_saved_searches SET last_alerted_at = now() WHERE id = r.id;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_saved_search_match ON public.marketplace_listings;
CREATE TRIGGER trg_saved_search_match
  AFTER INSERT ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.notify_saved_search_matches();
;
