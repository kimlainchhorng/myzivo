-- Add stock mode and quantity fields to menu_items
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS stock_mode TEXT DEFAULT 'unlimited' CHECK (stock_mode IN ('unlimited', 'limited', 'out')),
ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0;

-- Add timing fields to food_orders
ALTER TABLE food_orders
ADD COLUMN IF NOT EXISTS prep_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pickup_by TIMESTAMP WITH TIME ZONE;

-- Create order_timers queue table for auto-ready scheduling
CREATE TABLE IF NOT EXISTS order_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('auto_ready')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_timers (service role only)
ALTER TABLE order_timers ENABLE ROW LEVEL SECURITY;

-- Create index for pending timers lookup
CREATE INDEX IF NOT EXISTS idx_order_timers_pending 
ON order_timers(status, run_at) WHERE status = 'pending';

-- Create index for stock mode queries
CREATE INDEX IF NOT EXISTS idx_menu_items_stock_mode 
ON menu_items(restaurant_id, stock_mode) WHERE stock_mode = 'out';;
