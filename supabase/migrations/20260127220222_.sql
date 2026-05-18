-- Create surge_zones table for dynamic surge pricing areas
CREATE TABLE public.surge_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 3.0,
  base_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  peak_hours_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_location_history table for analytics and heatmap generation
CREATE TABLE public.driver_location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  is_online BOOLEAN NOT NULL DEFAULT true,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient time-based queries
CREATE INDEX idx_driver_location_history_driver_time ON public.driver_location_history(driver_id, recorded_at DESC);
CREATE INDEX idx_driver_location_history_time ON public.driver_location_history(recorded_at DESC);
CREATE INDEX idx_surge_zones_active ON public.surge_zones(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.surge_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_location_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for surge_zones (public read, admin write)
CREATE POLICY "Anyone can view active surge zones"
  ON public.surge_zones FOR SELECT
  USING (is_active = true);

-- RLS policies for driver_location_history
CREATE POLICY "Drivers can insert their own location history"
  ON public.driver_location_history FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can view their own location history"
  ON public.driver_location_history FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Insert default surge zones (same as the hardcoded ones)
INSERT INTO public.surge_zones (name, lat, lng, radius_km, base_multiplier) VALUES
  ('Downtown', 40.7128, -74.0060, 3.0, 1.0),
  ('Midtown', 40.7549, -73.9840, 3.0, 1.0),
  ('Upper East Side', 40.7831, -73.9712, 3.0, 1.0),
  ('Brooklyn', 40.6782, -73.9442, 3.0, 1.0),
  ('Queens', 40.7282, -73.7949, 3.0, 1.0);

-- Add trigger for updated_at
CREATE TRIGGER update_surge_zones_updated_at
  BEFORE UPDATE ON public.surge_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
