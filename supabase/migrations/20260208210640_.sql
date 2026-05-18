-- Add actor_role column to order_events table
ALTER TABLE public.order_events 
ADD COLUMN IF NOT EXISTS actor_role TEXT 
CHECK (actor_role IN ('customer', 'merchant', 'driver', 'system'));

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_order_events_actor_role ON public.order_events(actor_role);

-- Add index on created_at for order history queries
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.order_events.actor_role IS 'Role of the actor: customer, merchant, driver, or system';;
