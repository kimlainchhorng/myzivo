-- 1. Ensure restaurants has hours JSONB (if not exists)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS hours JSONB DEFAULT '{}'::jsonb;

-- 2. Create merchant_earnings table
CREATE TABLE IF NOT EXISTS merchant_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
  order_total NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE merchant_earnings ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_merchant_earnings_restaurant 
ON merchant_earnings(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_merchant_earnings_order 
ON merchant_earnings(order_id);

CREATE INDEX IF NOT EXISTS idx_merchant_earnings_created 
ON merchant_earnings(created_at);

-- RLS Policy for merchant_earnings
CREATE POLICY "merchant_earnings_select_own"
ON merchant_earnings FOR SELECT
USING (restaurant_id IN (
  SELECT id FROM restaurants WHERE owner_id = auth.uid()
));

-- Storage bucket for menu photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "menu_photos_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-photos');

CREATE POLICY "menu_photos_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "menu_photos_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "menu_photos_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
  )
);;
