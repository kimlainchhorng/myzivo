-- Add attachment_url column to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT DEFAULT NULL;

-- Add masked phone columns to trips table  
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS customer_masked_phone TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_masked_phone TEXT DEFAULT NULL;

-- Create storage bucket for chat uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat_uploads',
  'chat_uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat_uploads bucket
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat_uploads');

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat_uploads');

CREATE POLICY "Users can update their own chat images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chat_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);;
