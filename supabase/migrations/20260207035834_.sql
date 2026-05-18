-- Add Stripe Connect fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS bank_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_last_sync TIMESTAMP WITH TIME ZONE;

-- Create restaurant_ledger table for tracking earnings/payouts
CREATE TABLE IF NOT EXISTS restaurant_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES food_orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'fee', 'adjustment', 'payout')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid_out', 'void')),
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on restaurant_ledger
ALTER TABLE restaurant_ledger ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_ledger_restaurant ON restaurant_ledger(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_ledger_status ON restaurant_ledger(status);

-- RLS Policy: Owner can read their own ledger only
CREATE POLICY "restaurant_ledger_select_own"
ON restaurant_ledger FOR SELECT
USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));;
