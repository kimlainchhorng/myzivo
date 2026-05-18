-- Add hold days to fee_settings
ALTER TABLE fee_settings 
ADD COLUMN IF NOT EXISTS payout_hold_days integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS min_payout_threshold numeric DEFAULT 25.00;

-- Add merchant_earnings_cents to food_orders (if missing)
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS merchant_earnings_cents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_eligible_at timestamptz;

-- Add order_id to payout_run_items for driver payouts
ALTER TABLE payout_run_items 
ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES food_orders(id);

-- Add order_id to merchant_payout_run_items
ALTER TABLE merchant_payout_run_items 
ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES food_orders(id);

-- Add unique constraint to prevent double-payouts per order for drivers
CREATE UNIQUE INDEX IF NOT EXISTS idx_payout_run_items_order_driver_unique 
ON payout_run_items(order_id, driver_id) WHERE status IN ('pending', 'paid');

-- Add unique constraint to prevent double-payouts per order for merchants
CREATE UNIQUE INDEX IF NOT EXISTS idx_merchant_payout_run_items_order_unique 
ON merchant_payout_run_items(order_id, restaurant_id) WHERE status IN ('pending', 'paid');

-- Add skip_reason to track why payees were skipped
ALTER TABLE payout_run_items
ADD COLUMN IF NOT EXISTS skip_reason text;

ALTER TABLE merchant_payout_run_items
ADD COLUMN IF NOT EXISTS skip_reason text;

-- Add payee_type to payout_runs for unified runs
ALTER TABLE payout_runs
ADD COLUMN IF NOT EXISTS payee_type text DEFAULT 'driver';

-- Add payout_run_id to ledger_entries for traceability
ALTER TABLE ledger_entries
ADD COLUMN IF NOT EXISTS payout_run_id uuid,
ADD COLUMN IF NOT EXISTS payout_item_id uuid;

-- Enable RLS on ledger_entries if not already
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to ledger_entries
DROP POLICY IF EXISTS "Admin can read ledger entries" ON ledger_entries;
CREATE POLICY "Admin can read ledger entries" ON ledger_entries
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Service role can manage ledger entries" ON ledger_entries;
CREATE POLICY "Service role can manage ledger entries" ON ledger_entries
FOR ALL USING (auth.role() = 'service_role');;
