-- Loyalty auto-award system. Until now nobody awarded loyalty points
-- anywhere — useLoyaltyPoints.earnPoints exists in the client but is
-- never called, so every user sees 0 points forever.
--
-- Approach: server-side AFTER UPDATE triggers on the completion of
-- food orders, rides, and lodging stays. Idempotent via a
-- `loyalty_award_events` log keyed on (source_type, source_id).
-- Tier is recomputed from lifetime_points after each award.

CREATE TABLE IF NOT EXISTS public.loyalty_award_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,      -- 'food','ride','lodging','grocery','tip','referral','manual'
  source_id   TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  base_points INTEGER NOT NULL,
  tier_bonus  INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL,
  tier_at_award TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_award_events_user
  ON public.loyalty_award_events (user_id, created_at DESC);

ALTER TABLE public.loyalty_award_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "loyalty_award_events_read_own" ON public.loyalty_award_events;
CREATE POLICY "loyalty_award_events_read_own"
  ON public.loyalty_award_events FOR SELECT
  USING (user_id = auth.uid());

-- Award X cents → returns total points actually awarded (0 on duplicate).
-- 1 base point per dollar. Tier multiplier: bronze=0%, silver=10%, gold=20%, platinum=30%.
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  p_user_id uuid,
  p_amount_cents bigint,
  p_source_type text,
  p_source_id text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing uuid;
  v_base int;
  v_bonus int;
  v_total int;
  v_tier text;
  v_lifetime int;
  v_new_balance int;
  v_new_lifetime int;
  v_new_tier text;
BEGIN
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN RETURN 0; END IF;
  IF p_user_id IS NULL THEN RETURN 0; END IF;

  -- Idempotency
  SELECT id INTO v_existing FROM public.loyalty_award_events
   WHERE source_type = p_source_type AND source_id = p_source_id;
  IF v_existing IS NOT NULL THEN RETURN 0; END IF;

  -- Ensure account exists
  INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points, tier)
  VALUES (p_user_id, 0, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1 FROM public.loyalty_points WHERE user_id = p_user_id FOR UPDATE;

  SELECT tier, lifetime_points INTO v_tier, v_lifetime
  FROM public.loyalty_points WHERE user_id = p_user_id;

  v_base := floor(p_amount_cents / 100.0)::int;
  v_bonus := CASE LOWER(COALESCE(v_tier, 'bronze'))
    WHEN 'silver'   THEN floor(v_base * 0.10)::int
    WHEN 'gold'     THEN floor(v_base * 0.20)::int
    WHEN 'platinum' THEN floor(v_base * 0.30)::int
    ELSE 0
  END;
  v_total := v_base + v_bonus;
  IF v_total <= 0 THEN RETURN 0; END IF;

  v_new_lifetime := COALESCE(v_lifetime, 0) + v_total;
  v_new_tier := CASE
    WHEN v_new_lifetime >= 25000 THEN 'platinum'
    WHEN v_new_lifetime >= 10000 THEN 'gold'
    WHEN v_new_lifetime >=  2500 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE public.loyalty_points
     SET points_balance = points_balance + v_total,
         lifetime_points = v_new_lifetime,
         tier = v_new_tier,
         tier_updated_at = CASE WHEN v_new_tier <> COALESCE(v_tier,'bronze') THEN now() ELSE tier_updated_at END,
         updated_at = now()
   WHERE user_id = p_user_id
   RETURNING points_balance INTO v_new_balance;

  INSERT INTO public.loyalty_award_events
    (user_id, source_type, source_id, amount_cents, base_points, tier_bonus, total_points, tier_at_award)
  VALUES
    (p_user_id, p_source_type, p_source_id, p_amount_cents, v_base, v_bonus, v_total, v_tier);

  -- Notify on tier-up
  IF v_new_tier <> COALESCE(v_tier,'bronze') THEN
    INSERT INTO public.notifications
      (user_id, channel, category, template, title, body, action_url, status, metadata)
    VALUES
      (p_user_id, 'in_app', 'social', 'loyalty_tier_up',
       'You reached ' || initcap(v_new_tier) || ' tier',
       'You earned a tier upgrade — enjoy the new bonus on every purchase.',
       '/wallet?tab=credits', 'sent',
       jsonb_build_object('new_tier', v_new_tier, 'lifetime_points', v_new_lifetime));
  END IF;

  -- Notify on the award itself
  INSERT INTO public.notifications
    (user_id, channel, category, template, title, body, action_url, status, metadata)
  VALUES
    (p_user_id, 'in_app', 'social', 'loyalty_earned',
     'You earned ' || v_total || ' points',
     'Thanks for your ' || p_source_type || ' purchase. New balance: ' || v_new_balance || ' pts',
     '/wallet?tab=credits', 'sent',
     jsonb_build_object('points', v_total, 'source_type', p_source_type, 'source_id', p_source_id));

  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.award_loyalty_points(uuid, bigint, text, text) FROM PUBLIC;

-- Trigger glue ----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.tg_loyalty_award_food_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status::text IN ('delivered','completed') AND COALESCE(OLD.status::text,'') NOT IN ('delivered','completed') THEN
    IF NEW.user_id IS NOT NULL AND NEW.total_amount IS NOT NULL THEN
      PERFORM public.award_loyalty_points(
        NEW.user_id,
        (NEW.total_amount * 100)::bigint,
        'food',
        NEW.id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS food_orders_loyalty_trg ON public.food_orders;
CREATE TRIGGER food_orders_loyalty_trg
AFTER UPDATE OF status ON public.food_orders
FOR EACH ROW EXECUTE FUNCTION public.tg_loyalty_award_food_order();

CREATE OR REPLACE FUNCTION public.tg_loyalty_award_ride()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status = 'completed' AND COALESCE(OLD.status,'') <> 'completed' THEN
    IF NEW.user_id IS NOT NULL AND NEW.captured_amount_cents IS NOT NULL THEN
      PERFORM public.award_loyalty_points(
        NEW.user_id,
        NEW.captured_amount_cents::bigint,
        'ride',
        NEW.id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS ride_requests_loyalty_trg ON public.ride_requests;
CREATE TRIGGER ride_requests_loyalty_trg
AFTER UPDATE OF status ON public.ride_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_loyalty_award_ride();

CREATE OR REPLACE FUNCTION public.tg_loyalty_award_lodging()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_user uuid;
BEGIN
  IF NEW.status IN ('checked_out','completed') AND COALESCE(OLD.status,'') NOT IN ('checked_out','completed') THEN
    -- lodge_reservations.user_id may be named guest_id in older schemas — try both.
    BEGIN
      EXECUTE 'SELECT ($1).user_id' INTO v_user USING NEW;
    EXCEPTION WHEN undefined_column THEN
      BEGIN
        EXECUTE 'SELECT ($1).guest_id' INTO v_user USING NEW;
      EXCEPTION WHEN OTHERS THEN
        v_user := NULL;
      END;
    END;
    IF v_user IS NOT NULL AND NEW.total_cents IS NOT NULL THEN
      PERFORM public.award_loyalty_points(
        v_user,
        NEW.total_cents::bigint,
        'lodging',
        NEW.id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS lodge_reservations_loyalty_trg ON public.lodge_reservations;
CREATE TRIGGER lodge_reservations_loyalty_trg
AFTER UPDATE OF status ON public.lodge_reservations
FOR EACH ROW EXECUTE FUNCTION public.tg_loyalty_award_lodging();;
