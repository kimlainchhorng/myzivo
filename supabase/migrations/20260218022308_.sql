
-- Fix: Allow drivers and merchants to see their own support tickets
DROP POLICY IF EXISTS "zivo_tickets_select" ON public.support_tickets;
CREATE POLICY "zivo_tickets_select" ON public.support_tickets
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT auth.uid()))
    OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT auth.uid()))
    OR is_admin((SELECT auth.uid()))
    OR has_role((SELECT auth.uid()), 'support')
  );

-- Fix: Allow drivers and merchants to create support tickets
DROP POLICY IF EXISTS "zivo_tickets_insert" ON public.support_tickets;
CREATE POLICY "zivo_tickets_insert" ON public.support_tickets
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
    OR driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT auth.uid()))
    OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT auth.uid()))
    OR is_admin((SELECT auth.uid()))
  );

-- Also allow ticket submitters (driver/merchant) to see status updates via realtime
DROP POLICY IF EXISTS "sla_due_at" ON public.support_tickets;
;
