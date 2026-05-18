
-- Emergency Incidents table
CREATE TABLE public.emergency_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_number text NOT NULL UNIQUE,
  incident_type text NOT NULL CHECK (incident_type IN ('accident','safety_issue','customer_complaint','driver_complaint','payment_dispute','technical_issue')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','resolved','closed')),
  title text NOT NULL,
  description text,
  reporter_role text CHECK (reporter_role IN ('customer','driver','merchant','admin')),
  reporter_user_id uuid,
  reporter_name text,
  reporter_contact text,
  related_order_id uuid REFERENCES public.food_orders(id),
  related_driver_id uuid REFERENCES public.drivers(id),
  related_restaurant_id uuid REFERENCES public.restaurants(id),
  city text,
  zone_id uuid REFERENCES public.regions(id),
  location_description text,
  assigned_to uuid,
  assigned_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to emergency_incidents"
ON public.emergency_incidents FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
);

-- Authenticated users can insert (report)
CREATE POLICY "Authenticated users can report incidents"
ON public.emergency_incidents FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_emergency_incidents_updated_at
BEFORE UPDATE ON public.emergency_incidents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_emergency_incidents_status ON public.emergency_incidents(status);
CREATE INDEX idx_emergency_incidents_priority ON public.emergency_incidents(priority);
CREATE INDEX idx_emergency_incidents_type ON public.emergency_incidents(incident_type);
CREATE INDEX idx_emergency_incidents_created ON public.emergency_incidents(created_at DESC);

-- Emergency Incident Notes table
CREATE TABLE public.emergency_incident_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'note' CHECK (note_type IN ('note','status_change','priority_change','assignment','resolution')),
  message text NOT NULL,
  old_value text,
  new_value text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_incident_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to emergency_incident_notes"
ON public.emergency_incident_notes FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
);

CREATE INDEX idx_emergency_notes_incident ON public.emergency_incident_notes(incident_id, created_at);

-- Emergency Incident Attachments table
CREATE TABLE public.emergency_incident_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  uploaded_by uuid,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_incident_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to emergency_incident_attachments"
ON public.emergency_incident_attachments FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations'))
);

-- Authenticated users can insert attachments
CREATE POLICY "Users can add attachments to incidents"
ON public.emergency_incident_attachments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('incident-attachments', 'incident-attachments', false);

CREATE POLICY "Admin can read incident attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-attachments' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations')));

CREATE POLICY "Admin can upload incident attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'incident-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin can delete incident attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'incident-attachments' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations')));
;
