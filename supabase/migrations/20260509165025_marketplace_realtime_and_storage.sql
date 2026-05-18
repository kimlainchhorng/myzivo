
-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_favorites;

-- REPLICA IDENTITY FULL so updates expose old.*
ALTER TABLE public.marketplace_listings REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_offers REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_questions REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_favorites REPLICA IDENTITY FULL;

-- Public storage bucket for marketplace photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-photos', 'marketplace-photos', true, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='market photos public read') THEN
    EXECUTE 'CREATE POLICY "market photos public read" ON storage.objects FOR SELECT USING (bucket_id = ''marketplace-photos'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='market photos owner insert') THEN
    EXECUTE 'CREATE POLICY "market photos owner insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''marketplace-photos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='market photos owner delete') THEN
    EXECUTE 'CREATE POLICY "market photos owner delete" ON storage.objects FOR DELETE USING (bucket_id = ''marketplace-photos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END$$;
;
