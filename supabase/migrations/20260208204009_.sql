-- 1. Create alerts table for hiZIVO customer app
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.food_orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy: users see their own alerts
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

-- 4. RLS policy: users can update their own alerts (mark as read)
CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- 6. Create customer-facing view with status mapping
CREATE OR REPLACE VIEW public.customer_orders_view AS
SELECT 
  id,
  customer_id as user_id,
  restaurant_id,
  CASE status::text
    WHEN 'pending' THEN 'placed'
    WHEN 'in_progress' THEN 'preparing'
    WHEN 'ready_for_pickup' THEN 'ready'
    WHEN 'completed' THEN 'delivered'
    ELSE status::text
  END as status,
  subtotal,
  delivery_fee,
  tax,
  0::numeric as discount,
  total_amount as total,
  delivery_address,
  delivery_lat,
  delivery_lng,
  items,
  special_instructions,
  created_at,
  updated_at
FROM public.food_orders;

-- 7. Update trigger to insert alerts with mapped status
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  customer_status TEXT;
  msg TEXT;
  status_messages JSONB := '{
    "placed": "Your order has been placed",
    "confirmed": "Your order has been confirmed!",
    "preparing": "Your order is being prepared",
    "ready": "Your order is ready for pickup",
    "out_for_delivery": "Your order is on the way!",
    "delivered": "Your order has been delivered",
    "cancelled": "Your order has been cancelled"
  }'::jsonb;
BEGIN
  -- Only fire on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Map to customer-facing status
    customer_status := CASE NEW.status::text
      WHEN 'pending' THEN 'placed'
      WHEN 'in_progress' THEN 'preparing'
      WHEN 'ready_for_pickup' THEN 'ready'
      WHEN 'completed' THEN 'delivered'
      ELSE NEW.status::text
    END;
    
    msg := COALESCE(status_messages->>customer_status, 'Your order is now ' || customer_status);
    
    -- Insert into alerts for hiZIVO customer app
    IF NEW.customer_id IS NOT NULL THEN
      INSERT INTO public.alerts (user_id, order_id, title, body)
      VALUES (NEW.customer_id, NEW.id, 'Order update', msg);
    END IF;
    
    -- Insert audit event
    INSERT INTO public.order_status_events (order_id, from_status, to_status, actor_type)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, 'system');
    
    -- Insert into existing notifications table
    IF NEW.customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, order_id, channel, category, template,
        title, body, status, metadata
      ) VALUES (
        NEW.customer_id,
        NEW.id,
        'push',
        'transactional',
        'order_status_change',
        'Order Update',
        msg,
        'pending',
        jsonb_build_object('status', customer_status, 'order_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Ensure trigger is attached (recreate if needed)
DROP TRIGGER IF EXISTS notify_customer_on_status_change ON public.food_orders;
CREATE TRIGGER notify_customer_on_status_change
  AFTER UPDATE OF status ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_customer_on_status_change();;
