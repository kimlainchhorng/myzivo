-- Create restaurant_tables table for QR code management
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  capacity INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_categories table
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add table_id and category_id columns
ALTER TABLE public.customer_orders 
ADD COLUMN table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL;

ALTER TABLE public.menu_items 
ADD COLUMN category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Policies for restaurant_tables
CREATE POLICY "Anyone can view tables by token" 
ON public.restaurant_tables 
FOR SELECT 
USING (true);

CREATE POLICY "Restaurant owners can manage their tables" 
ON public.restaurant_tables 
FOR ALL 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all tables" 
ON public.restaurant_tables 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Policies for menu_categories
CREATE POLICY "Anyone can view active categories" 
ON public.menu_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Restaurant owners can manage their categories" 
ON public.menu_categories 
FOR ALL 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all categories" 
ON public.menu_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_restaurant_tables_restaurant ON public.restaurant_tables(restaurant_id);
CREATE INDEX idx_restaurant_tables_token ON public.restaurant_tables(qr_token);
CREATE INDEX idx_menu_categories_restaurant ON public.menu_categories(restaurant_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_customer_orders_table ON public.customer_orders(table_id);

-- Triggers for updated_at
CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
