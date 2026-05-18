-- Create dispatch_settings table for global dispatch configuration
CREATE TABLE public.dispatch_settings (
  id int PRIMARY KEY DEFAULT 1,
  dispatch_enabled boolean DEFAULT true,
  max_search_radius_km numeric(5,2) DEFAULT 5.0,
  offer_timeout_seconds int DEFAULT 15,
  max_drivers_notified int DEFAULT 5,
  max_attempts int DEFAULT 5,
  -- Priority weights (0-100, sum determines relative importance)
  distance_weight int DEFAULT 50,
  rating_weight int DEFAULT 30,
  idle_time_weight int DEFAULT 20,
  -- Priority toggles
  prefer_nearest boolean DEFAULT true,
  prefer_high_rating boolean DEFAULT true,
  prefer_idle_drivers boolean DEFAULT true,
  -- Thresholds
  min_driver_rating numeric(3,2) DEFAULT 4.0,
  max_idle_minutes int DEFAULT 60,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO public.dispatch_settings (id) VALUES (1);

-- Enable RLS
ALTER TABLE public.dispatch_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Authenticated users can read dispatch settings"
  ON public.dispatch_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admin can update dispatch settings"
  ON public.dispatch_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );;
