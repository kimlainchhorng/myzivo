
-- Fix ai_conversation_flags: public -> service_role
DROP POLICY IF EXISTS "Admins manage flags" ON public.ai_conversation_flags;
CREATE POLICY "Service role manages flags" ON public.ai_conversation_flags
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix ai_faq_responses: public -> service_role
DROP POLICY IF EXISTS "Admins manage FAQ responses" ON public.ai_faq_responses;
CREATE POLICY "Service role manages FAQ responses" ON public.ai_faq_responses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix engagement_notifications: public -> service_role
DROP POLICY IF EXISTS "Service role full access" ON public.engagement_notifications;
CREATE POLICY "Service role manages engagement_notifications" ON public.engagement_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix gift_cards: public -> service_role
DROP POLICY IF EXISTS "Service role can manage gift cards" ON public.gift_cards;
CREATE POLICY "Service role manages gift cards" ON public.gift_cards
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix push_subscriptions: public -> service_role
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.push_subscriptions;
CREATE POLICY "Service role manages push subscriptions" ON public.push_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix sms_daily_limits: public -> service_role
DROP POLICY IF EXISTS "Service role can manage SMS limits" ON public.sms_daily_limits;
CREATE POLICY "Service role manages SMS limits" ON public.sms_daily_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix sms_otp_codes: public -> service_role
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.sms_otp_codes;
CREATE POLICY "Service role manages OTP codes" ON public.sms_otp_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix kyc_events: WITH CHECK(true) -> scoped to user
DROP POLICY IF EXISTS "Authenticated can insert kyc events" ON public.kyc_events;
CREATE POLICY "Users can insert own kyc events" ON public.kyc_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
;
