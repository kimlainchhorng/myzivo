-- Create customer_orders table for QR/in-restaurant ordering
CREATE TABLE public.customer_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_order_items table
CREATE TABLE public.customer_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for customer_orders
CREATE POLICY "Anyone can create customer orders" 
ON public.customer_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their orders by ID" 
ON public.customer_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Restaurant owners can manage their customer orders" 
ON public.customer_orders 
FOR ALL 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all customer orders" 
ON public.customer_orders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Policies for customer_order_items
CREATE POLICY "Anyone can create order items" 
ON public.customer_order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view order items" 
ON public.customer_order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Restaurant owners can manage order items" 
ON public.customer_order_items 
FOR ALL 
USING (order_id IN (
  SELECT co.id FROM public.customer_orders co
  JOIN public.restaurants r ON co.restaurant_id = r.id
  WHERE r.owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all order items" 
ON public.customer_order_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_customer_orders_restaurant ON public.customer_orders(restaurant_id);
CREATE INDEX idx_customer_orders_status ON public.customer_orders(status);
CREATE INDEX idx_customer_orders_created ON public.customer_orders(created_at DESC);
CREATE INDEX idx_customer_order_items_order ON public.customer_order_items(order_id);

-- Trigger for updated_at
CREATE TRIGGER update_customer_orders_updated_at
  BEFORE UPDATE ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
