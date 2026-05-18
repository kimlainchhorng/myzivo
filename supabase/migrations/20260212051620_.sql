
-- Transport Hubs
CREATE TABLE public.transport_hubs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  hub_type text NOT NULL CHECK (hub_type IN ('airport', 'train_station', 'bus_terminal')),
  address text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  city text,
  is_active boolean NOT NULL DEFAULT true,
  airport_fee numeric NOT NULL DEFAULT 0,
  flat_rate_enabled boolean NOT NULL DEFAULT false,
  flat_rate_amount numeric,
  surge_multiplier_override numeric,
  max_queue_size integer NOT NULL DEFAULT 50,
  queue_enabled boolean NOT NULL DEFAULT true,
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Hub Zones
CREATE TABLE public.hub_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id uuid NOT NULL REFERENCES public.transport_hubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  zone_type text NOT NULL CHECK (zone_type IN ('pickup', 'dropoff')),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  instructions text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Hub Driver Queue
CREATE TABLE public.hub_driver_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id uuid NOT NULL REFERENCES public.transport_hubs(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  position integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'completed', 'left')),
  assigned_at timestamptz,
  left_at timestamptz,
  trip_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Hub Metrics
CREATE TABLE public.hub_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id uuid NOT NULL REFERENCES public.transport_hubs(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  drivers_in_queue integer NOT NULL DEFAULT 0,
  trips_completed integer NOT NULL DEFAULT 0,
  avg_wait_time_min numeric,
  revenue_cents integer NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX idx_hub_zones_hub ON public.hub_zones(hub_id);
CREATE INDEX idx_hub_driver_queue_fifo ON public.hub_driver_queue(hub_id, status, position);
CREATE INDEX idx_hub_driver_queue_driver ON public.hub_driver_queue(driver_id, status);
CREATE INDEX idx_hub_metrics_hub_ts ON public.hub_metrics(hub_id, timestamp DESC);
CREATE INDEX idx_transport_hubs_active ON public.transport_hubs(is_active);

-- Partial unique: one waiting entry per driver per hub
CREATE UNIQUE INDEX idx_hub_queue_unique_waiting ON public.hub_driver_queue(hub_id, driver_id) WHERE status = 'waiting';

-- RLS
ALTER TABLE public.transport_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_driver_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_metrics ENABLE ROW LEVEL SECURITY;

-- Admin policies for transport_hubs
CREATE POLICY "Admin full access on transport_hubs" ON public.transport_hubs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations'))
  );

-- Admin policies for hub_zones
CREATE POLICY "Admin full access on hub_zones" ON public.hub_zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations'))
  );

-- hub_driver_queue: admins full, drivers own rows
CREATE POLICY "Admin full access on hub_driver_queue" ON public.hub_driver_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations'))
  );

CREATE POLICY "Drivers manage own queue entries" ON public.hub_driver_queue
  FOR ALL USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- hub_metrics: admin only
CREATE POLICY "Admin access on hub_metrics" ON public.hub_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','operations'))
  );

-- Trigger for updated_at
CREATE TRIGGER update_transport_hubs_updated_at
  BEFORE UPDATE ON public.transport_hubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
