-- Enable RLS on order_financials
ALTER TABLE order_financials ENABLE ROW LEVEL SECURITY;

-- Merchants can view financials for their restaurant's orders
CREATE POLICY "Merchants view own order financials" ON order_financials
FOR SELECT USING (
  order_id IN (
    SELECT id FROM food_orders 
    WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  )
);

-- Admins can view all order financials
CREATE POLICY "Admins view all order financials" ON order_financials
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);;
