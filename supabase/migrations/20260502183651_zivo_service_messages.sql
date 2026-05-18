-- In-app chat tied to service_orders. Each order can host messages between
-- customer, driver, and shop. Visibility scoped to participants by RLS.

CREATE TABLE IF NOT EXISTS public.zivo_service_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,                          -- 'customer' | 'driver' | 'shop'
  audience    TEXT NOT NULL DEFAULT 'all',            -- 'all' | 'customer_driver' | 'customer_shop'
  body        TEXT NOT NULL,
  attachments JSONB,                                  -- [{ type: 'image'|'voice'|'location', url, ... }]
  read_by     JSONB NOT NULL DEFAULT '[]'::jsonb,     -- array of user_ids who have seen it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zivo_msgs_order   ON public.zivo_service_messages(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_zivo_msgs_sender  ON public.zivo_service_messages(sender_id);

ALTER TABLE public.zivo_service_messages ENABLE ROW LEVEL SECURITY;

-- Read: anyone who can see the order (customer, assigned driver, shop owner)
CREATE POLICY zivo_msgs_read ON public.zivo_service_messages FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.service_orders WHERE
      customer_id = auth.uid()
      OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
      OR shop_id   IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  )
);

-- Insert: same audience scope, and the sender_id must be the caller
CREATE POLICY zivo_msgs_insert ON public.zivo_service_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND order_id IN (
    SELECT id FROM public.service_orders WHERE
      customer_id = auth.uid()
      OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
      OR shop_id   IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  )
);

-- Update: only the sender can edit read_by (mark-as-read also via RPC below)
CREATE POLICY zivo_msgs_update ON public.zivo_service_messages FOR UPDATE USING (
  sender_id = auth.uid()
);

-- Realtime
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='zivo_service_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.zivo_service_messages';
  END IF;
END $$;
ALTER TABLE public.zivo_service_messages REPLICA IDENTITY FULL;

-- Convenience RPC: send a message + auto-derive sender_role
CREATE OR REPLACE FUNCTION public.zivo_send_service_message(
  p_order_id    UUID,
  p_body        TEXT,
  p_audience    TEXT DEFAULT 'all',
  p_attachments JSONB DEFAULT NULL
)
RETURNS public.zivo_service_messages
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   public.service_orders%ROWTYPE;
  v_role    TEXT;
  v_driver  UUID;
  v_msg     public.zivo_service_messages%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_body IS NULL OR length(trim(p_body)) = 0 THEN RAISE EXCEPTION 'empty_body'; END IF;
  IF length(p_body) > 4000 THEN RAISE EXCEPTION 'body_too_long'; END IF;
  IF p_audience NOT IN ('all','customer_driver','customer_shop') THEN RAISE EXCEPTION 'invalid_audience'; END IF;

  SELECT * INTO v_order FROM public.service_orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;

  SELECT id INTO v_driver FROM public.drivers WHERE user_id = auth.uid();
  IF v_order.customer_id = auth.uid() THEN v_role := 'customer';
  ELSIF v_driver IS NOT NULL AND v_order.driver_id = v_driver THEN v_role := 'driver';
  ELSIF EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = v_order.shop_id AND r.owner_id = auth.uid()) THEN v_role := 'shop';
  ELSE RAISE EXCEPTION 'not_authorized'; END IF;

  INSERT INTO public.zivo_service_messages (order_id, sender_id, sender_role, audience, body, attachments)
  VALUES (p_order_id, auth.uid(), v_role, p_audience, p_body, p_attachments)
  RETURNING * INTO v_msg;

  RETURN v_msg;
END $$;

GRANT EXECUTE ON FUNCTION public.zivo_send_service_message(UUID, TEXT, TEXT, JSONB) TO authenticated;

-- Mark messages as read
CREATE OR REPLACE FUNCTION public.zivo_mark_messages_read(p_order_id UUID)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count INT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  WITH affected AS (
    UPDATE public.zivo_service_messages
       SET read_by = read_by || to_jsonb(auth.uid()::text)
     WHERE order_id = p_order_id
       AND sender_id <> auth.uid()
       AND NOT (read_by ? auth.uid()::text)
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM affected;
  RETURN v_count;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_mark_messages_read(UUID) TO authenticated;;
