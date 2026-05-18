-- Add driver_response_status and delivery_confirmed_by to food_orders
ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS driver_response_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_confirmed_by text;

-- Add check constraint for valid response statuses (drop first if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'food_orders_driver_response_check'
  ) THEN
    ALTER TABLE public.food_orders
      ADD CONSTRAINT food_orders_driver_response_check 
      CHECK (driver_response_status IN ('pending', 'accepted', 'declined'));
  END IF;
END $$;

-- Index for driver order queries
CREATE INDEX IF NOT EXISTS idx_food_orders_driver_response 
  ON public.food_orders(driver_id, driver_response_status)
  WHERE driver_id IS NOT NULL;

-- Create order_status_events table for audit log
CREATE TABLE IF NOT EXISTS public.order_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  actor_type text NOT NULL CHECK (actor_type IN ('driver', 'merchant', 'system', 'customer')),
  actor_id uuid,
  from_status text,
  to_status text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for order_status_events
CREATE INDEX IF NOT EXISTS idx_order_status_events_order ON public.order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_events_created ON public.order_status_events(created_at DESC);

-- RLS for order_status_events
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

-- Policy: Driver can read events for their assigned orders
CREATE POLICY "Drivers can read their order events" ON public.order_status_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.drivers d ON d.id = fo.driver_id
      WHERE fo.id = order_status_events.order_id
      AND d.user_id = auth.uid()
    )
  );

-- Policy: Merchants can read events for their restaurant's orders
CREATE POLICY "Merchants can read restaurant order events" ON public.order_status_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.restaurants r ON r.id = fo.restaurant_id
      WHERE fo.id = order_status_events.order_id
      AND r.owner_id = auth.uid()
    )
  );

-- Create delivery-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for upload: Driver can upload for their assigned orders
CREATE POLICY "Drivers can upload delivery proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'delivery-proofs' AND
  EXISTS (
    SELECT 1 FROM public.food_orders fo
    JOIN public.drivers d ON d.id = fo.driver_id
    WHERE d.user_id = auth.uid()
    AND fo.id::text = (storage.foldername(name))[1]
  )
);

-- RLS for read: Public access for delivery photos
CREATE POLICY "Public read for delivery proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-proofs');;
