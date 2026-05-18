-- Create inventory_items table for tracking stock levels
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'units',
  min_stock NUMERIC NOT NULL DEFAULT 10,
  max_stock NUMERIC NOT NULL DEFAULT 100,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant owner access
CREATE POLICY "Restaurant owners can view their inventory"
ON public.inventory_items
FOR SELECT
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can create inventory items"
ON public.inventory_items
FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can update their inventory"
ON public.inventory_items
FOR UPDATE
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can delete their inventory"
ON public.inventory_items
FOR DELETE
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_inventory_items_restaurant ON public.inventory_items(restaurant_id);
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
