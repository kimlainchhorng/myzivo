-- Create vehicles table for driver fleet management
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT NOT NULL,
  vin TEXT,
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'gasoline',
  is_primary BOOLEAN DEFAULT false,
  health_score INTEGER DEFAULT 100,
  next_service_miles INTEGER DEFAULT 5000,
  last_oil_change DATE,
  last_tire_rotation DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vehicle_documents table for insurance/registration/inspection tracking
CREATE TABLE public.vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('insurance', 'registration', 'inspection')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  expires_at DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('valid', 'expiring', 'expired', 'pending')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(vehicle_id, document_type)
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicles - drivers can manage their own vehicles
CREATE POLICY "Drivers can view their own vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own vehicles"
ON public.vehicles FOR INSERT
TO authenticated
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own vehicles"
ON public.vehicles FOR UPDATE
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete their own vehicles"
ON public.vehicles FOR DELETE
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for vehicle_documents
CREATE POLICY "Drivers can view their vehicle documents"
ON public.vehicle_documents FOR SELECT
TO authenticated
USING (vehicle_id IN (
  SELECT v.id FROM public.vehicles v
  JOIN public.drivers d ON v.driver_id = d.id
  WHERE d.user_id = auth.uid()
));

CREATE POLICY "Drivers can insert their vehicle documents"
ON public.vehicle_documents FOR INSERT
TO authenticated
WITH CHECK (vehicle_id IN (
  SELECT v.id FROM public.vehicles v
  JOIN public.drivers d ON v.driver_id = d.id
  WHERE d.user_id = auth.uid()
));

CREATE POLICY "Drivers can update their vehicle documents"
ON public.vehicle_documents FOR UPDATE
TO authenticated
USING (vehicle_id IN (
  SELECT v.id FROM public.vehicles v
  JOIN public.drivers d ON v.driver_id = d.id
  WHERE d.user_id = auth.uid()
));

CREATE POLICY "Drivers can delete their vehicle documents"
ON public.vehicle_documents FOR DELETE
TO authenticated
USING (vehicle_id IN (
  SELECT v.id FROM public.vehicles v
  JOIN public.drivers d ON v.driver_id = d.id
  WHERE d.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_documents;;
