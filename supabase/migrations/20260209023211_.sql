-- Create table for tracking item substitutions and unavailable items
CREATE TABLE public.order_item_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  original_item_name TEXT NOT NULL,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('substituted', 'unavailable')),
  substitute_item_name TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID REFERENCES auth.users(id)
);

-- Add index for fast lookups by order
CREATE INDEX idx_order_item_modifications_order_id ON public.order_item_modifications(order_id);

-- Enable RLS
ALTER TABLE public.order_item_modifications ENABLE ROW LEVEL SECURITY;

-- Allow drivers to read modifications for orders assigned to them
CREATE POLICY "Drivers can view modifications for their orders"
ON public.order_item_modifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.food_orders fo
    JOIN public.drivers d ON fo.driver_id = d.id
    WHERE fo.id = order_item_modifications.order_id
    AND d.user_id = auth.uid()
  )
);

-- Allow merchants to view and create modifications for their restaurant's orders
CREATE POLICY "Merchants can manage modifications for their orders"
ON public.order_item_modifications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.food_orders fo
    JOIN public.restaurants r ON fo.restaurant_id = r.id
    WHERE fo.id = order_item_modifications.order_id
    AND r.owner_id = auth.uid()
  )
);

-- Allow customers to view modifications for their orders
CREATE POLICY "Customers can view modifications for their orders"
ON public.order_item_modifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.food_orders fo
    WHERE fo.id = order_item_modifications.order_id
    AND fo.customer_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON TABLE public.order_item_modifications IS 'Tracks item substitutions and unavailable items for food orders';;
