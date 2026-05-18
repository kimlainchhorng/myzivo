-- Create vehicle_inspections table for formal inspections
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  inspection_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  completed_date date,
  expiry_date date,
  notes text,
  receipt_url text,
  admin_status text DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own inspections" ON public.vehicle_inspections
  FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert own inspections" ON public.vehicle_inspections
  FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own inspections" ON public.vehicle_inspections
  FOR UPDATE USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all inspections" ON public.vehicle_inspections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE INDEX idx_vehicle_inspections_vehicle ON public.vehicle_inspections(vehicle_id);
CREATE INDEX idx_vehicle_inspections_status ON public.vehicle_inspections(status);
CREATE INDEX idx_vehicle_inspections_due ON public.vehicle_inspections(due_date);;
