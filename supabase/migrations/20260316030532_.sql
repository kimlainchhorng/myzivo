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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;;
