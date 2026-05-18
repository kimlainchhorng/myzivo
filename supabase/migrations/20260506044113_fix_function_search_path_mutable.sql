-- Pin search_path on the 4 trigger functions flagged by the linter. Mutable
-- search_path is a SECURITY DEFINER vector: a malicious schema in the
-- caller's search_path could be matched before pg_catalog. Lock to public.
ALTER FUNCTION public.set_service_orders_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.tg_service_orders_touch() SET search_path = public, pg_temp;
ALTER FUNCTION public.tg_channel_post_comments_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.tg_cpc_likes_count() SET search_path = public, pg_temp;;
