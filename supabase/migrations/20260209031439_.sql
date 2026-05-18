-- Add stock management columns to square_items
ALTER TABLE public.square_items
ADD COLUMN IF NOT EXISTS stock_mode TEXT DEFAULT 'unlimited' 
  CHECK (stock_mode IN ('unlimited', 'limited', 'out')),
ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0;

-- Index for filtering out-of-stock items
CREATE INDEX IF NOT EXISTS idx_square_items_stock_mode 
ON public.square_items(stock_mode) WHERE stock_mode IN ('limited', 'out');;
