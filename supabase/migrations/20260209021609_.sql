-- Create bundling settings table (single-row config)
CREATE TABLE public.bundling_settings (
  id int PRIMARY KEY DEFAULT 1,
  bundling_enabled boolean NOT NULL DEFAULT true,
  max_orders_per_bundle int NOT NULL DEFAULT 3,
  max_distance_miles numeric(5,2) NOT NULL DEFAULT 2.0,
  max_delay_minutes int NOT NULL DEFAULT 10,
  min_savings_threshold_cents int NOT NULL DEFAULT 200,
  same_restaurant_only boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT bundling_settings_single_row CHECK (id = 1),
  CONSTRAINT bundling_settings_max_orders_range CHECK (max_orders_per_bundle BETWEEN 2 AND 10),
  CONSTRAINT bundling_settings_distance_positive CHECK (max_distance_miles > 0),
  CONSTRAINT bundling_settings_delay_positive CHECK (max_delay_minutes > 0)
);

-- Insert default settings row
INSERT INTO public.bundling_settings (id) VALUES (1);

-- Enable RLS
ALTER TABLE public.bundling_settings ENABLE ROW LEVEL SECURITY;

-- Admin can read settings
CREATE POLICY "Admins can view bundling settings"
ON public.bundling_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Admin can update settings
CREATE POLICY "Admins can update bundling settings"
ON public.bundling_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add comment
COMMENT ON TABLE public.bundling_settings IS 'Single-row table storing order bundling configuration';;
