INSERT INTO storage.buckets (id, name, public)
  VALUES ('zivo-service-photos', 'zivo-service-photos', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS zivo_service_photos_read    ON storage.objects;
DROP POLICY IF EXISTS zivo_service_photos_insert  ON storage.objects;
DROP POLICY IF EXISTS zivo_service_photos_delete  ON storage.objects;

CREATE POLICY zivo_service_photos_read ON storage.objects FOR SELECT USING (
  bucket_id = 'zivo-service-photos'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT so.id FROM public.service_orders so WHERE
      so.customer_id = auth.uid()
      OR so.driver_id IN (SELECT d.id FROM public.drivers d WHERE d.user_id = auth.uid())
      OR so.shop_id   IN (SELECT r.id FROM public.restaurants r WHERE r.owner_id = auth.uid())
  )
);

CREATE POLICY zivo_service_photos_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'zivo-service-photos'
  AND auth.uid() = owner
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT so.id FROM public.service_orders so
    JOIN public.drivers d ON d.id = so.driver_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY zivo_service_photos_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'zivo-service-photos'
  AND auth.uid() = owner
);;
