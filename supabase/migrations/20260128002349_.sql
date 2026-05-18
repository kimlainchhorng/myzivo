-- Add expiration tracking columns to driver_documents table
ALTER TABLE public.driver_documents 
ADD COLUMN IF NOT EXISTS expires_at DATE,
ADD COLUMN IF NOT EXISTS expiry_notified_at TIMESTAMPTZ;

-- Create function to check for expiring documents and create notifications
CREATE OR REPLACE FUNCTION public.check_expiring_documents()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc RECORD;
  notify_count INTEGER := 0;
  days_until_expiry INTEGER;
  v_title TEXT;
  v_description TEXT;
BEGIN
  -- Find documents expiring within 30 days that haven't been notified recently
  FOR doc IN
    SELECT dd.id, dd.driver_id, dd.document_type, dd.expires_at, dd.expiry_notified_at
    FROM driver_documents dd
    WHERE dd.status = 'approved'
      AND dd.expires_at IS NOT NULL
      AND dd.expires_at <= CURRENT_DATE + INTERVAL '30 days'
      AND (dd.expiry_notified_at IS NULL OR dd.expiry_notified_at < CURRENT_DATE - INTERVAL '7 days')
  LOOP
    days_until_expiry := doc.expires_at - CURRENT_DATE;
    
    -- Format document type name
    IF days_until_expiry <= 0 THEN
      v_title := INITCAP(REPLACE(doc.document_type, '_', ' ')) || ' Expired! ⚠️';
      v_description := 'Your document has expired. Please upload a new one to continue driving.';
    ELSIF days_until_expiry <= 7 THEN
      v_title := INITCAP(REPLACE(doc.document_type, '_', ' ')) || ' Expires in ' || days_until_expiry || ' Days';
      v_description := 'Urgent: Please renew your document soon to avoid service interruption.';
    ELSE
      v_title := INITCAP(REPLACE(doc.document_type, '_', ' ')) || ' Expiring Soon';
      v_description := 'Your document expires on ' || TO_CHAR(doc.expires_at, 'Mon DD, YYYY') || '. Plan to renew it.';
    END IF;
    
    -- Create notification
    INSERT INTO driver_notifications (driver_id, title, description, type, icon, action_url)
    VALUES (doc.driver_id, v_title, v_description, 'system', 'calendar-clock', '/profile');
    
    -- Mark as notified
    UPDATE driver_documents SET expiry_notified_at = NOW() WHERE id = doc.id;
    
    notify_count := notify_count + 1;
  END LOOP;
  
  RETURN notify_count;
END;
$$;

-- Create index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_driver_documents_expires_at 
ON driver_documents(expires_at) 
WHERE expires_at IS NOT NULL AND status = 'approved';;
