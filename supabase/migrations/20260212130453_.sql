
-- Batching configuration (single-row pattern)
CREATE TABLE public.batching_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_batch_enabled boolean NOT NULL DEFAULT false,
  max_detour_minutes integer NOT NULL DEFAULT 10,
  distance_threshold_km numeric NOT NULL DEFAULT 3.0,
  max_stops_per_batch integer NOT NULL DEFAULT 6,
  recalculate_on_cancel boolean NOT NULL DEFAULT true,
  recalculate_on_add boolean NOT NULL DEFAULT true,
  traffic_aware boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Seed the single config row
INSERT INTO public.batching_config (id) VALUES (1);

-- Batch lifecycle events
CREATE TABLE public.batch_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.delivery_batches(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_batch_events_batch_created ON public.batch_events (batch_id, created_at DESC);

-- RLS
ALTER TABLE public.batching_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on batching_config"
  ON public.batching_config FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support')));

CREATE POLICY "Admin full access on batch_events"
  ON public.batch_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support')));

-- Updated_at trigger for batching_config
CREATE TRIGGER update_batching_config_updated_at
  BEFORE UPDATE ON public.batching_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
