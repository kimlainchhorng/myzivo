-- Create trigger function to notify drivers when their documents are reviewed
CREATE OR REPLACE FUNCTION public.notify_driver_on_document_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_description TEXT;
  v_type TEXT;
  v_icon TEXT;
  v_doc_name TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Format document type name
    v_doc_name := REPLACE(INITCAP(NEW.document_type), '_', ' ');
    
    IF NEW.status = 'approved' THEN
      v_title := v_doc_name || ' Approved! ✓';
      v_description := 'Your ' || LOWER(v_doc_name) || ' has been verified and approved.';
      v_type := 'approval';
      v_icon := 'file-check';
    ELSE
      v_title := v_doc_name || ' Not Approved';
      v_description := COALESCE(NEW.notes, 'Please resubmit a valid ' || LOWER(v_doc_name) || '.');
      v_type := 'rejection';
      v_icon := 'file-x';
    END IF;
    
    -- Insert notification
    INSERT INTO driver_notifications (driver_id, title, description, type, icon, action_url)
    VALUES (NEW.driver_id, v_title, v_description, v_type, v_icon, '/profile');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on driver_documents table
DROP TRIGGER IF EXISTS trigger_notify_driver_on_document_review ON driver_documents;
CREATE TRIGGER trigger_notify_driver_on_document_review
  AFTER UPDATE ON driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_driver_on_document_review();;
