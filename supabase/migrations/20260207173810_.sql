-- Create square_webhook_events table for deduplication and audit logging
CREATE TABLE public.square_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  env TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Unique index for deduplication
CREATE UNIQUE INDEX idx_square_webhook_events_env_event_id 
  ON public.square_webhook_events(env, event_id);

-- Index for querying by merchant
CREATE INDEX idx_square_webhook_events_merchant_id 
  ON public.square_webhook_events(merchant_id);

-- Create square_orders table for storing Square orders
CREATE TABLE public.square_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  env TEXT NOT NULL,
  square_merchant_id TEXT NOT NULL,
  square_location_id TEXT,
  square_order_id TEXT NOT NULL,
  state TEXT,
  total_cents INTEGER,
  currency TEXT,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique index for order deduplication
CREATE UNIQUE INDEX idx_square_orders_user_env_order 
  ON public.square_orders(user_id, env, square_order_id);

-- Index for querying by merchant
CREATE INDEX idx_square_orders_merchant 
  ON public.square_orders(square_merchant_id);

-- Enable RLS for square_orders
ALTER TABLE public.square_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for square_orders
CREATE POLICY "Users can view own orders"
  ON public.square_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.square_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.square_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders"
  ON public.square_orders FOR DELETE
  USING (auth.uid() = user_id);;
