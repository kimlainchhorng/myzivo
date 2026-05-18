-- =============================================
-- Document Auto-Expiration & Renewal System
-- =============================================

-- 1. Add new columns to driver_documents
ALTER TABLE public.driver_documents
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS expires_status text DEFAULT 'valid',
ADD COLUMN IF NOT EXISTS renewal_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS renewal_requested_by uuid REFERENCES auth.users(id);

-- Add constraint for expires_status
ALTER TABLE public.driver_documents
ADD CONSTRAINT driver_documents_expires_status_check 
CHECK (expires_status IN ('valid', 'expiring_soon', 'expired'));

-- 2. Add new columns to merchant_documents
ALTER TABLE public.merchant_documents
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS expires_status text DEFAULT 'valid',
ADD COLUMN IF NOT EXISTS renewal_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS renewal_requested_by uuid REFERENCES auth.users(id);

-- Add constraint for expires_status
ALTER TABLE public.merchant_documents
ADD CONSTRAINT merchant_documents_expires_status_check 
CHECK (expires_status IN ('valid', 'expiring_soon', 'expired'));

-- 3. Add compliance status to drivers
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'ok',
ADD COLUMN IF NOT EXISTS restricted_reason text;

-- Add constraint
ALTER TABLE public.drivers
ADD CONSTRAINT drivers_compliance_status_check 
CHECK (compliance_status IN ('ok', 'restricted'));

-- 4. Add compliance status to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'ok',
ADD COLUMN IF NOT EXISTS restricted_reason text;

-- Add constraint
ALTER TABLE public.restaurants
ADD CONSTRAINT restaurants_compliance_status_check 
CHECK (compliance_status IN ('ok', 'restricted'));

-- 5. Create compliance_reminders table
CREATE TABLE IF NOT EXISTS public.compliance_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  document_table text NOT NULL DEFAULT 'driver_documents',
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  remind_days_before integer NOT NULL,
  remind_at timestamptz NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  method text DEFAULT 'sms',
  error_message text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT compliance_reminders_entity_type_check 
    CHECK (entity_type IN ('driver', 'merchant')),
  CONSTRAINT compliance_reminders_remind_days_check 
    CHECK (remind_days_before IN (1, 7, 14, 30)),
  CONSTRAINT compliance_reminders_method_check 
    CHECK (method IN ('sms', 'email', 'push', 'admin_task'))
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_compliance_reminders_remind_at 
ON public.compliance_reminders(remind_at) WHERE sent = false;

CREATE INDEX IF NOT EXISTS idx_compliance_reminders_document_id 
ON public.compliance_reminders(document_id);

CREATE INDEX IF NOT EXISTS idx_compliance_reminders_entity 
ON public.compliance_reminders(entity_type, entity_id);

-- Index for expires_status queries
CREATE INDEX IF NOT EXISTS idx_driver_documents_expires_status 
ON public.driver_documents(expires_status) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merchant_documents_expires_status 
ON public.merchant_documents(expires_status) WHERE expires_at IS NOT NULL;

-- Index for compliance status
CREATE INDEX IF NOT EXISTS idx_drivers_compliance_status 
ON public.drivers(compliance_status);

CREATE INDEX IF NOT EXISTS idx_restaurants_compliance_status 
ON public.restaurants(compliance_status);

-- 6. Enable RLS on compliance_reminders
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view compliance_reminders"
ON public.compliance_reminders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert compliance_reminders"
ON public.compliance_reminders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update compliance_reminders"
ON public.compliance_reminders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete compliance_reminders"
ON public.compliance_reminders
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. Create function to generate reminders when document is approved
CREATE OR REPLACE FUNCTION public.generate_driver_document_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate reminders for approved docs with expiry date
  IF NEW.status = 'approved' AND NEW.expires_at IS NOT NULL THEN
    -- Delete any existing reminders for this document
    DELETE FROM compliance_reminders 
    WHERE document_id = NEW.id AND document_table = 'driver_documents';
    
    -- Insert new reminders for 30, 14, 7, 1 days before expiry
    INSERT INTO compliance_reminders (
      document_id, 
      document_table,
      entity_type, 
      entity_id, 
      remind_days_before, 
      remind_at
    )
    SELECT 
      NEW.id,
      'driver_documents',
      'driver',
      NEW.driver_id,
      days,
      NEW.expires_at - (days || ' days')::interval
    FROM unnest(ARRAY[30, 14, 7, 1]) AS days
    WHERE NEW.expires_at - (days || ' days')::interval > NOW();
  ELSIF NEW.status != 'approved' OR NEW.expires_at IS NULL THEN
    -- Remove reminders if document is no longer approved or has no expiry
    DELETE FROM compliance_reminders 
    WHERE document_id = NEW.id AND document_table = 'driver_documents';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for driver documents
DROP TRIGGER IF EXISTS trigger_generate_driver_document_reminders ON public.driver_documents;
CREATE TRIGGER trigger_generate_driver_document_reminders
AFTER INSERT OR UPDATE OF status, expires_at ON public.driver_documents
FOR EACH ROW
EXECUTE FUNCTION public.generate_driver_document_reminders();

-- 8. Create function to generate reminders for merchant documents
CREATE OR REPLACE FUNCTION public.generate_merchant_document_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate reminders for approved docs with expiry date
  IF NEW.status = 'approved' AND NEW.expires_at IS NOT NULL THEN
    -- Delete any existing reminders for this document
    DELETE FROM compliance_reminders 
    WHERE document_id = NEW.id AND document_table = 'merchant_documents';
    
    -- Insert new reminders for 30, 14, 7, 1 days before expiry
    INSERT INTO compliance_reminders (
      document_id, 
      document_table,
      entity_type, 
      entity_id, 
      remind_days_before, 
      remind_at
    )
    SELECT 
      NEW.id,
      'merchant_documents',
      'merchant',
      NEW.merchant_id,
      days,
      NEW.expires_at - (days || ' days')::interval
    FROM unnest(ARRAY[30, 14, 7, 1]) AS days
    WHERE NEW.expires_at - (days || ' days')::interval > NOW();
  ELSIF NEW.status != 'approved' OR NEW.expires_at IS NULL THEN
    -- Remove reminders if document is no longer approved or has no expiry
    DELETE FROM compliance_reminders 
    WHERE document_id = NEW.id AND document_table = 'merchant_documents';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for merchant documents
DROP TRIGGER IF EXISTS trigger_generate_merchant_document_reminders ON public.merchant_documents;
CREATE TRIGGER trigger_generate_merchant_document_reminders
AFTER INSERT OR UPDATE OF status, expires_at ON public.merchant_documents
FOR EACH ROW
EXECUTE FUNCTION public.generate_merchant_document_reminders();

-- 9. Add scheduled jobs for expiration check and reminders
INSERT INTO public.automation_jobs (
  slug,
  name,
  description,
  job_type,
  cron_expression,
  is_enabled,
  config
) VALUES 
(
  'compliance-expiration-check',
  'Compliance Expiration Check',
  'Daily job to check document expiration status and enforce compliance',
  'compliance',
  '0 2 * * *',
  true,
  '{"endpoint": "admin-compliance-expiration-check"}'::jsonb
),
(
  'compliance-send-reminders',
  'Compliance Send Reminders',
  'Daily job to send document renewal reminders via SMS',
  'compliance',
  '0 9 * * *',
  true,
  '{"endpoint": "admin-compliance-send-reminders"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  config = EXCLUDED.config;;
