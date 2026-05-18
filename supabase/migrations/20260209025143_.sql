-- Add reassignment tracking to food_orders
ALTER TABLE public.food_orders 
ADD COLUMN IF NOT EXISTS reassignment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS was_reassigned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_driver_id UUID REFERENCES public.drivers(id);

-- Create index for efficient querying of reassigned orders
CREATE INDEX IF NOT EXISTS idx_food_orders_was_reassigned 
ON public.food_orders(was_reassigned) WHERE was_reassigned = true;

-- Create index for previous driver lookups
CREATE INDEX IF NOT EXISTS idx_food_orders_previous_driver_id 
ON public.food_orders(previous_driver_id) WHERE previous_driver_id IS NOT NULL;;
