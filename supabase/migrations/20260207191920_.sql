-- Add RLS policies for merchants to manage food_orders

-- Merchants can read their restaurant's orders
CREATE POLICY "Merchants can read own restaurant orders" 
ON public.food_orders FOR SELECT
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Merchants can create orders for their restaurant
CREATE POLICY "Merchants can create orders"
ON public.food_orders FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Merchants can update their orders (assign driver, cancel, etc.)
CREATE POLICY "Merchants can update own orders"
ON public.food_orders FOR UPDATE
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Add RLS policy for order_status_events
CREATE POLICY "Merchants can read their order events"
ON public.order_status_events FOR SELECT
USING (
  order_id IN (
    SELECT fo.id FROM public.food_orders fo
    JOIN public.restaurants r ON fo.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  )
);

-- Merchants can insert status events for their orders
CREATE POLICY "Merchants can create order events"
ON public.order_status_events FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT fo.id FROM public.food_orders fo
    JOIN public.restaurants r ON fo.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  )
);

-- Create a function to auto-add merchant role on restaurant creation
CREATE OR REPLACE FUNCTION public.auto_add_merchant_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.owner_id, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-add merchant role when restaurant is created
DROP TRIGGER IF EXISTS on_restaurant_created_add_merchant_role ON public.restaurants;
CREATE TRIGGER on_restaurant_created_add_merchant_role
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_merchant_role();;
