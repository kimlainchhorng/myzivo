-- Restrict storage uploads to safe image extensions only
CREATE POLICY "Only safe image uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp')
  );;
