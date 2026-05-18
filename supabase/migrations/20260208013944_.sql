-- Add commission tracking columns to food_orders
ALTER TABLE food_orders
ADD COLUMN IF NOT EXISTS commission_percent NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS commission_amount_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS restaurant_payout_cents INTEGER DEFAULT 0;

-- Create trigger function to calculate commission on order creation/update
CREATE OR REPLACE FUNCTION calculate_order_commission()
RETURNS TRIGGER AS $$
DECLARE
  restaurant_commission NUMERIC;
  total_cents INTEGER;
BEGIN
  -- Get restaurant's commission rate (default 15%)
  SELECT COALESCE(commission_rate, 15) INTO restaurant_commission
  FROM restaurants WHERE id = NEW.restaurant_id;
  
  -- Lock commission at order creation
  IF TG_OP = 'INSERT' THEN
    NEW.commission_percent := restaurant_commission;
  END IF;
  
  -- Calculate amounts (total_amount is in dollars, convert to cents)
  total_cents := COALESCE((NEW.total_amount * 100)::INTEGER, 0);
  NEW.commission_amount_cents := (total_cents * COALESCE(NEW.commission_percent, 15) / 100)::INTEGER;
  NEW.restaurant_payout_cents := total_cents - NEW.commission_amount_cents;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_calculate_commission ON food_orders;

CREATE TRIGGER trg_calculate_commission
BEFORE INSERT OR UPDATE OF total_amount ON food_orders
FOR EACH ROW EXECUTE FUNCTION calculate_order_commission();

-- Backfill existing orders with commission calculations
UPDATE food_orders
SET 
  commission_percent = COALESCE((SELECT commission_rate FROM restaurants WHERE id = food_orders.restaurant_id), 15),
  commission_amount_cents = (COALESCE(total_amount, 0) * 100 * COALESCE((SELECT commission_rate FROM restaurants WHERE id = food_orders.restaurant_id), 15) / 100)::INTEGER,
  restaurant_payout_cents = (COALESCE(total_amount, 0) * 100)::INTEGER - (COALESCE(total_amount, 0) * 100 * COALESCE((SELECT commission_rate FROM restaurants WHERE id = food_orders.restaurant_id), 15) / 100)::INTEGER
WHERE commission_amount_cents = 0 OR commission_amount_cents IS NULL;;
