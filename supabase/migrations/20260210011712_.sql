
CREATE TABLE public.repositioning_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.regions(id),
  zone_name TEXT NOT NULL,
  message TEXT NOT NULL,
  gap NUMERIC NOT NULL DEFAULT 0,
  forecast_window_min INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.repositioning_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read repositioning_alerts"
  ON public.repositioning_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert repositioning_alerts"
  ON public.repositioning_alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
;
