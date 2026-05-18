
-- Trigger function: when a pending_profile_changes row is approved for avatar, update drivers.avatar_url
CREATE OR REPLACE FUNCTION public.handle_avatar_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.change_type = 'avatar' THEN
    UPDATE public.drivers
    SET avatar_url = NEW.change_data->>'public_url',
        updated_at = now()
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_avatar_approved
  AFTER UPDATE ON public.pending_profile_changes
  FOR EACH ROW
  WHEN (NEW.change_type = 'avatar' AND NEW.status = 'approved' AND OLD.status = 'pending')
  EXECUTE FUNCTION public.handle_avatar_approval();
;
