
-- ============================================================
-- ZIVO BUSINESS: 10-point readiness migration for new client
-- ============================================================

-- 1. pricing_settings: add missing is_active column
ALTER TABLE public.pricing_settings
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. promo_codes: add usage_count as computed alias for "uses"
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS usage_count INT GENERATED ALWAYS AS (uses) STORED;

-- 3. reviews: add missing service_type column
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'ride';

-- 4. driver_earnings: add "amount" as generated column from net_amount
ALTER TABLE public.driver_earnings
  ADD COLUMN IF NOT EXISTS amount NUMERIC GENERATED ALWAYS AS (net_amount) STORED;

-- 5. food_orders: add user_id as generated column from customer_id (fixes remaining direct queries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='food_orders' AND column_name='user_id'
  ) THEN
    ALTER TABLE public.food_orders ADD COLUMN user_id UUID GENERATED ALWAYS AS (customer_id) STORED;
  END IF;
END $$;

-- 6. pricing_config_history: add INSERT policy so triggers can write history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.pricing_config_history'::regclass
    AND polname = 'Allow insert for authenticated users'
  ) THEN
    CREATE POLICY "Allow insert for authenticated users"
      ON public.pricing_config_history
      FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Also allow service-role / trigger inserts (SECURITY DEFINER functions)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.pricing_config_history'::regclass
    AND polname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access"
      ON public.pricing_config_history
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- 7. security_events: widen INSERT policy to allow system/trigger inserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.security_events'::regclass
    AND polname = 'System insert security events'
  ) THEN
    CREATE POLICY "System insert security events"
      ON public.security_events
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 8. Add index on food_orders.customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_orders_customer_id ON public.food_orders(customer_id);

-- 9. Add index on driver_earnings for driver dashboard queries
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_created ON public.driver_earnings(driver_id, created_at DESC);

-- 10. Add index on reviews for service_type filtering
CREATE INDEX IF NOT EXISTS idx_reviews_target_type ON public.reviews(target_type, target_id);
;
