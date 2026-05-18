-- Link service_orders rows back to the originating product order so the
-- zivo-update-status cascade and cancellation-cascade helpers can find them.
ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS external_order_id uuid,
  ADD COLUMN IF NOT EXISTS external_kind text
    CHECK (external_kind IN ('food_order','shopping_order','ride_request'));

CREATE INDEX IF NOT EXISTS idx_service_orders_external_order
  ON public.service_orders (external_order_id) WHERE external_order_id IS NOT NULL;

-- Useful for cancellation-cascade lookups by kind.
CREATE INDEX IF NOT EXISTS idx_service_orders_kind_status
  ON public.service_orders (kind, status) WHERE status NOT IN ('completed','cancelled');

-- driver-en-route, picked-up, etc. timestamp columns referenced by
-- zivo-update-status. Only add ones that don't already exist.
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS driver_en_route_at timestamptz;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS driver_arrived_at  timestamptz;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS trip_started_at    timestamptz;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS completed_at       timestamptz;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS cancelled_at       timestamptz;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS cancel_source      text;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS delivery_photo_url text;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS updated_at         timestamptz NOT NULL DEFAULT now();;
