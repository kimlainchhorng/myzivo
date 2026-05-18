-- Add customer payment tracking columns to food_orders
ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS square_order_id text,
  ADD COLUMN IF NOT EXISTS square_location_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Set default for payment_status if not already set
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'food_orders' 
    AND column_name = 'payment_status'
  ) THEN
    EXECUTE 'ALTER TABLE public.food_orders ALTER COLUMN payment_status SET DEFAULT ''unpaid''';
  END IF;
END $$;

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_food_orders_payment_status 
  ON public.food_orders(payment_status)
  WHERE payment_status IS NOT NULL;

-- Index for Square order lookups
CREATE INDEX IF NOT EXISTS idx_food_orders_square_order_id
  ON public.food_orders(square_order_id)
  WHERE square_order_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.food_orders.square_order_id IS 'Square order ID created after successful payment';
COMMENT ON COLUMN public.food_orders.square_location_id IS 'Square location ID for the order';
COMMENT ON COLUMN public.food_orders.paid_at IS 'Timestamp when payment was completed';;
