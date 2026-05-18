-- Function to create driver notification when profile change is reviewed
CREATE OR REPLACE FUNCTION public.notify_driver_on_profile_change_review()
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
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    
    -- Set notification content based on type and status
    IF NEW.change_type = 'avatar' THEN
      IF NEW.status = 'approved' THEN
        v_title := 'Profile Picture Approved! 🎉';
        v_description := 'Your new profile picture is now active and visible to customers.';
        v_type := 'approval';
        v_icon := 'check-circle';
      ELSE
        v_title := 'Profile Picture Not Approved';
        v_description := COALESCE(NEW.review_notes, 'Please upload a new photo that meets our guidelines.');
        v_type := 'rejection';
        v_icon := 'x-circle';
      END IF;
    ELSIF NEW.change_type = 'document' THEN
      IF NEW.status = 'approved' THEN
        v_title := 'Document Approved! ✓';
        v_description := 'Your document has been verified and approved.';
        v_type := 'approval';
        v_icon := 'file-check';
      ELSE
        v_title := 'Document Not Approved';
        v_description := COALESCE(NEW.review_notes, 'Please resubmit with a valid document.');
        v_type := 'rejection';
        v_icon := 'file-x';
      END IF;
    END IF;
    
    -- Insert notification
    INSERT INTO driver_notifications (driver_id, title, description, type, icon)
    VALUES (NEW.driver_id, v_title, v_description, v_type, v_icon);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile change notifications
DROP TRIGGER IF EXISTS trigger_notify_profile_change ON public.pending_profile_changes;
CREATE TRIGGER trigger_notify_profile_change
  AFTER UPDATE ON public.pending_profile_changes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_driver_on_profile_change_review();

-- Function to notify driver on vehicle approval/rejection
CREATE OR REPLACE FUNCTION public.notify_driver_on_vehicle_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_description TEXT;
  v_type TEXT;
  v_vehicle_name TEXT;
BEGIN
  -- Only trigger when approval_status changes from pending
  IF OLD.approval_status = 'pending' AND NEW.approval_status != 'pending' THEN
    v_vehicle_name := NEW.make || ' ' || NEW.model;
    
    IF NEW.approval_status = 'approved' THEN
      v_title := 'Vehicle Approved! 🚗';
      v_description := v_vehicle_name || ' has been verified and is ready for use.';
      v_type := 'approval';
    ELSE
      v_title := 'Vehicle Not Approved';
      v_description := v_vehicle_name || ' was not approved. Please review and resubmit.';
      v_type := 'rejection';
    END IF;
    
    -- Insert notification
    INSERT INTO driver_notifications (driver_id, title, description, type, icon)
    VALUES (NEW.driver_id, v_title, v_description, v_type, 'car');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for vehicle notifications
DROP TRIGGER IF EXISTS trigger_notify_vehicle_review ON public.vehicles;
CREATE TRIGGER trigger_notify_vehicle_review
  AFTER UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_driver_on_vehicle_review();;
