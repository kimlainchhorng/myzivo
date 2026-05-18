-- Backfill avatar_url for drivers with approved photo documents
UPDATE drivers d
SET avatar_url = dd.file_path, updated_at = now()
FROM driver_documents dd
WHERE dd.driver_id = d.id
  AND dd.document_type = 'photo'
  AND dd.status = 'approved'
  AND (d.avatar_url IS NULL OR d.avatar_url = '');

-- Also create a trigger to auto-set avatar_url when a photo document is approved
CREATE OR REPLACE FUNCTION public.handle_photo_document_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.document_type = 'photo' THEN
    UPDATE public.drivers
    SET avatar_url = NEW.file_path,
        updated_at = now()
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_photo_document_approved ON public.driver_documents;
CREATE TRIGGER on_photo_document_approved
  AFTER UPDATE ON public.driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_photo_document_approved();;
