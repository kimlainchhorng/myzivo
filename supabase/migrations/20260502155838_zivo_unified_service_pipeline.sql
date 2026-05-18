-- Zivo Unified Service Pipeline

DO $$ BEGIN
  CREATE TYPE public.service_order_kind AS ENUM ('ride', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.service_order_status AS ENUM (
    'requested','shop_pending','shop_accepted','shop_rejected','preparing',
    'ready_for_pickup','searching','assigned','driver_en_route','driver_arrived',
    'picked_up','in_progress','completed','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.service_offer_status AS ENUM (
    'pending','accepted','declined','expired','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.service_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            public.service_order_kind NOT NULL,
  status          public.service_order_status NOT NULL DEFAULT 'requested',
  customer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id         UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  driver_id       UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_address  TEXT,
  pickup_lat      DOUBLE PRECISION,
  pickup_lng      DOUBLE PRECISION,
  dropoff_address TEXT NOT NULL,
  dropoff_lat     DOUBLE PRECISION,
  dropoff_lng     DOUBLE PRECISION,
  passenger_count INT,
  vehicle_class   TEXT,
  items           JSONB,
  special_notes   TEXT,
  subtotal_cents       INT NOT NULL DEFAULT 0,
  delivery_fee_cents   INT NOT NULL DEFAULT 0,
  service_fee_cents    INT NOT NULL DEFAULT 0,
  tip_cents            INT NOT NULL DEFAULT 0,
  total_cents          INT NOT NULL DEFAULT 0,
  currency             TEXT NOT NULL DEFAULT 'USD',
  distance_km          NUMERIC(8,2),
  duration_minutes     INT,
  estimated_pickup_at  TIMESTAMPTZ,
  estimated_dropoff_at TIMESTAMPTZ,
  shop_accepted_at     TIMESTAMPTZ,
  prepared_at          TIMESTAMPTZ,
  driver_assigned_at   TIMESTAMPTZ,
  picked_up_at         TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  cancellation_reason  TEXT,
  dispatch_attempts    INT NOT NULL DEFAULT 0,
  last_dispatch_at     TIMESTAMPTZ,
  rating_by_customer   INT CHECK (rating_by_customer BETWEEN 1 AND 5),
  rating_by_driver     INT CHECK (rating_by_driver BETWEEN 1 AND 5),
  payment_status       TEXT NOT NULL DEFAULT 'pending',
  payment_intent_id    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT service_orders_kind_shop_check CHECK (
    (kind = 'delivery' AND shop_id IS NOT NULL) OR
    (kind = 'ride'     AND shop_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON public.service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_driver   ON public.service_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_shop     ON public.service_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status   ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_kind_st  ON public.service_orders(kind, status);
CREATE INDEX IF NOT EXISTS idx_service_orders_created  ON public.service_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS public.service_offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  driver_id    UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  status       public.service_offer_status NOT NULL DEFAULT 'pending',
  distance_km  NUMERIC(8,2),
  payout_cents INT,
  expires_at   TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_service_offers_order   ON public.service_offers(order_id);
CREATE INDEX IF NOT EXISTS idx_service_offers_driver  ON public.service_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_service_offers_pending ON public.service_offers(driver_id, status, expires_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.service_order_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  actor_role  TEXT NOT NULL,
  actor_id    UUID,
  event_type  TEXT NOT NULL,
  from_status public.service_order_status,
  to_status   public.service_order_status,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_order_events_order ON public.service_order_events(order_id, created_at);

CREATE OR REPLACE FUNCTION public.tg_service_orders_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS service_orders_touch ON public.service_orders;
CREATE TRIGGER service_orders_touch
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_service_orders_touch();

ALTER TABLE public.service_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_offers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_orders_customer_read ON public.service_orders;
CREATE POLICY service_orders_customer_read ON public.service_orders FOR SELECT USING (customer_id = auth.uid());
DROP POLICY IF EXISTS service_orders_customer_insert ON public.service_orders;
CREATE POLICY service_orders_customer_insert ON public.service_orders FOR INSERT WITH CHECK (customer_id = auth.uid());
DROP POLICY IF EXISTS service_orders_customer_update ON public.service_orders;
CREATE POLICY service_orders_customer_update ON public.service_orders FOR UPDATE USING (customer_id = auth.uid());

DROP POLICY IF EXISTS service_orders_driver_read ON public.service_orders;
CREATE POLICY service_orders_driver_read ON public.service_orders FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS service_orders_driver_offer_read ON public.service_orders;
CREATE POLICY service_orders_driver_offer_read ON public.service_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.service_offers o
    WHERE o.order_id = service_orders.id
      AND o.driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
);
DROP POLICY IF EXISTS service_orders_driver_update ON public.service_orders;
CREATE POLICY service_orders_driver_update ON public.service_orders FOR UPDATE USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS service_orders_shop_read ON public.service_orders;
CREATE POLICY service_orders_shop_read ON public.service_orders FOR SELECT USING (
  shop_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS service_orders_shop_update ON public.service_orders;
CREATE POLICY service_orders_shop_update ON public.service_orders FOR UPDATE USING (
  shop_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS service_offers_driver_read ON public.service_offers;
CREATE POLICY service_offers_driver_read ON public.service_offers FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS service_offers_driver_update ON public.service_offers;
CREATE POLICY service_offers_driver_update ON public.service_offers FOR UPDATE USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS service_offers_customer_read ON public.service_offers;
CREATE POLICY service_offers_customer_read ON public.service_offers FOR SELECT USING (
  order_id IN (SELECT id FROM public.service_orders WHERE customer_id = auth.uid())
);

DROP POLICY IF EXISTS service_order_events_read ON public.service_order_events;
CREATE POLICY service_order_events_read ON public.service_order_events FOR SELECT USING (
  order_id IN (SELECT id FROM public.service_orders WHERE
    customer_id = auth.uid()
    OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR shop_id   IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.zivo_nearest_drivers(
  p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION,
  p_radius_km NUMERIC DEFAULT 10, p_limit INT DEFAULT 5
)
RETURNS TABLE (driver_id UUID, user_id UUID, distance_km NUMERIC, rating NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.id, d.user_id,
    (2 * 6371 * asin(sqrt(
      power(sin(radians((d.current_lat - p_lat) / 2)), 2) +
      cos(radians(p_lat)) * cos(radians(d.current_lat)) *
      power(sin(radians((d.current_lng - p_lng) / 2)), 2)
    )))::numeric AS distance_km,
    COALESCE(d.rating, 0)::numeric AS rating
  FROM public.drivers d
  WHERE d.is_online = true
    AND d.current_lat IS NOT NULL AND d.current_lng IS NOT NULL
    AND (2 * 6371 * asin(sqrt(
      power(sin(radians((d.current_lat - p_lat) / 2)), 2) +
      cos(radians(p_lat)) * cos(radians(d.current_lat)) *
      power(sin(radians((d.current_lng - p_lng) / 2)), 2)
    ))) <= p_radius_km
    AND NOT EXISTS (
      SELECT 1 FROM public.service_orders so
      WHERE so.driver_id = d.id
        AND so.status IN ('assigned','driver_en_route','driver_arrived','picked_up','in_progress')
    )
  ORDER BY distance_km ASC, rating DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.zivo_nearest_drivers TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.zivo_accept_offer(p_offer_id UUID)
RETURNS public.service_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_offer  public.service_offers%ROWTYPE;
  v_driver UUID;
  v_order  public.service_orders%ROWTYPE;
BEGIN
  SELECT id INTO v_driver FROM public.drivers WHERE user_id = auth.uid();
  IF v_driver IS NULL THEN RAISE EXCEPTION 'driver_not_found'; END IF;
  SELECT * INTO v_offer FROM public.service_offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND                     THEN RAISE EXCEPTION 'offer_not_found'; END IF;
  IF v_offer.driver_id <> v_driver THEN RAISE EXCEPTION 'offer_not_yours'; END IF;
  IF v_offer.status   <> 'pending' THEN RAISE EXCEPTION 'offer_not_pending'; END IF;
  IF v_offer.expires_at < NOW() THEN
    UPDATE public.service_offers SET status='expired' WHERE id = p_offer_id;
    RAISE EXCEPTION 'offer_expired';
  END IF;
  SELECT * INTO v_order FROM public.service_orders WHERE id = v_offer.order_id FOR UPDATE;
  IF v_order.driver_id IS NOT NULL THEN
    UPDATE public.service_offers SET status='cancelled' WHERE id = p_offer_id;
    RAISE EXCEPTION 'order_already_assigned';
  END IF;
  UPDATE public.service_offers SET status='accepted', responded_at=NOW() WHERE id = p_offer_id;
  UPDATE public.service_offers SET status='cancelled'
    WHERE order_id = v_offer.order_id AND id <> p_offer_id AND status='pending';
  UPDATE public.service_orders
     SET driver_id=v_driver, status='assigned', driver_assigned_at=NOW()
   WHERE id = v_offer.order_id RETURNING * INTO v_order;
  INSERT INTO public.service_order_events
    (order_id, actor_role, actor_id, event_type, from_status, to_status)
  VALUES
    (v_order.id, 'driver', auth.uid(), 'offer_accepted', 'searching', 'assigned');
  RETURN v_order;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_accept_offer(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.zivo_transition_status(
  p_order_id UUID, p_to_status public.service_order_status, p_meta JSONB DEFAULT NULL
)
RETURNS public.service_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order  public.service_orders%ROWTYPE;
  v_driver UUID;
  v_role   TEXT;
BEGIN
  SELECT * INTO v_order FROM public.service_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
  SELECT id INTO v_driver FROM public.drivers WHERE user_id = auth.uid();
  IF v_order.customer_id = auth.uid() THEN v_role := 'customer';
  ELSIF v_driver IS NOT NULL AND v_order.driver_id = v_driver THEN v_role := 'driver';
  ELSIF EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = v_order.shop_id AND r.owner_id = auth.uid()) THEN v_role := 'shop';
  ELSE RAISE EXCEPTION 'not_authorized'; END IF;
  UPDATE public.service_orders
     SET status            = p_to_status,
         shop_accepted_at  = CASE WHEN p_to_status = 'shop_accepted'    THEN NOW() ELSE shop_accepted_at  END,
         prepared_at       = CASE WHEN p_to_status = 'ready_for_pickup' THEN NOW() ELSE prepared_at       END,
         picked_up_at      = CASE WHEN p_to_status = 'picked_up'        THEN NOW() ELSE picked_up_at      END,
         completed_at      = CASE WHEN p_to_status = 'completed'        THEN NOW() ELSE completed_at      END,
         cancelled_at      = CASE WHEN p_to_status = 'cancelled'        THEN NOW() ELSE cancelled_at      END,
         cancellation_reason = CASE WHEN p_to_status = 'cancelled'      THEN COALESCE(p_meta->>'reason', cancellation_reason) ELSE cancellation_reason END
   WHERE id = p_order_id RETURNING * INTO v_order;
  INSERT INTO public.service_order_events
    (order_id, actor_role, actor_id, event_type, from_status, to_status, meta)
  VALUES
    (p_order_id, v_role, auth.uid(), 'status_changed', v_order.status, p_to_status, p_meta);
  RETURN v_order;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_transition_status(UUID, public.service_order_status, JSONB) TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='service_orders') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='service_offers') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.service_offers';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='service_order_events') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.service_order_events';
  END IF;
END $$;

ALTER TABLE public.service_orders       REPLICA IDENTITY FULL;
ALTER TABLE public.service_offers       REPLICA IDENTITY FULL;
ALTER TABLE public.service_order_events REPLICA IDENTITY FULL;
;
