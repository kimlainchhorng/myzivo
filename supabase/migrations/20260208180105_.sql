-- Function to calculate Monday of the week (ISO week start)
CREATE OR REPLACE FUNCTION get_week_start(d TIMESTAMPTZ)
RETURNS DATE AS $$
BEGIN
  -- date_trunc('week', ...) returns Monday in PostgreSQL with ISO week
  RETURN date_trunc('week', d)::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to update weekly earnings when order is completed
CREATE OR REPLACE FUNCTION update_driver_weekly_earnings_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
  v_week_start DATE;
  v_passenger_amount NUMERIC;
  v_external_fees NUMERIC;
  v_driver_earnings NUMERIC;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Must have a driver assigned
    IF NEW.driver_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Calculate week start (Monday)
    v_week_start := get_week_start(COALESCE(NEW.delivered_at, NOW()));
    
    -- Calculate amounts (convert cents to dollars where needed)
    v_passenger_amount := COALESCE(NEW.total_amount, 0);
    v_external_fees := COALESCE(NEW.platform_fee, 0) + COALESCE(NEW.service_fee_cents, 0) / 100.0;
    v_driver_earnings := COALESCE(NEW.driver_earnings_cents, 0) / 100.0;
    
    -- Upsert into driver_weekly_earnings
    INSERT INTO driver_weekly_earnings (
      driver_id, 
      week_start, 
      passenger_total, 
      external_fees_total, 
      driver_earnings_total,
      updated_at
    )
    VALUES (
      NEW.driver_id,
      v_week_start,
      v_passenger_amount,
      v_external_fees,
      v_driver_earnings,
      NOW()
    )
    ON CONFLICT (driver_id, week_start)
    DO UPDATE SET
      passenger_total = driver_weekly_earnings.passenger_total + v_passenger_amount,
      external_fees_total = driver_weekly_earnings.external_fees_total + v_external_fees,
      driver_earnings_total = driver_weekly_earnings.driver_earnings_total + v_driver_earnings,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for UPDATE
DROP TRIGGER IF EXISTS trg_update_weekly_earnings ON food_orders;
CREATE TRIGGER trg_update_weekly_earnings
AFTER UPDATE OF status ON food_orders
FOR EACH ROW
EXECUTE FUNCTION update_driver_weekly_earnings_on_delivery();

-- Also handle INSERT case where order is created with completed status
DROP TRIGGER IF EXISTS trg_update_weekly_earnings_insert ON food_orders;
CREATE TRIGGER trg_update_weekly_earnings_insert
AFTER INSERT ON food_orders
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_driver_weekly_earnings_on_delivery();

-- Add unique constraint if not exists (for UPSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'driver_weekly_earnings_driver_week_unique'
  ) THEN
    ALTER TABLE driver_weekly_earnings 
    ADD CONSTRAINT driver_weekly_earnings_driver_week_unique 
    UNIQUE (driver_id, week_start);
  END IF;
END $$;

-- Add paid_at column to driver_payouts for tracking
ALTER TABLE driver_payouts 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL;;
