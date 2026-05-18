CREATE TABLE IF NOT EXISTS public.zivo_service_promo_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT UNIQUE NOT NULL,
  description       TEXT,
  discount_type     TEXT NOT NULL,
  discount_percent  NUMERIC(5,2),
  discount_flat_cents INT,
  max_discount_cents INT,
  min_subtotal_cents INT NOT NULL DEFAULT 0,
  applies_to        TEXT NOT NULL DEFAULT 'all',
  first_order_only  BOOLEAN NOT NULL DEFAULT false,
  max_total_redemptions  INT,
  max_per_customer       INT NOT NULL DEFAULT 1,
  current_redemptions    INT NOT NULL DEFAULT 0,
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zivo_svc_promo_active ON public.zivo_service_promo_codes(is_active, ends_at);

ALTER TABLE public.zivo_service_promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY zivo_svc_promo_public_read ON public.zivo_service_promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY zivo_svc_promo_admin_write ON public.zivo_service_promo_codes FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.zivo_service_promo_redemptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id      UUID NOT NULL REFERENCES public.zivo_service_promo_codes(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id      UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  discount_cents INT NOT NULL,
  redeemed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id)
);
CREATE INDEX IF NOT EXISTS idx_zivo_svc_promo_redemptions_user ON public.zivo_service_promo_redemptions(user_id, redeemed_at DESC);
ALTER TABLE public.zivo_service_promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY zivo_svc_promo_redemptions_self_read ON public.zivo_service_promo_redemptions FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS service_promo_code_id      UUID REFERENCES public.zivo_service_promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_promo_discount_cents INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.zivo_validate_service_promo(
  p_code TEXT, p_kind TEXT, p_subtotal_cents INT, p_delivery_fee_cents INT DEFAULT 0
) RETURNS TABLE (
  promo_id UUID, discount_cents INT, applies_to_fee BOOLEAN, description TEXT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_promo public.zivo_service_promo_codes%ROWTYPE;
  v_discount INT := 0;
  v_user UUID := auth.uid();
  v_used INT;
  v_first_order BOOLEAN := false;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF p_kind NOT IN ('ride','delivery') THEN RAISE EXCEPTION 'invalid_kind'; END IF;

  SELECT * INTO v_promo FROM public.zivo_service_promo_codes
   WHERE code = upper(p_code) AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'promo_not_found'; END IF;
  IF v_promo.starts_at IS NOT NULL AND v_promo.starts_at > NOW() THEN RAISE EXCEPTION 'promo_not_started'; END IF;
  IF v_promo.ends_at   IS NOT NULL AND v_promo.ends_at   < NOW() THEN RAISE EXCEPTION 'promo_expired'; END IF;
  IF v_promo.applies_to <> 'all' AND v_promo.applies_to <> p_kind THEN RAISE EXCEPTION 'promo_wrong_kind'; END IF;
  IF p_subtotal_cents < v_promo.min_subtotal_cents THEN RAISE EXCEPTION 'promo_min_subtotal_not_met'; END IF;
  IF v_promo.max_total_redemptions IS NOT NULL AND v_promo.current_redemptions >= v_promo.max_total_redemptions THEN
    RAISE EXCEPTION 'promo_exhausted';
  END IF;
  SELECT count(*) INTO v_used FROM public.zivo_service_promo_redemptions r
    WHERE r.promo_id = v_promo.id AND r.user_id = v_user;
  IF v_used >= v_promo.max_per_customer THEN RAISE EXCEPTION 'promo_already_used'; END IF;
  IF v_promo.first_order_only THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.service_orders so
      WHERE so.customer_id = v_user
        AND so.status NOT IN ('cancelled','shop_rejected')
    ) INTO v_first_order;
    IF NOT v_first_order THEN RAISE EXCEPTION 'promo_first_order_only'; END IF;
  END IF;
  CASE v_promo.discount_type
    WHEN 'percent' THEN
      v_discount := floor((p_subtotal_cents * COALESCE(v_promo.discount_percent, 0)) / 100);
      IF v_promo.max_discount_cents IS NOT NULL AND v_discount > v_promo.max_discount_cents THEN
        v_discount := v_promo.max_discount_cents;
      END IF;
    WHEN 'flat' THEN
      v_discount := COALESCE(v_promo.discount_flat_cents, 0);
    WHEN 'free_delivery' THEN
      v_discount := COALESCE(p_delivery_fee_cents, 0);
    ELSE
      RAISE EXCEPTION 'invalid_discount_type';
  END CASE;
  v_discount := GREATEST(0, LEAST(v_discount, p_subtotal_cents + p_delivery_fee_cents));
  RETURN QUERY SELECT v_promo.id, v_discount, (v_promo.discount_type = 'free_delivery'), v_promo.description;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_validate_service_promo(TEXT, TEXT, INT, INT) TO authenticated;

CREATE OR REPLACE FUNCTION public.zivo_redeem_service_promo(
  p_promo_id UUID, p_order_id UUID, p_discount_cents INT
) RETURNS public.zivo_service_promo_redemptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.zivo_service_promo_redemptions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_discount_cents <= 0 THEN RAISE EXCEPTION 'invalid_discount'; END IF;
  INSERT INTO public.zivo_service_promo_redemptions (promo_id, user_id, order_id, discount_cents)
  VALUES (p_promo_id, auth.uid(), p_order_id, p_discount_cents)
  RETURNING * INTO v_row;
  UPDATE public.zivo_service_promo_codes
     SET current_redemptions = current_redemptions + 1
   WHERE id = p_promo_id;
  RETURN v_row;
END $$;
GRANT EXECUTE ON FUNCTION public.zivo_redeem_service_promo(UUID, UUID, INT) TO authenticated;;
