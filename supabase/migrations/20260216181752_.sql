
-- 1. Add "arriving" to trip_status enum
ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'arriving' AFTER 'en_route';

-- 2. Fix security_events: allow SECURITY DEFINER / trigger inserts (no auth context)
DROP POLICY IF EXISTS "Insert own or system security events" ON public.security_events;
CREATE POLICY "Insert security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (
    (user_id = auth.uid()) OR 
    (user_id IS NULL)
  );
;
