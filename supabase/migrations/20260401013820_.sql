
-- Fix 3: Scope group_order_sessions SELECT to participants only
DROP POLICY IF EXISTS "Anyone can view group order sessions" ON public.group_order_sessions;
DROP POLICY IF EXISTS "Public can view group order sessions" ON public.group_order_sessions;
DROP POLICY IF EXISTS "group_order_sessions_select" ON public.group_order_sessions;

CREATE POLICY "Users can view own group order sessions"
ON public.group_order_sessions
FOR SELECT
TO authenticated
USING (
  host_user_id = auth.uid()
  OR id IN (SELECT session_id FROM public.group_order_items WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3b: Scope group_order_items SELECT to session participants
DROP POLICY IF EXISTS "Anyone can view group order items" ON public.group_order_items;
DROP POLICY IF EXISTS "Public can view group order items" ON public.group_order_items;
DROP POLICY IF EXISTS "group_order_items_select" ON public.group_order_items;

CREATE POLICY "Users can view own group order items"
ON public.group_order_items
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR session_id IN (SELECT id FROM public.group_order_sessions WHERE host_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);
;
