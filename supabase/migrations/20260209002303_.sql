-- Add RLS policies to tables that have RLS enabled but no policies
-- Grouped by access pattern for security

-- ========================================
-- ADMIN-ONLY TABLES (sensitive system data)
-- ========================================

-- admin_actions: Admin audit logs
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert admin actions"
ON public.admin_actions FOR INSERT
TO service_role
WITH CHECK (true);

-- analytics_daily: Platform analytics
CREATE POLICY "Admins can view analytics"
ON public.analytics_daily FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages analytics"
ON public.analytics_daily FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- backup_runs: System backups
CREATE POLICY "Admins can view backup runs"
ON public.backup_runs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages backups"
ON public.backup_runs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- blocked_entities: Fraud prevention
CREATE POLICY "Admins can manage blocked entities"
ON public.blocked_entities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages blocked entities"
ON public.blocked_entities FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- fee_settings: Platform configuration
CREATE POLICY "Admins can view fee settings"
ON public.fee_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fee settings"
ON public.fee_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- marketing_campaigns: Admin marketing
CREATE POLICY "Admins can manage marketing campaigns"
ON public.marketing_campaigns FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- marketing_campaign_stats: Marketing analytics
CREATE POLICY "Admins can view campaign stats"
ON public.marketing_campaign_stats FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages campaign stats"
ON public.marketing_campaign_stats FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- payout_settings: Global payout config
CREATE POLICY "Admins can view payout settings"
ON public.payout_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage payout settings"
ON public.payout_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- risk_scores: Fraud detection
CREATE POLICY "Admins can view risk scores"
ON public.risk_scores FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages risk scores"
ON public.risk_scores FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- surge_history: Pricing history
CREATE POLICY "Admins can view surge history"
ON public.surge_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages surge history"
ON public.surge_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- surge_multipliers: Dynamic pricing
CREATE POLICY "Admins can manage surge multipliers"
ON public.surge_multipliers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- WEBHOOK/INTEGRATION TABLES (service role only)
-- ========================================

-- square_webhook_events
CREATE POLICY "Service role manages Square webhooks"
ON public.square_webhook_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- stripe_event_log
CREATE POLICY "Service role manages Stripe events"
ON public.stripe_event_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view Stripe events"
ON public.stripe_event_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- stripe_connect_accounts
CREATE POLICY "Service role manages Stripe Connect"
ON public.stripe_connect_accounts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view Stripe Connect accounts"
ON public.stripe_connect_accounts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- PRICING/ZONES (public read, admin write)
-- ========================================

-- bonus_zones
CREATE POLICY "Anyone can view active bonus zones"
ON public.bonus_zones FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage bonus zones"
ON public.bonus_zones FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- city_pricing
CREATE POLICY "Anyone can view active city pricing"
ON public.city_pricing FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage city pricing"
ON public.city_pricing FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- long_trip_discounts
CREATE POLICY "Anyone can view long trip discounts"
ON public.long_trip_discounts FOR SELECT
USING (true);

CREATE POLICY "Admins can manage long trip discounts"
ON public.long_trip_discounts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- pricing_multipliers
CREATE POLICY "Anyone can view pricing multipliers"
ON public.pricing_multipliers FOR SELECT
USING (true);

CREATE POLICY "Admins can manage pricing multipliers"
ON public.pricing_multipliers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- pricing_zones
CREATE POLICY "Anyone can view active pricing zones"
ON public.pricing_zones FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing zones"
ON public.pricing_zones FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- MEMBERSHIP (public plans, user-scoped subscriptions)
-- ========================================

-- membership_plans
CREATE POLICY "Anyone can view active membership plans"
ON public.membership_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage membership plans"
ON public.membership_plans FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- memberships
CREATE POLICY "Users can view own memberships"
ON public.memberships FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages memberships"
ON public.memberships FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all memberships"
ON public.memberships FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));;
