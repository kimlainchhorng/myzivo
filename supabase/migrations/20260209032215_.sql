-- Add queue priority for manual reordering within status columns
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS queue_priority INTEGER DEFAULT 0;

-- Index for efficient queue ordering
CREATE INDEX IF NOT EXISTS idx_food_orders_queue_priority 
ON public.food_orders(queue_priority) 
WHERE status IN ('pending', 'confirmed', 'in_progress', 'ready_for_pickup');;
