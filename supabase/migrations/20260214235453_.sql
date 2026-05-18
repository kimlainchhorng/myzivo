-- Service-role-only config/log tables
CREATE POLICY "sr_all" ON public.cancel_policies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sr_all" ON public.dispatch_radius_stages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sr_all" ON public.risk_policies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sr_all" ON public.surge_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sr_all" ON public.dispatch_driver_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sr_all" ON public.stripe_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- driver_state_events: service role + drivers view own
CREATE POLICY "sr_all" ON public.driver_state_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Drivers view own state events" ON public.driver_state_events FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- payment_records: service role + customer/driver view own
CREATE POLICY "sr_all" ON public.payment_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Customers view own payments" ON public.payment_records FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Drivers view own payments" ON public.payment_records FOR SELECT TO authenticated USING (driver_id = auth.uid());;
