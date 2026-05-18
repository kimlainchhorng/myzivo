ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS payment_authorized_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_captured_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_refunded_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS eta_pickup_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eta_dropoff_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eta_updated_at         TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_service_orders_payment_intent
  ON public.service_orders(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.zivo_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  payment_intent_id TEXT,
  event_type TEXT NOT NULL,
  amount_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zivo_payment_events_order ON public.zivo_payment_events(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_zivo_payment_events_pi ON public.zivo_payment_events(payment_intent_id);
ALTER TABLE public.zivo_payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY zivo_payment_events_read ON public.zivo_payment_events FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.service_orders WHERE
      customer_id = auth.uid()
      OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
      OR shop_id   IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  )
);

CREATE TABLE IF NOT EXISTS public.zivo_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  platform TEXT NOT NULL,
  endpoint TEXT,
  p256dh TEXT,
  auth_secret TEXT,
  fcm_token TEXT,
  apns_token TEXT,
  device_id TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (user_id, role, platform, device_id)
);
CREATE INDEX IF NOT EXISTS idx_zivo_push_user ON public.zivo_push_subscriptions(user_id, role) WHERE is_active = true;
ALTER TABLE public.zivo_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY zivo_push_self_read   ON public.zivo_push_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY zivo_push_self_insert ON public.zivo_push_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY zivo_push_self_update ON public.zivo_push_subscriptions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY zivo_push_self_delete ON public.zivo_push_subscriptions FOR DELETE USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.zivo_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT,
  body TEXT,
  payload JSONB,
  delivered BOOLEAN NOT NULL DEFAULT true,
  error_msg TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zivo_notif_log_user  ON public.zivo_notification_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zivo_notif_log_order ON public.zivo_notification_log(order_id, created_at DESC);
ALTER TABLE public.zivo_notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY zivo_notif_log_self_read ON public.zivo_notification_log FOR SELECT USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.record_push_subscription(
  p_role TEXT, p_platform TEXT,
  p_endpoint TEXT DEFAULT NULL, p_p256dh TEXT DEFAULT NULL, p_auth_secret TEXT DEFAULT NULL,
  p_fcm_token TEXT DEFAULT NULL, p_apns_token TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL
) RETURNS public.zivo_push_subscriptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.zivo_push_subscriptions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_role NOT IN ('customer','driver','shop') THEN RAISE EXCEPTION 'invalid_role'; END IF;
  IF p_platform NOT IN ('web','ios','android','capacitor') THEN RAISE EXCEPTION 'invalid_platform'; END IF;
  INSERT INTO public.zivo_push_subscriptions
    (user_id, role, platform, endpoint, p256dh, auth_secret, fcm_token, apns_token, device_id, user_agent)
  VALUES
    (auth.uid(), p_role, p_platform, p_endpoint, p_p256dh, p_auth_secret, p_fcm_token, p_apns_token, p_device_id, p_user_agent)
  ON CONFLICT (user_id, role, platform, device_id) DO UPDATE
    SET endpoint     = EXCLUDED.endpoint,
        p256dh       = EXCLUDED.p256dh,
        auth_secret  = EXCLUDED.auth_secret,
        fcm_token    = EXCLUDED.fcm_token,
        apns_token   = EXCLUDED.apns_token,
        user_agent   = EXCLUDED.user_agent,
        is_active    = true,
        last_seen_at = NOW()
  RETURNING * INTO v_row;
  RETURN v_row;
END $$;
GRANT EXECUTE ON FUNCTION public.record_push_subscription(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.zivo_driver_heartbeat(
  p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION
) RETURNS public.drivers
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_driver public.drivers%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_lat IS NULL OR p_lng IS NULL THEN RAISE EXCEPTION 'invalid_coords'; END IF;
  IF p_lat < -90  OR p_lat > 90  THEN RAISE EXCEPTION 'invalid_lat'; END IF;
  IF p_lng < -180 OR p_lng > 180 THEN RAISE EXCEPTION 'invalid_lng'; END IF;
  UPDATE public.drivers
     SET current_lat = p_lat, current_lng = p_lng, updated_at = NOW()
   WHERE user_id = auth.uid()
   RETURNING * INTO v_driver;
  IF NOT FOUND THEN RAISE EXCEPTION 'driver_not_found'; END IF;
  RETURN v_driver;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_driver_heartbeat(DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='zivo_payment_events') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.zivo_payment_events';
  END IF;
END $$;
ALTER TABLE public.zivo_payment_events REPLICA IDENTITY FULL;;
