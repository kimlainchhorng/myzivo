-- Create safety_share_links table for trip-specific expiring links
CREATE TABLE public.safety_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  vehicle_info TEXT,
  driver_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 hours'),
  last_location_lat NUMERIC,
  last_location_lng NUMERIC,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  trip_status TEXT DEFAULT 'en_route',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create safety_messages_queue table for future SMS integration
CREATE TABLE public.safety_messages_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add trip_id and photo_url to safety_incidents if not exists
ALTER TABLE public.safety_incidents 
ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id),
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_share_links_token ON public.safety_share_links(token);
CREATE INDEX IF NOT EXISTS idx_safety_share_links_driver_id ON public.safety_share_links(driver_id);
CREATE INDEX IF NOT EXISTS idx_safety_share_links_trip_id ON public.safety_share_links(trip_id);
CREATE INDEX IF NOT EXISTS idx_safety_share_links_expires_at ON public.safety_share_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_safety_messages_queue_driver_id ON public.safety_messages_queue(driver_id);
CREATE INDEX IF NOT EXISTS idx_safety_messages_queue_status ON public.safety_messages_queue(status);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_trip_id ON public.safety_incidents(trip_id);

-- Enable RLS on new tables
ALTER TABLE public.safety_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_messages_queue ENABLE ROW LEVEL SECURITY;

-- RLS for safety_share_links: drivers can manage their own links
CREATE POLICY "Drivers can manage their own share links"
ON public.safety_share_links
FOR ALL
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Public can read share links by token if not expired
CREATE POLICY "Public can read valid share links by token"
ON public.safety_share_links
FOR SELECT
USING (expires_at > now());

-- RLS for safety_messages_queue: drivers can insert their own messages
CREATE POLICY "Drivers can insert their own messages"
ON public.safety_messages_queue
FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can view their own messages"
ON public.safety_messages_queue
FOR SELECT
USING (driver_id = auth.uid());

-- Create storage bucket for incident photos if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident_photos',
  'incident_photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for incident_photos bucket
CREATE POLICY "Drivers can upload incident photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'incident_photos' AND auth.role() = 'authenticated');

CREATE POLICY "Incident photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'incident_photos');

CREATE POLICY "Drivers can delete their own incident photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'incident_photos' AND auth.uid()::text = (storage.foldername(name))[1]);;
