-- Create trigger function for customer notifications on order status change
CREATE OR REPLACE FUNCTION notify_customer_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_messages JSONB := '{
    "confirmed": "Your order has been confirmed!",
    "in_progress": "Your order is being prepared",
    "ready_for_pickup": "Your order is ready for pickup",
    "out_for_delivery": "Your order is on the way!",
    "completed": "Your order has been delivered",
    "cancelled": "Your order has been cancelled"
  }'::jsonb;
  msg TEXT;
  restaurant_name TEXT;
BEGIN
  -- Only fire on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get restaurant name for notification
    SELECT name INTO restaurant_name 
    FROM restaurants 
    WHERE id = NEW.restaurant_id;
    
    -- Insert audit event into order_status_events
    INSERT INTO order_status_events (order_id, from_status, to_status, actor_type)
    VALUES (NEW.id, OLD.status, NEW.status, 'system');
    
    -- Insert customer notification
    msg := status_messages->>NEW.status;
    IF msg IS NOT NULL AND NEW.customer_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id, 
        order_id, 
        channel, 
        category, 
        template,
        title, 
        body, 
        status, 
        metadata
      ) VALUES (
        NEW.customer_id,
        NEW.id,
        'push',
        'transactional',
        'order_status_change',
        COALESCE(restaurant_name, 'Order') || ' Update',
        msg,
        'pending',
        jsonb_build_object(
          'status', NEW.status, 
          'order_id', NEW.id,
          'restaurant_name', restaurant_name,
          'previous_status', OLD.status
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_customer_on_status_change ON food_orders;

-- Create the trigger
CREATE TRIGGER trigger_notify_customer_on_status_change
AFTER UPDATE OF status ON food_orders
FOR EACH ROW
EXECUTE FUNCTION notify_customer_on_status_change();

-- Add comment for documentation
COMMENT ON FUNCTION notify_customer_on_status_change() IS 'Automatically creates customer notifications and audit events when food order status changes';;
