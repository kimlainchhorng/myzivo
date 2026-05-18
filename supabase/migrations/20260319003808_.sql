
CREATE TABLE public.road_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('police', 'traffic', 'accident', 'road_work', 'hazard', 'camera')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  confirmed_count INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.road_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert road reports"
  ON public.road_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read active road reports"
  ON public.road_reports FOR SELECT TO authenticated
  USING (is_active = true AND expires_at > now());

CREATE INDEX idx_road_reports_active ON public.road_reports (is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_road_reports_location ON public.road_reports (lat, lng);
;
