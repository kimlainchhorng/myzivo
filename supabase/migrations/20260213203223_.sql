
-- Make chat_uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat_uploads';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;

-- Create authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view chat images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat_uploads');
;
