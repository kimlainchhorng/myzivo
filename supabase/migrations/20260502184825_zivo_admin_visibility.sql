-- Admin read access to the service pipeline tables
DROP POLICY IF EXISTS service_orders_admin_read       ON public.service_orders;
DROP POLICY IF EXISTS service_offers_admin_read       ON public.service_offers;
DROP POLICY IF EXISTS service_order_events_admin_read ON public.service_order_events;
DROP POLICY IF EXISTS zivo_payment_events_admin_read  ON public.zivo_payment_events;
DROP POLICY IF EXISTS zivo_notification_log_admin_read ON public.zivo_notification_log;
DROP POLICY IF EXISTS zivo_service_messages_admin_read ON public.zivo_service_messages;

CREATE POLICY service_orders_admin_read       ON public.service_orders       FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY service_offers_admin_read       ON public.service_offers       FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY service_order_events_admin_read ON public.service_order_events FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY zivo_payment_events_admin_read  ON public.zivo_payment_events  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY zivo_notification_log_admin_read ON public.zivo_notification_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY zivo_service_messages_admin_read ON public.zivo_service_messages FOR SELECT USING (public.is_admin(auth.uid()));

-- Admin can also UPDATE service_orders (force cancel, change status, etc.)
DROP POLICY IF EXISTS service_orders_admin_update ON public.service_orders;
CREATE POLICY service_orders_admin_update ON public.service_orders FOR UPDATE USING (public.is_admin(auth.uid()));;
