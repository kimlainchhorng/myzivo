-- Idempotent webhook event logs for PayPal and Square (mirror the
-- lodging_stripe_webhook_events shape so admins have one mental model).

CREATE TABLE IF NOT EXISTS public.lodging_paypal_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  reservation_id uuid REFERENCES public.lodge_reservations(id) ON DELETE SET NULL,
  paypal_order_id text,
  paypal_capture_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_received_at
  ON public.lodging_paypal_webhook_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_reservation
  ON public.lodging_paypal_webhook_events (reservation_id) WHERE reservation_id IS NOT NULL;

ALTER TABLE public.lodging_paypal_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages paypal events" ON public.lodging_paypal_webhook_events;
CREATE POLICY "service role manages paypal events"
  ON public.lodging_paypal_webhook_events
  AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.lodging_square_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  square_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  reservation_id uuid REFERENCES public.lodge_reservations(id) ON DELETE SET NULL,
  square_payment_id text,
  square_checkout_id text,
  processing_status text NOT NULL DEFAULT 'received',
  error_message text,
  payload jsonb
);
CREATE INDEX IF NOT EXISTS idx_square_webhook_events_received_at
  ON public.lodging_square_webhook_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_square_webhook_events_reservation
  ON public.lodging_square_webhook_events (reservation_id) WHERE reservation_id IS NOT NULL;

ALTER TABLE public.lodging_square_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role manages square events" ON public.lodging_square_webhook_events;
CREATE POLICY "service role manages square events"
  ON public.lodging_square_webhook_events
  AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Provider-agnostic last-event timestamp on lodge_reservations so the UI
-- timeline can surface "Updated 12s ago via PayPal/Square" the same way it
-- does for Stripe. Keep stripe_last_event_* for backwards compatibility.
ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS paypal_last_event_at timestamptz;
ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS paypal_last_event_type text;
ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS square_last_event_at timestamptz;
ALTER TABLE public.lodge_reservations
  ADD COLUMN IF NOT EXISTS square_last_event_type text;;
