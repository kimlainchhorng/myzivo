-- Drop and recreate the compliance trigger with whitelist bypass
CREATE OR REPLACE FUNCTION public.check_driver_compliance_before_online()
RETURNS TRIGGER AS $$
DECLARE
  driver_email TEXT;
  whitelisted_emails TEXT[] := ARRAY['chhorngkimlain1@gmail.com'];
BEGIN
  -- Only check when setting is_online to true
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
    
    -- Get driver's email for whitelist check
    SELECT u.email INTO driver_email
    FROM auth.users u
    WHERE u.id = NEW.user_id;
    
    -- Skip checks for whitelisted emails
    IF driver_email = ANY(whitelisted_emails) THEN
      RETURN NEW;
    END IF;
    
    -- Check if documents_verified is true
    IF NEW.documents_verified = false THEN
      RAISE EXCEPTION 'Driver documents are not verified. Please complete document verification before going online.';
    END IF;
    
    -- Check if any required documents are expired
    IF EXISTS (
      SELECT 1 FROM driver_documents
      WHERE driver_id = NEW.id
      AND status = 'approved'
      AND expires_at IS NOT NULL
      AND expires_at < CURRENT_DATE
    ) THEN
      RAISE EXCEPTION 'Driver has expired documents. Please renew your documents before going online.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;;
