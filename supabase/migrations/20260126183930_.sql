-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-documents', 'driver-documents', false);

-- Create documents table to track uploads
CREATE TABLE public.driver_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'insurance', 'registration')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own documents
CREATE POLICY "Drivers can view their own documents"
ON public.driver_documents FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- Drivers can upload their own documents
CREATE POLICY "Drivers can insert their own documents"
ON public.driver_documents FOR INSERT
WITH CHECK (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- Drivers can delete their own pending documents
CREATE POLICY "Drivers can delete their own pending documents"
ON public.driver_documents FOR DELETE
USING (
  status = 'pending' AND
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
ON public.driver_documents FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for driver-documents bucket
CREATE POLICY "Drivers can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can access all driver documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'driver-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);;
