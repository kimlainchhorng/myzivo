-- Grant permissions on tables with "permission denied" errors
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT SELECT ON public.supported_languages TO anon, authenticated;
GRANT SELECT ON public.system_incidents TO authenticated;
GRANT SELECT ON public.zivo_subscriptions TO authenticated;
GRANT SELECT, INSERT ON public.automated_message_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.food_orders TO authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.eats_zones TO anon, authenticated;;
