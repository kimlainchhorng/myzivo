-- Add missing UPDATE policy for driver-documents storage bucket
CREATE POLICY "Drivers can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);;
