-- Backfill: set avatar_url to the approved photo storage path for drivers who have approved photos but no avatar_url
UPDATE public.drivers d
SET avatar_url = dd.file_path
FROM public.driver_documents dd
WHERE dd.driver_id = d.id
  AND dd.document_type IN ('photo', 'profile_photo')
  AND dd.status = 'approved'
  AND dd.file_path IS NOT NULL
  AND (d.avatar_url IS NULL OR d.avatar_url = '');;
