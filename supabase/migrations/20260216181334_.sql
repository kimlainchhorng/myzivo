
-- Fix overly permissive INSERT policies (retry)

-- 1. pricing_config_history: restrict INSERT to authenticated users
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.pricing_config_history;
CREATE POLICY "Authenticated insert pricing history"
  ON public.pricing_config_history
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. security_events: tighten INSERT
DROP POLICY IF EXISTS "System insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Users can insert own security events" ON public.security_events;
CREATE POLICY "Insert own or system security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND auth.uid() IS NOT NULL)
  );
;
