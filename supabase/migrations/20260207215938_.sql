-- Create merchant_coupons table
CREATE TABLE IF NOT EXISTS public.merchant_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value_cents int NOT NULL,
  min_subtotal_cents int DEFAULT 0,
  max_discount_cents int,
  max_uses int,
  uses int DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_merchant_coupons_restaurant ON merchant_coupons(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_merchant_coupons_code ON merchant_coupons(code, is_active);

-- RLS for merchant_coupons
ALTER TABLE merchant_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage own coupons" ON merchant_coupons
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public read active coupons" ON merchant_coupons
  FOR SELECT USING (is_active = true);

-- Create happy_hours table
CREATE TABLE IF NOT EXISTS public.happy_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  days_of_week int[] NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  type text NOT NULL CHECK (type IN ('percent', 'fixed', 'free_delivery')),
  value_cents int NOT NULL,
  min_subtotal_cents int DEFAULT 0,
  max_discount_cents int,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_happy_hours_restaurant ON happy_hours(restaurant_id, is_active);

-- RLS for happy_hours
ALTER TABLE happy_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage own happy hours" ON happy_hours
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public read active happy hours" ON happy_hours
  FOR SELECT USING (is_active = true);

-- Create featured_listings table
CREATE TABLE IF NOT EXISTS public.featured_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused')),
  boost_amount numeric DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_featured_listings_active ON featured_listings(
  restaurant_id, status, starts_at, ends_at
);

-- RLS for featured_listings
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage own featured listings" ON featured_listings
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public read active featured listings" ON featured_listings
  FOR SELECT USING (status = 'active' AND starts_at <= now() AND ends_at >= now());

-- Create restaurant_analytics_daily table
CREATE TABLE IF NOT EXISTS public.restaurant_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date date NOT NULL,
  orders_count int DEFAULT 0,
  gross_cents int DEFAULT 0,
  net_cents int DEFAULT 0,
  avg_order_value_cents int DEFAULT 0,
  new_customers_count int DEFAULT 0,
  repeat_customers_count int DEFAULT 0,
  cancelled_count int DEFAULT 0,
  refunded_cents int DEFAULT 0,
  top_items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_lookup ON restaurant_analytics_daily(
  restaurant_id, date DESC
);

-- RLS for restaurant_analytics_daily
ALTER TABLE restaurant_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants read own analytics" ON restaurant_analytics_daily
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Add merchant_coupon_id and happy_hour_id to food_orders if not exists
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS merchant_coupon_id uuid REFERENCES merchant_coupons(id);
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS happy_hour_id uuid REFERENCES happy_hours(id);

-- RPC: validate_merchant_coupon
CREATE OR REPLACE FUNCTION validate_merchant_coupon(
  p_code text,
  p_restaurant_id uuid,
  p_subtotal_cents int
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_coupon merchant_coupons%ROWTYPE;
  v_discount_cents int := 0;
BEGIN
  -- Find active coupon for this restaurant
  SELECT * INTO v_coupon
  FROM merchant_coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND restaurant_id = p_restaurant_id
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  LIMIT 1;
  
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon'
    );
  END IF;
  
  -- Check minimum subtotal
  IF p_subtotal_cents < v_coupon.min_subtotal_cents THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('Minimum order of $%.2f required', v_coupon.min_subtotal_cents / 100.0)
    );
  END IF;
  
  -- Check usage limit
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This coupon has reached its usage limit'
    );
  END IF;
  
  -- Calculate discount
  IF v_coupon.type = 'percent' THEN
    v_discount_cents := ROUND(p_subtotal_cents * (v_coupon.value_cents / 100.0));
    IF v_coupon.max_discount_cents IS NOT NULL THEN
      v_discount_cents := LEAST(v_discount_cents, v_coupon.max_discount_cents);
    END IF;
  ELSE
    v_discount_cents := v_coupon.value_cents;
  END IF;
  
  -- Don't exceed subtotal
  v_discount_cents := LEAST(v_discount_cents, p_subtotal_cents);
  
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'name', v_coupon.name,
    'type', v_coupon.type,
    'discount_cents', v_discount_cents,
    'description', v_coupon.description
  );
END;
$$;

-- RPC: get_active_happy_hour
CREATE OR REPLACE FUNCTION get_active_happy_hour(
  p_restaurant_id uuid,
  p_subtotal_cents int DEFAULT 0,
  p_delivery_fee_cents int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_happy_hour happy_hours%ROWTYPE;
  v_current_day int;
  v_current_time time;
  v_discount_cents int := 0;
BEGIN
  v_current_day := EXTRACT(DOW FROM now());
  v_current_time := now()::time;
  
  -- Find active happy hour for current time
  SELECT * INTO v_happy_hour
  FROM happy_hours
  WHERE restaurant_id = p_restaurant_id
    AND is_active = true
    AND v_current_day = ANY(days_of_week)
    AND v_current_time >= start_time
    AND v_current_time <= end_time
    AND (min_subtotal_cents IS NULL OR min_subtotal_cents = 0 OR p_subtotal_cents >= min_subtotal_cents)
  LIMIT 1;
  
  IF v_happy_hour IS NULL THEN
    RETURN jsonb_build_object('active', false);
  END IF;
  
  -- Calculate discount
  IF v_happy_hour.type = 'percent' THEN
    v_discount_cents := ROUND(p_subtotal_cents * (v_happy_hour.value_cents / 100.0));
    IF v_happy_hour.max_discount_cents IS NOT NULL THEN
      v_discount_cents := LEAST(v_discount_cents, v_happy_hour.max_discount_cents);
    END IF;
  ELSIF v_happy_hour.type = 'fixed' THEN
    v_discount_cents := v_happy_hour.value_cents;
  ELSIF v_happy_hour.type = 'free_delivery' THEN
    v_discount_cents := p_delivery_fee_cents;
  END IF;
  
  RETURN jsonb_build_object(
    'active', true,
    'happy_hour_id', v_happy_hour.id,
    'name', v_happy_hour.name,
    'type', v_happy_hour.type,
    'value_cents', v_happy_hour.value_cents,
    'discount_cents', v_discount_cents,
    'end_time', v_happy_hour.end_time::text
  );
END;
$$;

-- RPC: increment_merchant_coupon_usage
CREATE OR REPLACE FUNCTION increment_merchant_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE merchant_coupons
  SET uses = uses + 1, updated_at = now()
  WHERE id = p_coupon_id;
END;
$$;;
