
-- Photo proof columns (URLs into the deliveries-proof storage bucket)
ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS pickup_proof_url   text,
  ADD COLUMN IF NOT EXISTS delivery_proof_url text;

-- Customer ↔ driver chat thread tied to a delivery. Each delivery gets at
-- most one thread; we keep messages here rather than reusing direct_messages
-- so future privacy/retention rules can target delivery chat specifically.
CREATE TABLE IF NOT EXISTS public.delivery_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id   uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  sender_id     uuid NOT NULL,
  body          text NOT NULL CHECK (length(btrim(body)) > 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  read_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_delivery_messages_delivery_created
  ON public.delivery_messages (delivery_id, created_at DESC);

ALTER TABLE public.delivery_messages ENABLE ROW LEVEL SECURITY;

-- Only the customer or assigned driver of the parent delivery can read/write
-- a message. Admin override included for moderation.
DROP POLICY IF EXISTS delivery_messages_select ON public.delivery_messages;
CREATE POLICY delivery_messages_select
  ON public.delivery_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = delivery_messages.delivery_id
        AND ((d.customer_user_id = (SELECT auth.uid()))
             OR (d.driver_user_id = (SELECT auth.uid()))
             OR is_admin((SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS delivery_messages_insert ON public.delivery_messages;
CREATE POLICY delivery_messages_insert
  ON public.delivery_messages
  FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = delivery_messages.delivery_id
        AND ((d.customer_user_id = (SELECT auth.uid()))
             OR (d.driver_user_id = (SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS delivery_messages_update_read ON public.delivery_messages;
CREATE POLICY delivery_messages_update_read
  ON public.delivery_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = delivery_messages.delivery_id
        AND ((d.customer_user_id = (SELECT auth.uid()))
             OR (d.driver_user_id = (SELECT auth.uid())))
    )
  );

-- Allow the customer to cancel their own delivery while it's still pre-pickup.
-- Existing zivo_deliveries_update only allowed the customer while status='requested';
-- expand it to cover 'pending' and 'accepted' (driver assigned but not yet picked up).
DROP POLICY IF EXISTS zivo_deliveries_customer_cancel ON public.deliveries;
CREATE POLICY zivo_deliveries_customer_cancel
  ON public.deliveries
  FOR UPDATE
  USING (
    customer_user_id = (SELECT auth.uid())
    AND status IN ('requested','pending','accepted')
  )
  WITH CHECK (
    customer_user_id = (SELECT auth.uid())
    AND status IN ('cancelled','requested','pending','accepted')
  );

-- Storage bucket for proof-of-pickup / proof-of-delivery photos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: any authenticated participant of the delivery can read their own,
-- only the assigned driver can upload.
DROP POLICY IF EXISTS delivery_proofs_read ON storage.objects;
CREATE POLICY delivery_proofs_read
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'delivery-proofs'
    AND EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE (storage.foldername(name))[1] = d.id::text
        AND ((d.customer_user_id = (SELECT auth.uid()))
             OR (d.driver_user_id = (SELECT auth.uid()))
             OR is_admin((SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS delivery_proofs_upload ON storage.objects;
CREATE POLICY delivery_proofs_upload
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-proofs'
    AND EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE (storage.foldername(name))[1] = d.id::text
        AND d.driver_user_id = (SELECT auth.uid())
    )
  );
;
