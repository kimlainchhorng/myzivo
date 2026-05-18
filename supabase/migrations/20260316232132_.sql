CREATE OR REPLACE FUNCTION public.check_driver_compliance_before_online()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_email TEXT;
  whitelisted_emails TEXT[] := ARRAY['klainkonkat@gmail.com'];
BEGIN
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
    SELECT lower(u.email) INTO driver_email
    FROM auth.users u
    WHERE u.id = NEW.user_id;

    IF driver_email = ANY(whitelisted_emails) THEN
      RETURN NEW;
    END IF;

    IF NEW.documents_verified = false THEN
      RAISE EXCEPTION 'Driver documents are not verified. Please complete document verification before going online.';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.driver_documents
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
$$;

CREATE OR REPLACE FUNCTION public.check_driver_can_go_online()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_email TEXT;
  whitelisted_emails TEXT[] := ARRAY['klainkonkat@gmail.com'];
BEGIN
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
    SELECT lower(u.email) INTO driver_email
    FROM auth.users u
    WHERE u.id = NEW.user_id;

    IF driver_email = ANY(whitelisted_emails) THEN
      RETURN NEW;
    END IF;

    IF NEW.can_go_online = false THEN
      RAISE EXCEPTION 'Driver onboarding not complete. Please complete your application first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;;
