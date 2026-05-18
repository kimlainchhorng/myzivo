-- Fix remaining "permission denied" errors
GRANT SELECT ON public.system_incidents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;;
