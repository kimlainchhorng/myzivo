
-- Fix: Restrict order_events SELECT to order participants or admins
DROP POLICY IF EXISTS "Authenticated users can read order events" ON public.order_events;

CREATE POLICY "Order participants can read order events" ON public.order_events
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.food_orders fo
      WHERE fo.id = order_events.order_id
        AND (
          fo.customer_id = auth.uid()
          OR fo.driver_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = fo.restaurant_id
              AND r.owner_id = auth.uid()
          )
        )
    )
  );
;
