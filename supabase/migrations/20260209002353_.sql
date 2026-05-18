-- Continue adding RLS policies to remaining tables

-- ========================================
-- AD TRACKING (analytics data)
-- ========================================

-- ad_clicks: Track ad clicks
CREATE POLICY "Service role manages ad clicks"
ON public.ad_clicks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view ad clicks"
ON public.ad_clicks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Restaurant owners can view their ad clicks"
ON public.ad_clicks FOR SELECT
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);

-- ad_impressions: Track ad impressions
CREATE POLICY "Service role manages ad impressions"
ON public.ad_impressions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view ad impressions"
ON public.ad_impressions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Restaurant owners can view their ad impressions"
ON public.ad_impressions FOR SELECT
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);

-- restaurant_ads: Restaurant advertising
CREATE POLICY "Restaurant owners can manage their ads"
ON public.restaurant_ads FOR ALL
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all restaurant ads"
ON public.restaurant_ads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- DRIVER FINANCIAL DATA (driver-scoped + admin)
-- ========================================

-- driver_balances: Driver wallet balances
CREATE POLICY "Drivers can view own balance"
ON public.driver_balances FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages driver balances"
ON public.driver_balances FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all driver balances"
ON public.driver_balances FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- driver_cashouts: Driver withdrawal requests
CREATE POLICY "Drivers can view own cashouts"
ON public.driver_cashouts FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can request cashouts"
ON public.driver_cashouts FOR INSERT
TO authenticated
WITH CHECK (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages cashouts"
ON public.driver_cashouts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can manage all cashouts"
ON public.driver_cashouts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- driver_payout_settings: Driver payout preferences
CREATE POLICY "Drivers can view own payout settings"
ON public.driver_payout_settings FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can manage own payout settings"
ON public.driver_payout_settings FOR ALL
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payout settings"
ON public.driver_payout_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- driver_payouts: Completed payouts
CREATE POLICY "Drivers can view own payouts"
ON public.driver_payouts FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages payouts"
ON public.driver_payouts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all payouts"
ON public.driver_payouts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- driver_statuses: Real-time driver status
CREATE POLICY "Drivers can view own status"
ON public.driver_statuses FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can update own status"
ON public.driver_statuses FOR UPDATE
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages driver statuses"
ON public.driver_statuses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- driver_stripe: Stripe Connect accounts
CREATE POLICY "Drivers can view own Stripe info"
ON public.driver_stripe FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages driver Stripe"
ON public.driver_stripe FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all driver Stripe"
ON public.driver_stripe FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- driver_weekly_earnings: Weekly earnings summary
CREATE POLICY "Drivers can view own weekly earnings"
ON public.driver_weekly_earnings FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages weekly earnings"
ON public.driver_weekly_earnings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all weekly earnings"
ON public.driver_weekly_earnings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- PAYOUT MANAGEMENT (service role + admin)
-- ========================================

-- payout_holds: Temporary payout holds
CREATE POLICY "Service role manages payout holds"
ON public.payout_holds FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can manage payout holds"
ON public.payout_holds FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- payout_items: Individual payout line items
CREATE POLICY "Service role manages payout items"
ON public.payout_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view payout items"
ON public.payout_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- payout_notifications: Payout communication
CREATE POLICY "Drivers can view own payout notifications"
ON public.payout_notifications FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages payout notifications"
ON public.payout_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- USER DATA (user-scoped)
-- ========================================

-- credit_ledger: User credit transactions
CREATE POLICY "Users can view own credit ledger"
ON public.credit_ledger FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages credit ledger"
ON public.credit_ledger FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all credit ledgers"
ON public.credit_ledger FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- device_sessions: User device tracking
CREATE POLICY "Users can view own device sessions"
ON public.device_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own device sessions"
ON public.device_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages device sessions"
ON public.device_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- referral_codes: User referral codes
CREATE POLICY "Users can view own referral code"
ON public.referral_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral code"
ON public.referral_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages referral codes"
ON public.referral_codes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- referrals: Referral tracking
CREATE POLICY "Users can view referrals they made"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can view referrals they received"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referee_user_id);

CREATE POLICY "Service role manages referrals"
ON public.referrals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- user_documents: User uploaded documents
CREATE POLICY "Users can view own documents"
ON public.user_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
ON public.user_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON public.user_documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user documents"
ON public.user_documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- KYC/VERIFICATION (user + admin)
-- ========================================

-- kyc_submissions: User verification submissions
CREATE POLICY "Users can view own KYC submissions"
ON public.kyc_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC submissions"
ON public.kyc_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending KYC"
ON public.kyc_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all KYC submissions"
ON public.kyc_submissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- kyc_events: KYC audit trail
CREATE POLICY "Users can view own KYC events"
ON public.kyc_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages KYC events"
ON public.kyc_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all KYC events"
ON public.kyc_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- OPERATIONAL (service role + context)
-- ========================================

-- document_reminders: Automated reminders
CREATE POLICY "Service role manages document reminders"
ON public.document_reminders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view document reminders"
ON public.document_reminders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- notification_audit: Notification tracking
CREATE POLICY "Users can view own notification audit"
ON public.notification_audit FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages notification audit"
ON public.notification_audit FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- order_timers: Automated order actions
CREATE POLICY "Service role manages order timers"
ON public.order_timers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view order timers"
ON public.order_timers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ride_offers: Driver ride offers
CREATE POLICY "Drivers can view offers for them"
ON public.ride_offers FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can respond to offers"
ON public.ride_offers FOR UPDATE
TO authenticated
USING (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages ride offers"
ON public.ride_offers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);;
