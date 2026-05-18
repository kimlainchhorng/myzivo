-- merchant-documents had 0 RLS policies and 0 objects, leaving it unusable
-- through the JS client. Add the standard owner-folder pattern (first path
-- segment must equal the user's UUID) so it can actually be used when needed
-- without giving anyone access to anyone else's docs.
CREATE POLICY "merchant_documents_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'merchant-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "merchant_documents_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'merchant-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "merchant_documents_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'merchant-documents' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'merchant-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "merchant_documents_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'merchant-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);;
