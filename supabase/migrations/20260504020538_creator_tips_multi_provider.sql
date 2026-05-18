ALTER TABLE public.creator_tips
  ADD COLUMN IF NOT EXISTS payment_provider text
    CHECK (payment_provider IN ('stripe','paypal','square','wallet')),
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text,
  ADD COLUMN IF NOT EXISTS square_checkout_id text,
  ADD COLUMN IF NOT EXISTS square_payment_id text,
  ADD COLUMN IF NOT EXISTS last_payment_error text;

CREATE INDEX IF NOT EXISTS idx_creator_tips_paypal_order
  ON public.creator_tips (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_tips_square_checkout
  ON public.creator_tips (square_checkout_id) WHERE square_checkout_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.tip_paypal_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  tip_id uuid REFERENCES public.creator_tips(id) ON DELETE SET NULL,
  paypal_order_id text,
  paypal_capture_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.tip_paypal_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages tip paypal events" ON public.tip_paypal_webhook_events;
CREATE POLICY "service role manages tip paypal events"
  ON public.tip_paypal_webhook_events AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.tip_square_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  square_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  tip_id uuid REFERENCES public.creator_tips(id) ON DELETE SET NULL,
  square_payment_id text,
  square_checkout_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
ALTER TABLE public.tip_square_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages tip square events" ON public.tip_square_webhook_events;
CREATE POLICY "service role manages tip square events"
  ON public.tip_square_webhook_events AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);;
