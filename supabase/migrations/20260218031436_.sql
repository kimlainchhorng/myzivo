
-- 1. Add support_tickets to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

-- 2. Allow ticket participants (customer/driver/merchant) to update last_message_at
-- This is needed so that when they send a message, the ticket's timestamp updates
DROP POLICY IF EXISTS "zivo_tickets_participant_update" ON public.support_tickets;
CREATE POLICY "zivo_tickets_participant_update" ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT auth.uid()))
    OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT auth.uid()))
    OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT auth.uid()))
  );
;
