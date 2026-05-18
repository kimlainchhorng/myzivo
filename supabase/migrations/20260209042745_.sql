-- Create service_status table
CREATE TABLE public.service_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'delayed', 'down')),
  message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.service_status ENABLE ROW LEVEL SECURITY;

-- Drivers can read service status
CREATE POLICY "Anyone can read service status"
ON public.service_status
FOR SELECT
USING (true);

-- Only admins can update service status
CREATE POLICY "Admins can update service status"
ON public.service_status
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert service status
CREATE POLICY "Admins can insert service status"
ON public.service_status
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Seed initial data (dispatch and payments services)
INSERT INTO public.service_status (service_name, status, message) VALUES
  ('dispatch', 'ok', 'Order assignments working normally'),
  ('payments', 'ok', 'Payouts processing normally');

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_status;;
