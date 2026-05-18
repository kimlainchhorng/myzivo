-- =============================================
-- Compliance & KYC Center Migration
-- =============================================

-- 1. Create merchant_documents table
CREATE TABLE public.merchant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  expires_at date,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  CONSTRAINT merchant_documents_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  CONSTRAINT merchant_documents_type_check CHECK (document_type IN ('business_license', 'food_permit', 'insurance', 'tax_id', 'other'))
);

CREATE INDEX idx_merchant_documents_merchant ON public.merchant_documents(merchant_id);
CREATE INDEX idx_merchant_documents_status ON public.merchant_documents(status);
CREATE INDEX idx_merchant_documents_expires ON public.merchant_documents(expires_at) WHERE expires_at IS NOT NULL;

-- 2. Create compliance_alerts table
CREATE TABLE public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  document_id uuid,
  alert_type text NOT NULL,
  message text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT compliance_alerts_entity_type_check CHECK (entity_type IN ('driver', 'merchant')),
  CONSTRAINT compliance_alerts_alert_type_check CHECK (alert_type IN ('expiring_soon', 'expired', 'missing', 'rejected'))
);

CREATE INDEX idx_compliance_alerts_entity ON public.compliance_alerts(entity_type, entity_id);
CREATE INDEX idx_compliance_alerts_unresolved ON public.compliance_alerts(is_resolved) WHERE is_resolved = false;

-- 3. Add columns to driver_documents if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'driver_documents' AND column_name = 'rejection_reason') THEN
    ALTER TABLE public.driver_documents ADD COLUMN rejection_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'driver_documents' AND column_name = 'approved_by') THEN
    ALTER TABLE public.driver_documents ADD COLUMN approved_by uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'driver_documents' AND column_name = 'approved_at') THEN
    ALTER TABLE public.driver_documents ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

-- 4. Add documents_verified to restaurants if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'documents_verified') THEN
    ALTER TABLE public.restaurants ADD COLUMN documents_verified boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 5. Enable RLS on new tables
ALTER TABLE public.merchant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for merchant_documents (admin only via is_admin())
CREATE POLICY "Admins can manage merchant documents"
  ON public.merchant_documents
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. RLS Policies for compliance_alerts (admin only via is_admin())
CREATE POLICY "Admins can manage compliance alerts"
  ON public.compliance_alerts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Add admin update policy for driver_documents
DROP POLICY IF EXISTS "Admins can update driver documents" ON public.driver_documents;
CREATE POLICY "Admins can update driver documents"
  ON public.driver_documents
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. Enforcement trigger to prevent drivers from going online without compliance
CREATE OR REPLACE FUNCTION check_driver_compliance_before_online()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check when setting is_online to true
  IF NEW.is_online = true AND (OLD.is_online = false OR OLD.is_online IS NULL) THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS driver_compliance_check ON public.drivers;
CREATE TRIGGER driver_compliance_check
BEFORE UPDATE OF is_online ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION check_driver_compliance_before_online();

-- 10. Function to generate compliance alerts (can be called by cron)
CREATE OR REPLACE FUNCTION generate_compliance_alerts()
RETURNS void AS $$
DECLARE
  days_warning INTEGER := 7;
BEGIN
  -- Mark expired driver documents
  UPDATE driver_documents
  SET status = 'expired'
  WHERE status = 'approved'
  AND expires_at IS NOT NULL
  AND expires_at < CURRENT_DATE;
  
  -- Mark expired merchant documents
  UPDATE merchant_documents
  SET status = 'expired'
  WHERE status = 'approved'
  AND expires_at IS NOT NULL
  AND expires_at < CURRENT_DATE;
  
  -- Update drivers with expired docs to unverified
  UPDATE drivers d
  SET documents_verified = false
  WHERE documents_verified = true
  AND EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = d.id
    AND dd.status = 'expired'
  );
  
  -- Update merchants with expired docs to unverified
  UPDATE restaurants r
  SET documents_verified = false
  WHERE documents_verified = true
  AND EXISTS (
    SELECT 1 FROM merchant_documents md
    WHERE md.merchant_id = r.id
    AND md.status = 'expired'
  );
  
  -- Create expiring_soon alerts for drivers (7 days)
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'driver',
    driver_id,
    id,
    'expiring_soon',
    document_type || ' expires in ' || (expires_at - CURRENT_DATE) || ' days'
  FROM driver_documents
  WHERE status = 'approved'
  AND expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + days_warning
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = driver_documents.id
    AND ca.alert_type = 'expiring_soon'
    AND ca.is_resolved = false
  );
  
  -- Create expired alerts for drivers
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'driver',
    driver_id,
    id,
    'expired',
    document_type || ' has expired'
  FROM driver_documents
  WHERE status = 'expired'
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = driver_documents.id
    AND ca.alert_type = 'expired'
    AND ca.is_resolved = false
  );
  
  -- Create expiring_soon alerts for merchants (7 days)
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'merchant',
    merchant_id,
    id,
    'expiring_soon',
    document_type || ' expires in ' || (expires_at - CURRENT_DATE) || ' days'
  FROM merchant_documents
  WHERE status = 'approved'
  AND expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + days_warning
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = merchant_documents.id
    AND ca.alert_type = 'expiring_soon'
    AND ca.is_resolved = false
  );
  
  -- Create expired alerts for merchants
  INSERT INTO compliance_alerts (entity_type, entity_id, document_id, alert_type, message)
  SELECT 
    'merchant',
    merchant_id,
    id,
    'expired',
    document_type || ' has expired'
  FROM merchant_documents
  WHERE status = 'expired'
  AND NOT EXISTS (
    SELECT 1 FROM compliance_alerts ca
    WHERE ca.document_id = merchant_documents.id
    AND ca.alert_type = 'expired'
    AND ca.is_resolved = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create storage bucket for merchant documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'merchant-documents',
  'merchant-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 12. Storage RLS for merchant-documents bucket
DROP POLICY IF EXISTS "Admins can manage merchant documents storage" ON storage.objects;
CREATE POLICY "Admins can manage merchant documents storage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'merchant-documents' AND public.is_admin())
  WITH CHECK (bucket_id = 'merchant-documents' AND public.is_admin());;
