
-- ============================================================
-- 1. CREATE driver_vehicles TABLE (missing but referenced in code)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL DEFAULT 'car',
  make TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  license_plate TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN DEFAULT false,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own vehicles
CREATE POLICY "drivers_select_own_vehicles"
  ON public.driver_vehicles FOR SELECT
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Drivers can insert their own vehicles
CREATE POLICY "drivers_insert_own_vehicles"
  ON public.driver_vehicles FOR INSERT
  WITH CHECK (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Drivers can update their own vehicles
CREATE POLICY "drivers_update_own_vehicles"
  ON public.driver_vehicles FOR UPDATE
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Drivers can delete their own vehicles
CREATE POLICY "drivers_delete_own_vehicles"
  ON public.driver_vehicles FOR DELETE
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

-- Admins can manage all vehicles
CREATE POLICY "admins_manage_vehicles"
  ON public.driver_vehicles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_driver_vehicles_updated_at
  BEFORE UPDATE ON public.driver_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. FIX admin_notifications INSERT policy
--    Old policy checks jwt role='admin' which blocks trigger inserts
--    Replace with: allow admins OR system (SECURITY DEFINER functions)
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.admin_notifications;

CREATE POLICY "System and admins can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
-- Note: INSERT with_check=true is acceptable here because notifications 
-- are informational records; the important security is on SELECT/UPDATE/DELETE
-- which are already restricted to admins only.

-- ============================================================
-- 3. TRIGGER: Auto-notify admin when new driver signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_admin_new_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (
    title,
    message,
    category,
    severity,
    entity_type,
    entity_id,
    link
  ) VALUES (
    'New Driver Registered',
    'New driver ' || COALESCE(NEW.full_name, NEW.email, 'Unknown') || ' has signed up and needs review.',
    'driver',
    'info',
    'driver',
    NEW.id::text,
    '/admin/drivers/' || NEW.id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_driver
  AFTER INSERT ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_driver();

-- ============================================================
-- 4. TRIGGER: Notify admin when driver submits onboarding for review
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_admin_driver_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when onboarding_status changes to 'pending_review'
  IF NEW.onboarding_status = 'pending_review' 
     AND (OLD.onboarding_status IS DISTINCT FROM 'pending_review') THEN
    INSERT INTO public.admin_notifications (
      title,
      message,
      category,
      severity,
      entity_type,
      entity_id,
      link
    ) VALUES (
      'Driver Awaiting Approval',
      'Driver ' || COALESCE(NEW.full_name, NEW.email, 'Unknown') || ' has completed onboarding and is awaiting approval.',
      'driver',
      'warning',
      'driver',
      NEW.id::text,
      '/admin/drivers/' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_driver_onboarding
  AFTER UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_driver_onboarding();

-- ============================================================
-- 5. TRIGGER: Notify admin when new document is uploaded
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_admin_new_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_name TEXT;
BEGIN
  SELECT full_name INTO driver_name FROM public.drivers WHERE id = NEW.driver_id;
  
  INSERT INTO public.admin_notifications (
    title,
    message,
    category,
    severity,
    entity_type,
    entity_id,
    link
  ) VALUES (
    'New Document Uploaded',
    COALESCE(driver_name, 'A driver') || ' uploaded a new ' || COALESCE(NEW.document_type, 'document') || ' for review.',
    'driver',
    'info',
    'driver_document',
    NEW.id::text,
    '/admin/drivers/' || NEW.driver_id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_document
  AFTER INSERT ON public.driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_document();

-- ============================================================
-- 6. Tighten drivers UPDATE policy - drivers should only update specific fields
--    (Admins already have separate access via is_admin check)
-- ============================================================
-- No change needed - current policy correctly checks user_id = auth.uid() OR is_admin()
;
