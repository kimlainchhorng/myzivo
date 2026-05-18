-- Mirror the lodge_reservations multi-provider columns on food_orders so
-- Eats checkout can route through Stripe / PayPal / Square / Cash / Wallet.
ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS payment_provider text
    CHECK (payment_provider IN ('stripe','paypal','square','cash','wallet'));

ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS paypal_order_id text;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS paypal_capture_id text;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS square_checkout_id text;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS square_payment_id text;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS last_payment_error text;

CREATE INDEX IF NOT EXISTS idx_food_orders_paypal_order
  ON public.food_orders (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_orders_square_checkout
  ON public.food_orders (square_checkout_id) WHERE square_checkout_id IS NOT NULL;

-- Idempotent webhook event log for Eats — same shape as the lodging one.
CREATE TABLE IF NOT EXISTS public.eats_paypal_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  paypal_order_id text,
  paypal_capture_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.eats_paypal_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages eats paypal events" ON public.eats_paypal_webhook_events;
CREATE POLICY "service role manages eats paypal events"
  ON public.eats_paypal_webhook_events
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.eats_square_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  square_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  square_payment_id text,
  square_checkout_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.eats_square_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages eats square events" ON public.eats_square_webhook_events;
CREATE POLICY "service role manages eats square events"
  ON public.eats_square_webhook_events
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);;
