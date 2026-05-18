-- Fix: Set can_go_online = true for verified drivers who have it incorrectly set to false
UPDATE public.drivers 
SET can_go_online = true 
WHERE status = 'verified' 
  AND can_go_online = false;

-- Update the trigger to allow whitelisted emails to bypass the check
CREATE OR REPLACE FUNCTION public.check_driver_can_go_online()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whitelisted_emails TEXT[] := ARRAY['chhorngkimlain1@gmail.com'];
BEGIN
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
    -- Allow whitelisted emails to bypass
    IF NEW.email = ANY(whitelisted_emails) THEN
      RETURN NEW;
    END IF;
    
    -- Check can_go_online flag
    IF NEW.can_go_online = false THEN
      RAISE EXCEPTION 'Driver onboarding not complete. Please complete your application first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;;
