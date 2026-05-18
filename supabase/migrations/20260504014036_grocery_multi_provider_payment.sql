-- Multi-provider payment columns on shopping_orders
ALTER TABLE public.shopping_orders
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS payment_provider text
    CHECK (payment_provider IN ('stripe','paypal','square','cash','wallet')),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text,
  ADD COLUMN IF NOT EXISTS square_checkout_id text,
  ADD COLUMN IF NOT EXISTS square_payment_id text,
  ADD COLUMN IF NOT EXISTS last_payment_error text;

CREATE INDEX IF NOT EXISTS idx_shopping_orders_paypal_order
  ON public.shopping_orders (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_orders_square_checkout
  ON public.shopping_orders (square_checkout_id) WHERE square_checkout_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_orders_stripe_pi
  ON public.shopping_orders (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Idempotent webhook event log tables for grocery
CREATE TABLE IF NOT EXISTS public.grocery_paypal_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid REFERENCES public.shopping_orders(id) ON DELETE SET NULL,
  paypal_order_id text,
  paypal_capture_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.grocery_paypal_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages grocery paypal events" ON public.grocery_paypal_webhook_events;
CREATE POLICY "service role manages grocery paypal events"
  ON public.grocery_paypal_webhook_events AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.grocery_square_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  square_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid REFERENCES public.shopping_orders(id) ON DELETE SET NULL,
  square_payment_id text,
  square_checkout_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.grocery_square_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages grocery square events" ON public.grocery_square_webhook_events;
CREATE POLICY "service role manages grocery square events"
  ON public.grocery_square_webhook_events AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);;
