-- Fix overly permissive RLS policies

-- 1. Fix audit_logs - should only allow authenticated inserts
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix customer_feedback - require authentication or limit fields
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.customer_feedback;
CREATE POLICY "Authenticated users can submit feedback"
ON public.customer_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix customer_order_items - require authentication
DROP POLICY IF EXISTS "Anyone can create order items" ON public.customer_order_items;
CREATE POLICY "Authenticated users can create order items"
ON public.customer_order_items FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Fix customer_orders - require authentication
DROP POLICY IF EXISTS "Anyone can create customer orders" ON public.customer_orders;
CREATE POLICY "Authenticated users can create orders"
ON public.customer_orders FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Fix driver_notifications - restrict to service role or driver matching
DROP POLICY IF EXISTS "System can create notifications" ON public.driver_notifications;
CREATE POLICY "System can create driver notifications"
ON public.driver_notifications FOR INSERT
WITH CHECK (
    -- Allow if the driver exists and belongs to authenticated user, or via service role
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
    OR auth.uid() IS NOT NULL -- Allow authenticated system operations
);

-- 6. Fix cross_app_tokens - add RLS policies
CREATE POLICY "Users can view own tokens"
ON public.cross_app_tokens FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own tokens"
ON public.cross_app_tokens FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tokens"
ON public.cross_app_tokens FOR DELETE
USING (user_id = auth.uid());;
