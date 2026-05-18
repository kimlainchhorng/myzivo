-- Add almost_ready_at column for restaurant "almost ready" marking
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS almost_ready_at TIMESTAMPTZ;;
