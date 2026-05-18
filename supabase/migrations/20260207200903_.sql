-- Create carts table for storing shopping cart sessions
CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT carts_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_restaurant ON carts(restaurant_id);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own carts" ON carts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can manage session carts" ON carts
  FOR ALL USING (session_id IS NOT NULL);

-- Create cart_items table for individual cart items
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  square_item_id text NOT NULL,
  square_variation_id text NOT NULL,
  name text NOT NULL,
  variation_name text,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents int NOT NULL CHECK (unit_price_cents >= 0),
  modifiers jsonb DEFAULT '[]',
  line_total_cents int NOT NULL CHECK (line_total_cents >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_items.cart_id
      AND (c.user_id = auth.uid() OR c.session_id IS NOT NULL)
    )
  );

-- Add public read policies for Square menu tables so customers can browse menus
CREATE POLICY "Public read visible items" ON square_items
  FOR SELECT USING (is_available = true AND is_visible = true);

CREATE POLICY "Public read available variations" ON square_item_variations
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public read enabled modifiers" ON square_modifiers
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Public read catalog categories" ON square_catalog_categories
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read item modifier links" ON square_item_modifier_lists
  FOR SELECT USING (true);

-- Allow anon users to insert orders (for guest checkout)
CREATE POLICY "Anyone can create orders" ON food_orders
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own orders by customer_phone
CREATE POLICY "Users can read own orders by phone" ON food_orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    customer_phone IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.phone = food_orders.customer_phone
    )
  );

-- Add trigger to update carts.updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_updated_at();;
