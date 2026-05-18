-- Phase 1: Add moderation fields to order_ratings
ALTER TABLE order_ratings 
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS flagged_at timestamptz,
  ADD COLUMN IF NOT EXISTS flagged_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS flag_reason text;

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_order_ratings_restaurant_public 
  ON order_ratings(restaurant_id, is_public, is_flagged, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_ratings_flagged 
  ON order_ratings(is_flagged, created_at DESC) WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS idx_order_ratings_driver
  ON order_ratings(driver_id, created_at DESC) WHERE driver_id IS NOT NULL;

-- Phase 2: Add on_time_rate and total_deliveries to drivers
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS on_time_rate numeric DEFAULT 100,
  ADD COLUMN IF NOT EXISTS total_deliveries int DEFAULT 0;

-- Phase 3: Add performance fields to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS prep_time_accuracy numeric DEFAULT 100,
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ratings_count int DEFAULT 0;

-- RLS Policies for order_ratings moderation
DROP POLICY IF EXISTS "Public read public reviews" ON order_ratings;
CREATE POLICY "Public read public reviews" ON order_ratings
  FOR SELECT USING (is_public = true AND is_flagged = false);

DROP POLICY IF EXISTS "Admins read all reviews" ON order_ratings;
CREATE POLICY "Admins read all reviews" ON order_ratings
  FOR SELECT USING (is_any_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins moderate reviews" ON order_ratings;
CREATE POLICY "Admins moderate reviews" ON order_ratings
  FOR UPDATE USING (is_any_admin(auth.uid()));

DROP POLICY IF EXISTS "Service role manages reviews" ON order_ratings;
CREATE POLICY "Service role manages reviews" ON order_ratings
  FOR ALL USING (auth.role() = 'service_role');

-- Function to recompute restaurant stats after rating
CREATE OR REPLACE FUNCTION recompute_restaurant_rating_stats(p_restaurant_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_avg numeric;
  v_count int;
BEGIN
  SELECT 
    COALESCE(AVG(merchant_rating), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM order_ratings
  WHERE restaurant_id = p_restaurant_id
    AND is_public = true
    AND is_flagged = false;
  
  UPDATE restaurants
  SET 
    avg_rating = ROUND(v_avg, 2),
    ratings_count = v_count,
    updated_at = now()
  WHERE id = p_restaurant_id;
END;
$$;

-- Function to recompute driver stats after rating
CREATE OR REPLACE FUNCTION recompute_driver_rating_stats(p_driver_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_avg numeric;
  v_count int;
BEGIN
  SELECT 
    COALESCE(AVG(driver_rating), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM order_ratings
  WHERE driver_id = p_driver_id
    AND driver_rating IS NOT NULL
    AND is_public = true
    AND is_flagged = false;
  
  UPDATE drivers
  SET 
    rating = ROUND(v_avg, 2),
    rating_count = v_count,
    updated_at = now()
  WHERE id = p_driver_id;
END;
$$;

-- Update submit_order_rating to call stat recomputation
CREATE OR REPLACE FUNCTION submit_order_rating(
  p_tracking_code text,
  p_merchant_rating int,
  p_driver_rating int DEFAULT NULL,
  p_comment text DEFAULT NULL,
  p_tags text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order food_orders%ROWTYPE;
  v_rating_id uuid;
BEGIN
  -- Get the order
  SELECT * INTO v_order
  FROM food_orders
  WHERE tracking_code = p_tracking_code;
  
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;
  
  IF v_order.status != 'delivered' AND v_order.status != 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not yet delivered');
  END IF;
  
  -- Check if already rated
  IF EXISTS (SELECT 1 FROM order_ratings WHERE order_id = v_order.id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order already rated');
  END IF;
  
  -- Validate ratings
  IF p_merchant_rating < 1 OR p_merchant_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid merchant rating');
  END IF;
  
  IF p_driver_rating IS NOT NULL AND (p_driver_rating < 1 OR p_driver_rating > 5) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid driver rating');
  END IF;
  
  -- Insert rating
  INSERT INTO order_ratings (
    order_id,
    restaurant_id,
    driver_id,
    customer_id,
    merchant_rating,
    driver_rating,
    comment,
    tags,
    is_public,
    is_flagged
  ) VALUES (
    v_order.id,
    v_order.restaurant_id,
    v_order.assigned_driver_id,
    v_order.customer_id,
    p_merchant_rating,
    p_driver_rating,
    p_comment,
    p_tags,
    true,
    false
  )
  RETURNING id INTO v_rating_id;
  
  -- Recompute restaurant stats
  PERFORM recompute_restaurant_rating_stats(v_order.restaurant_id);
  
  -- Recompute driver stats if rated
  IF v_order.assigned_driver_id IS NOT NULL AND p_driver_rating IS NOT NULL THEN
    PERFORM recompute_driver_rating_stats(v_order.assigned_driver_id);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'rating_id', v_rating_id
  );
END;
$$;

-- Function to get restaurant reviews with pagination
CREATE OR REPLACE FUNCTION get_restaurant_reviews(
  p_restaurant_id uuid,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_sort text DEFAULT 'recent'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_reviews jsonb;
  v_total int;
  v_avg numeric;
BEGIN
  -- Get total count and average
  SELECT COUNT(*), COALESCE(AVG(merchant_rating), 0)
  INTO v_total, v_avg
  FROM order_ratings
  WHERE restaurant_id = p_restaurant_id
    AND is_public = true
    AND is_flagged = false;
  
  -- Get reviews with sorting
  SELECT jsonb_agg(r ORDER BY 
    CASE WHEN p_sort = 'recent' THEN r.created_at END DESC,
    CASE WHEN p_sort = 'highest' THEN r.merchant_rating END DESC,
    CASE WHEN p_sort = 'lowest' THEN r.merchant_rating END ASC
  )
  INTO v_reviews
  FROM (
    SELECT 
      or_tbl.id,
      or_tbl.merchant_rating,
      or_tbl.driver_rating,
      or_tbl.comment,
      or_tbl.tags,
      or_tbl.created_at,
      COALESCE(p.full_name, 'Anonymous') as customer_name,
      SUBSTRING(COALESCE(p.full_name, 'A'), 1, 1) as customer_initial
    FROM order_ratings or_tbl
    LEFT JOIN profiles p ON or_tbl.customer_id = p.id
    WHERE or_tbl.restaurant_id = p_restaurant_id
      AND or_tbl.is_public = true
      AND or_tbl.is_flagged = false
    ORDER BY 
      CASE WHEN p_sort = 'recent' THEN or_tbl.created_at END DESC,
      CASE WHEN p_sort = 'highest' THEN or_tbl.merchant_rating END DESC,
      CASE WHEN p_sort = 'lowest' THEN or_tbl.merchant_rating END ASC
    LIMIT p_limit
    OFFSET p_offset
  ) r;
  
  RETURN jsonb_build_object(
    'reviews', COALESCE(v_reviews, '[]'::jsonb),
    'total', v_total,
    'avg_rating', ROUND(v_avg, 1),
    'has_more', (p_offset + p_limit) < v_total
  );
END;
$$;

-- Function for admin to moderate reviews
CREATE OR REPLACE FUNCTION admin_moderate_review(
  p_review_id uuid,
  p_action text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_review order_ratings%ROWTYPE;
BEGIN
  -- Check admin
  IF NOT is_any_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  SELECT * INTO v_review FROM order_ratings WHERE id = p_review_id;
  
  IF v_review IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Review not found');
  END IF;
  
  CASE p_action
    WHEN 'flag' THEN
      UPDATE order_ratings 
      SET is_flagged = true, flagged_at = now(), flagged_by = auth.uid(), flag_reason = p_reason
      WHERE id = p_review_id;
    WHEN 'unflag' THEN
      UPDATE order_ratings 
      SET is_flagged = false, flagged_at = NULL, flagged_by = NULL, flag_reason = NULL
      WHERE id = p_review_id;
    WHEN 'hide' THEN
      UPDATE order_ratings SET is_public = false WHERE id = p_review_id;
    WHEN 'show' THEN
      UPDATE order_ratings SET is_public = true WHERE id = p_review_id;
    WHEN 'delete' THEN
      DELETE FROM order_ratings WHERE id = p_review_id;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;
  
  -- Recompute stats
  PERFORM recompute_restaurant_rating_stats(v_review.restaurant_id);
  IF v_review.driver_id IS NOT NULL THEN
    PERFORM recompute_driver_rating_stats(v_review.driver_id);
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;;
