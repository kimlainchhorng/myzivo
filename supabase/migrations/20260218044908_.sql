
-- Drop any existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trg_notify_admin_new_driver ON public.drivers;
DROP TRIGGER IF EXISTS trg_notify_admin_driver_onboarding ON public.drivers;
DROP TRIGGER IF EXISTS trg_notify_driver_status_change ON public.drivers;
DROP TRIGGER IF EXISTS trg_notify_admin_new_document ON public.driver_documents;

-- 1. New driver signup
CREATE OR REPLACE FUNCTION public.notify_admin_new_driver()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
  VALUES ('driver_signup', 'New Driver Signup: ' || COALESCE(NEW.full_name, NEW.email),
    'A new driver (' || COALESCE(NEW.full_name, 'Unknown') || ' - ' || COALESCE(NEW.email, '') || ') has registered.',
    'info', 'driver', NEW.id, '/admin/applications/drivers');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify_admin_new_driver: %', SQLERRM; RETURN NEW;
END; $$;

-- 2. Driver submits for review
CREATE OR REPLACE FUNCTION public.notify_admin_driver_onboarding()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
  VALUES ('driver_onboarding', 'Application Ready: ' || COALESCE(NEW.full_name, NEW.email),
    'Driver ' || COALESCE(NEW.full_name, 'Unknown') || ' submitted application for review. Vehicle: ' || COALESCE(NEW.vehicle_type, 'N/A'),
    'warning', 'driver', NEW.id, '/admin/applications/drivers');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify_admin_driver_onboarding: %', SQLERRM; RETURN NEW;
END; $$;

-- 3. New document upload
CREATE OR REPLACE FUNCTION public.notify_admin_new_document()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE driver_name TEXT;
BEGIN
  SELECT full_name INTO driver_name FROM public.drivers WHERE id = NEW.driver_id;
  INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
  VALUES ('driver_document', 'Document Uploaded: ' || REPLACE(NEW.document_type, '_', ' '),
    'Driver ' || COALESCE(driver_name, 'Unknown') || ' uploaded ' || REPLACE(NEW.document_type, '_', ' '),
    'info', 'driver_document', NEW.driver_id, '/admin/applications/drivers');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify_admin_new_document: %', SQLERRM; RETURN NEW;
END; $$;

-- 4. Status change audit trail
CREATE OR REPLACE FUNCTION public.notify_driver_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.onboarding_status = 'approved' AND OLD.onboarding_status IS DISTINCT FROM 'approved' THEN
    INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
    VALUES ('driver_approved', 'Driver Approved: ' || COALESCE(NEW.full_name, NEW.email),
      'Driver ' || COALESCE(NEW.full_name, 'Unknown') || ' approved and can go online.', 'info', 'driver', NEW.id, '/admin/applications/drivers');
  ELSIF NEW.onboarding_status = 'rejected' AND OLD.onboarding_status IS DISTINCT FROM 'rejected' THEN
    INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
    VALUES ('driver_rejected', 'Driver Rejected: ' || COALESCE(NEW.full_name, NEW.email),
      'Driver ' || COALESCE(NEW.full_name, 'Unknown') || ' rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'N/A'),
      'warning', 'driver', NEW.id, '/admin/applications/drivers');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify_driver_status_change: %', SQLERRM; RETURN NEW;
END; $$;

-- Create all triggers
CREATE TRIGGER trg_notify_admin_new_driver
  AFTER INSERT ON public.drivers FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_driver();

CREATE TRIGGER trg_notify_admin_driver_onboarding
  AFTER UPDATE ON public.drivers FOR EACH ROW
  WHEN (NEW.onboarding_status = 'pending_review' AND OLD.onboarding_status IS DISTINCT FROM 'pending_review')
  EXECUTE FUNCTION public.notify_admin_driver_onboarding();

CREATE TRIGGER trg_notify_driver_status_change
  AFTER UPDATE ON public.drivers FOR EACH ROW
  WHEN (NEW.onboarding_status IS DISTINCT FROM OLD.onboarding_status)
  EXECUTE FUNCTION public.notify_driver_status_change();

CREATE TRIGGER trg_notify_admin_new_document
  AFTER INSERT ON public.driver_documents FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_document();
;
