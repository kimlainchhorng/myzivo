
-- RLS POLICIES FOR 75 UNPROTECTED TABLES

-- FINANCIAL / SENSITIVE ADMIN TABLES
CREATE POLICY "Admins can read financial snapshots" ON public.financial_snapshots FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read tax records" ON public.tax_records FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read settlements" ON public.settlements FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read disputes" ON public.disputes FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage disputes" ON public.disputes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can read risk signals" ON public.risk_signals FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read trust scores" ON public.trust_scores FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage invitations" ON public.admin_invitations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can read verifications" ON public.verifications FOR SELECT TO authenticated USING (public.is_admin());

-- OPERATIONAL TABLES
CREATE POLICY "Admins can read dispatch logs" ON public.dispatch_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read dispatch AI logs" ON public.dispatch_ai_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read reassignment logs" ON public.reassignment_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order delays" ON public.order_delays FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read system alerts" ON public.system_alerts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read system metrics" ON public.system_metrics FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read service health" ON public.service_health FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read live metrics" ON public.live_metrics FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read growth metrics" ON public.growth_metrics FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read growth actions" ON public.growth_actions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read demand metrics" ON public.demand_metrics FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read zone demand" ON public.zone_demand FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read zone pricing rates" ON public.zone_pricing_rates FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read surge events" ON public.surge_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read auto operations" ON public.auto_operations FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read automation events" ON public.automation_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read eta logs" ON public.eta_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read eta predictions" ON public.eta_predictions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read route metrics" ON public.route_metrics FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read leaderboard snapshots" ON public.leaderboard_snapshots FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read earnings forecasts" ON public.earnings_forecasts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read sync logs" ON public.sync_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read geofence events" ON public.geofence_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read driver locations history" ON public.driver_locations_history FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read driver shift assignments" ON public.driver_shift_assignments FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read driver incentives" ON public.driver_incentives FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read driver incentive progress" ON public.driver_incentive_progress FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read restaurant prep logs" ON public.restaurant_prep_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read positioning suggestions" ON public.positioning_suggestions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read search logs" ON public.search_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read voice events" ON public.voice_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read retention events" ON public.retention_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read activity feed" ON public.activity_feed FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read AI conversations" ON public.ai_conversations FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can read own AI conversations" ON public.ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read affiliate events" ON public.affiliate_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order messages" ON public.order_messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order status history" ON public.order_status_history FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order timeline" ON public.order_timeline FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order stops" ON public.order_stops FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read group orders" ON public.group_orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read group order members" ON public.group_order_members FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order batches" ON public.order_batches FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read order bundles" ON public.order_bundles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read bundle orders" ON public.bundle_orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read trip bundles" ON public.trip_bundles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read support sessions" ON public.support_sessions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read service usage" ON public.service_usage FOR SELECT TO authenticated USING (public.is_admin());

-- USER-FACING TABLES
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own loyalty" ON public.user_loyalty FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own memberships" ON public.user_memberships FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own recommendation logs" ON public.user_recommendation_logs FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own rewards" ON public.rewards FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own coupon redemptions" ON public.coupon_redemptions FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Users can read own gift card redemptions" ON public.gift_card_redemptions FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- REFERENCE / CONFIG TABLES (public read)
CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read zones" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read languages" ON public.languages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read currencies" ON public.currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read loyalty tiers" ON public.loyalty_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT TO authenticated USING (true);
;
